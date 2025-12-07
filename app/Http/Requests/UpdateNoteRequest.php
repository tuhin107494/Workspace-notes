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
        return false;
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
            'tags'    => 'sometimes|array',
            'tags.*'  => 'string|max:50'
        ];
    }
}
