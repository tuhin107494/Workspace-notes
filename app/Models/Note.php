<?php

namespace App\Models;

use App\Models\User;
use App\Models\NoteTag;
use App\Models\NoteVote;
use App\Models\Workspace;
use App\Models\NoteHistory;
use Illuminate\Database\Eloquent\Model;

class Note extends Model {
    protected $fillable = ['workspace_id', 'user_id', 'title', 'content', 'type', 'is_draft'];

    /**
     * Cast boolean-ish columns to native types
     */
    protected $casts = [
        'is_draft' => 'boolean',
    ];
    public function workspace() {
        return $this->belongsTo(Workspace::class);
    }

    public function user() {
        return $this->belongsTo(User::class); // owner company
    }

    public function votes() {
        return $this->hasMany(NoteVote::class);
    }

    public function tags() {
        return $this->hasMany(NoteTag::class);
    }

    public function histories() {
        return $this->hasMany(NoteHistory::class);
    }
}

