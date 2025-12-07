<?php

namespace App\Models;

use App\Models\Note;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class NoteVote extends Model {
    protected $fillable = ['note_id', 'user_id', 'vote'];

    public function note() {
        return $this->belongsTo(Note::class);
    }

    public function user() {
        return $this->belongsTo(User::class); // voting company
    }
}
