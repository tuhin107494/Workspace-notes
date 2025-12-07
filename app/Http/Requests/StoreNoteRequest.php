<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreNoteRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Only authenticated users who own the workspace may create notes in it
        $user = auth()->user();
        if (!$user) return false;

        $workspaceId = $this->input('workspaceId') ?? $this->route('workspace');
        if (!$workspaceId) return true; // let validator handle missing workspace_id

        return \App\Models\Workspace::where('id', $workspaceId)->where('user_id', $user->id)->exists();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
     public function rules() {
        return [
            'workspaceId' => 'required|exists:workspaces,id',
            'title'        => 'required|string|max:255',
            'content'      => 'required|string',
            'type'         => 'required|in:public,private',
            'is_draft'     => 'sometimes|boolean',
            'tags'         => 'array',
            'tags.*'       => 'string|max:50'
        ];
    }
}
