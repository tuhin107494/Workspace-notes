<?php

namespace App\Http\Controllers;

use App\Models\Workspace;
 
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Requests\WorkspaceRequest;

class WorkspaceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        

        $limit = (int) $request->input('limit', 20);
        $cursor = $request->input('cursor');

        $query = Workspace::orderBy('id', 'asc')->withCount('notes');
        
        if ($cursor) {
            $query->where('id', '>', (int) $cursor);
        }

        $items = $query->limit($limit + 1)->get();

        $hasMore = $items->count() > $limit;
        $nextCursor = null;

        if ($hasMore) {
            $extra = $items->pop();
            $nextCursor = $extra->id;
        }

        return response()->json([
            'data' => \App\Http\Resources\WorkspaceResource::collection($items),
            'next_cursor' => $nextCursor,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(WorkspaceRequest $request)
    {
        $userId = auth()->id();
        if (!$userId) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $data = $request->validated();

        $workspace = Workspace::create([
            'user_id' => $userId,
            'name' => $data['name'],
        ]);

        return response()->json(['data' => new \App\Http\Resources\WorkspaceResource($workspace)], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $userId = auth()->id();
        if (!$userId) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $workspace = Workspace::find($id);
        if (!$workspace) {
            return response()->json(['message' => 'Workspace not found'], 404);
        }

        if ($workspace->user_id !== $userId) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return response()->json(['data' => new \App\Http\Resources\WorkspaceResource($workspace)]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(WorkspaceRequest $request, string $id)
    {
        $userId = auth()->id();
        if (!$userId) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $workspace = Workspace::find($id);
        if (!$workspace) {
            return response()->json(['message' => 'Workspace not found'], 404);
        }

        if ($workspace->user_id !== $userId) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $data = $request->validated();
        $workspace->fill(array_intersect_key($data, array_flip(['name', 'description'])))->save();

        return response()->json(['data' => new \App\Http\Resources\WorkspaceResource($workspace)]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $userId = auth()->id();
        if (!$userId) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $workspace = Workspace::find($id);
        if (!$workspace) {
            return response()->json(['message' => 'Workspace not found'], 404);
        }

        if ($workspace->user_id !== $userId) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $workspace->delete();
        return response()->json(null, 204);
    }
}
