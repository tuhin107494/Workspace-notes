<?php

namespace App\Http\Resources;

use Illuminate\Support\Facades\Redis;
use Illuminate\Http\Resources\Json\JsonResource;

class NoteResource extends JsonResource
{
    public function toArray($request)
    {
        // Prefer Redis counts if available, fall back to DB relationship counts.
        $countsKey = "note:{$this->id}:votes";
        $vals = Redis::hgetall($countsKey);

        $up = null;
        $down = null;

        if (!empty($vals)) {
            $up = (int) ($vals['up'] ?? 0);
            $down = (int) ($vals['down'] ?? 0);
        }

        return [
            'id' => $this->id,
            'workspace' => [
                'id' => $this->workspace->id,
                'name' => $this->workspace->name,
            ],
            'title' => $this->title,
            'content' => $this->content,
            // use the actual column names from the migration
            'type' => $this->type,
            'is_draft' => (bool) $this->is_draft,
            // note_tags table stores the tag string in `tag` column
            'tags' => $this->tags->pluck('tag'),
            'votes' => [
                'up' => $up ?? $this->votes->where('vote','up')->count(),
                'down' => $down ?? $this->votes->where('vote','down')->count(),
            ],
            'history' => $this->whenLoaded('histories', function () {
                // return histories newest-first
                return $this->histories->sortByDesc('created_at')->map(function($h) {
                    return [
                        'id' => (string) $h->id,
                        'noteId' => (string) ($h->note_id ?? $this->id),
                        'content' => $h->previous_content ?? $h->content ?? '',
                        'updatedBy' => $h->user_id ?? null,
                        'timestamp' => (string) $h->created_at,
                    ];
                })->values();
            }),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
