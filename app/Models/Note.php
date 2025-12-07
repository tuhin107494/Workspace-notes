<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Note extends Model {
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

