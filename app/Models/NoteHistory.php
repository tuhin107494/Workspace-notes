<?php
namespace App\Models;

use App\Models\Note;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class NoteHistory extends Model
{
    use HasFactory;

    protected $fillable = [
        'note_id',
        'user_id',
        'previous_content',
    ];

    // Relationships
    public function note()
    {
        return $this->belongsTo(Note::class);
    }

    public function user()
    {
        return $this->belongsTo(\App\Models\User::class);
    }

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];
}
