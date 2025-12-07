<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;



class WorkspaceResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'name' => $this->name,
            'notes_count' => $this->notes_count ?? $this->notes()->count(),
            'description' => $this->description ?? null,
        ];
    }
}


