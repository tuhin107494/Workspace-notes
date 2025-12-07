<?php



namespace App\Http\Controllers;

use App\Models\Note;

use App\Models\Workspace;
use Illuminate\Http\Request;
use App\Services\VoteService;
use App\Http\Requests\NoteRequest;
use App\Http\Controllers\Controller;
use App\Http\Resources\NoteResource;
use Illuminate\Support\Facades\Redis;
use App\Http\Requests\StoreNoteRequest;
use App\Http\Requests\UpdateNoteRequest;

class NoteController extends Controller
{
    /**
     * Display a listing of notes with manual cursor pagination.
     */
    public function index(Request $request)
    {
        $payload = $this->fetchNotes($request);

        return response()->json([
            'data' => NoteResource::collection($payload['items']),
            'next_cursor' => $payload['next_cursor'],
            'per_page' => $payload['per_page'],
        ]);
    }


    public function store(StoreNoteRequest $request)
    {
        $requestedData = $request->validated();
        $note = Note::create([
            'workspace_id' => $requestedData['workspaceId'],
            'title' => $requestedData['title'],
            'content' => $requestedData['content'],
            'type' => $requestedData['type'],
            'is_draft' => isset($requestedData['is_draft']) ? (bool) $requestedData['is_draft'] : true,
            'user_id' => auth()->id(),
        ]);

        if ($request->has('tags')) {
            $tags = $this->processTags($request->tags);
            // createMany expects an array of arrays like [['tag' => 'foo'], ...]
            $note->tags()->createMany($tags);
        }

        return new NoteResource($note->load(['workspace', 'tags', 'votes', 'histories']));
    }

    public function show(Note $note)
    {
        return new NoteResource($note->load(['workspace', 'tags', 'votes', 'histories']));
    }

    public function update(UpdateNoteRequest $request, Note $note)
    {
        // Save history
        if ($request->filled('content')) {
            $note->histories()->create([
                'user_id' => auth()->id(),
                'previous_content' => $note->content,
            ]);
        }

        $note->update($request->validated());

        if ($request->has('tags')) {
            // Replace existing tags with the provided set
            $note->tags()->delete();
            $tags = $this->processTags($request->tags);
            $note->tags()->createMany($tags);
        }

        return new NoteResource($note->load(['workspace', 'tags', 'votes', 'histories']));
    }

    public function destroy(Note $note)
    {
        $note->delete();
        return response()->json(['message' => 'Note deleted successfully']);
    }

    /**
     * Record an upvote/downvote for a note (uses Redis for fast counters).
     */
    public function vote(Request $request, Note $note, VoteService $votes)
    {
        $data = $request->validate([
            'vote' => ['required', 'string', 'in:up,down'],
        ]);

        $user = $request->user('api');
        if (!$user) {
            return response()->json(['message' => 'Authentication required'], 401);
        }

        $result = $votes->vote($note, $user, $data['vote']);

        return response()->json(['data' => ['votes' => $result]]);
    }

    /**
     * Shared helper to build and fetch notes according to request params.
     * Returns an array: ['items' => Collection, 'next_cursor' => ?int, 'per_page' => int]
     */
    private function fetchNotes(Request $request): array
    {
        $perPage = $request->query('per_page', 20); // default 20
        $lastId = $request->query('last_id'); // last note id seen

        $query = Note::with(['workspace', 'tags', 'votes'])->orderBy('id', 'asc');

        // Determine workspace scope from route or query
        $workspaceParam = $request->route('workspace') ?? $request->query('workspaceId');

        if ($workspaceParam) {
            $query->where('workspace_id', $workspaceParam);

            // If the authenticated user owns the workspace, allow drafts to be visible
            $user = $request->user('api');
            if ($user) {
                $ws = Workspace::find($workspaceParam);
                if (!$ws || $ws->user_id !== $user->id) {
                    $query->where('is_draft', false);
                }
            } else {
                $query->where('is_draft', false);
            }
        } else {
            // Global/public listing -> only published notes
            $query->where('is_draft', false);
        }

        if ($lastId) {
            $query->where('id', '>', $lastId);
        }

        // Optional search
        if ($request->has('search')) {
            $query->where('title', 'like', '%' . $request->search . '%');
        }


        $sort = $request->query('sort');

        if ($sort === 'upvotes') {
            $rankingKey = $workspaceParam ? "workspace:{$workspaceParam}:notes:score" : 'notes:score';
            try {
                $ids = Redis::zrevrange($rankingKey, 0, $perPage - 1);
            } catch (\Throwable $e) {
                $ids = [];
            }

            if (!empty($ids)) {
                $notes = Note::with(['workspace', 'tags', 'votes'])
                    ->whereIn('id', $ids)
                    ->get()
                    ->values();

                $ordered = collect($ids)->map(fn($id) => $notes->firstWhere('id', $id))->filter()->values();
                $nextCursor = $ordered->last()?->id;
                return ['items' => $ordered, 'next_cursor' => $nextCursor, 'per_page' => $perPage];
            }

            // fallback to DB
            $query->withCount(['votes as upvotes_count' => fn($q) => $q->where('vote', 'up')])
                ->orderBy('upvotes_count', 'desc');
        } elseif ($sort === 'downvotes') {
            $query->withCount(['votes as downvotes_count' => fn($q) => $q->where('vote', 'down')])
                ->orderBy('downvotes_count', 'desc');
        } elseif ($sort === 'new') {
            $query->orderBy('created_at', 'desc'); // newest first
        } elseif ($sort === 'old') {
            $query->orderBy('created_at', 'asc'); // oldest first
        } else {
            $query->orderBy('id', 'asc'); // default fallback
        }

        $notes = $query->limit($perPage)->get();

        return [
            'items' => $notes,
            'next_cursor' => $notes->last()?->id,
            'per_page' => $perPage
        ];
    }

    /**
     * Process tags array into suitable format for createMany.
     */
    private function processTags(array $tags): array
    {
        // NoteTag table uses the `tag` column for the tag string
        return array_map(fn($tag) => ['tag' => (string) $tag], $tags);
    }
}
