<?php

namespace App\Services;

use App\Models\Note;
use App\Models\User;
use App\Models\NoteVote;
use Illuminate\Support\Facades\Redis;

class VoteService
{
    protected function countsKey(int $noteId): string
    {
        return "note:{$noteId}:votes";
    }

    protected function votersKey(int $noteId): string
    {
        return "note:{$noteId}:voters";
    }

    /**
     * Record a user's vote in Redis and persist the upsert in the DB.
     * Returns an array with new counts: ['up' => int, 'down' => int]
     */
    public function vote(Note $note, User $user, string $voteType): array
    {
        $noteId = (int) $note->id;
        $countsKey = $this->countsKey($noteId);
        $votersKey = $this->votersKey($noteId);

        $userId = (string) $user->id;

        // current vote stored for this user in redis (if any)
        $existing = Redis::hget($votersKey, $userId);

        // If same vote, nothing to do
        if ($existing === $voteType) {
            $vals = Redis::hgetall($countsKey);
            return [
                'up' => (int) ($vals['up'] ?? 0),
                'down' => (int) ($vals['down'] ?? 0),
            ];
        }

        // Begin adjustments
        if ($existing === null) {
            // new vote
            Redis::hincrby($countsKey, $voteType, 1);
            Redis::hset($votersKey, $userId, $voteType);
        } else {
            // change vote from existing -> voteType
            Redis::hincrby($countsKey, $voteType, 1);
            Redis::hincrby($countsKey, $existing, -1);
            Redis::hset($votersKey, $userId, $voteType);
        }

        // Persist/upsert to DB (best-effort, keep Redis as source of truth for counts)
        try {
            NoteVote::updateOrCreate(
                ['note_id' => $noteId, 'user_id' => $user->id],
                ['vote' => $voteType]
            );
        } catch (\Throwable $e) {
            // swallow DB errors to avoid breaking the fast path; logs will capture if configured
        }

        // Recompute counts and update sorted-set indexes for ranking
        $vals = Redis::hgetall($countsKey);
        $upCount = (int) ($vals['up'] ?? 0);
        $downCount = (int) ($vals['down'] ?? 0);
        $score = $upCount - $downCount;

        // global popularity index
        Redis::zadd('notes:score', $score, $noteId);

        // workspace-scoped index
        if (! empty($note->workspace_id)) {
            Redis::zadd("workspace:{$note->workspace_id}:notes:score", $score, $noteId);
        }

        return [
            'up' => $upCount,
            'down' => $downCount,
        ];
    }

    public function getCounts(Note $note): array
    {
        $vals = Redis::hgetall($this->countsKey((int)$note->id));
        return [
            'up' => (int) ($vals['up'] ?? 0),
            'down' => (int) ($vals['down'] ?? 0),
        ];
    }
}
