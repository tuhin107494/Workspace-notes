<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class NoteHistoryResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'note_id' => $this->note_id,
            'previous_content' => $this->previous_content,
            'user' => $this->user->name,
            'created_at' => $this->created_at,
        ];
    }
}

