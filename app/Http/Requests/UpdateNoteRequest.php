<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateNoteRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Only the owner of the note may update it
        $user = auth()->user();
        if (!$user) return false;

        $note = $this->route('note');
        if (!$note) return false;

        return ($note->user_id ?? $note->author_id ?? null) == $user->id;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
     public function rules() {
        return [
            'title'   => 'sometimes|string|max:255',
            'content' => 'sometimes|string',
            'type'    => 'sometimes|in:public,private',
            'is_draft'=> 'sometimes|boolean',
            'tags'    => 'sometimes|array',
            'tags.*'  => 'string|max:50'
        ];
    }
}
