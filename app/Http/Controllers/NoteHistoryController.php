<?php
namespace App\Http\Controllers\API;

use App\Models\Note;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Resources\HistoryResource;
use App\Http\Resources\NoteHistoryResource;

class NoteHistoryController extends Controller
{
    /**
     * List histories for a note with manual cursor pagination.
     */
    public function index(Request $request, Note $note)
    {
        $perPage = $request->query('per_page', 20); // default 20
        $lastId = $request->query('last_id'); // cursor for last seen history

        $query = $note->histories()->with('user')->orderBy('id', 'desc'); // newest first

        if ($lastId) {
            $query->where('id', '<', $lastId); // fetch older entries
        }

        $histories = $query->limit($perPage)->get();

        $nextCursor = $histories->last()?->id;

        return response()->json([
            'data' => NoteHistoryResource::collection($histories),
            'next_cursor' => $nextCursor,
            'per_page' => $perPage
        ]);
    }

    /**
     * Restore a note from a specific history entry
     */
    public function restore(Note $note, $historyId)
    {
        $history = $note->histories()->findOrFail($historyId);

        // Save current content as a new history
        $note->histories()->create([
            'user_id' => auth()->id(),
            'previous_content' => $note->content,
        ]);

        // Restore content
        $note->update(['content' => $history->previous_content]);

        return response()->json([
            'message' => 'Note restored successfully',
            'note' => $note->fresh()
        ]);
    }
}
