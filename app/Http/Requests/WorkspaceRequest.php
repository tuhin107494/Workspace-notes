<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class WorkspaceRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->check();
    }

    /**
     * Get the validation rules that apply to the request.
     * For `POST` (store) the `name` is required. For `PUT/PATCH` (update)
     * the rules allow `sometimes` so partial updates are accepted.
     */
    public function rules(): array
    {
        $isStore = $this->isMethod('post');

        return [
            'name' => [$isStore ? 'required' : 'sometimes', 'string', 'min:3', 'max:255'],
        ];
    }

    /**
     * Customize the validation messages (optional)
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Please provide a workspace name (3+ characters).',
        ];
    }
}
