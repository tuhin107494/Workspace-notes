<?php

namespace App\Models;

use App\Models\Note;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class Workspace extends Model {
    protected $fillable = ['user_id', 'name', 'description'];
    public function user() {
        return $this->belongsTo(User::class);
    }

    public function notes() {
        return $this->hasMany(Note::class);
    }
}
