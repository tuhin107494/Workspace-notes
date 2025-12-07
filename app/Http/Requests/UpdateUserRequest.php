<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateUserRequest extends FormRequest
{
    public function authorize()
    {
        // Only the authenticated user can update their profile
        return auth()->check() && $this->route('user')->id === auth()->id();
    }

    public function rules()
    {
        $userId = $this->route('user')->id;

        return [
            'name'     => 'sometimes|string|max:255',
            'email'    => 'sometimes|email|unique:users,email,' . $userId,
            'password' => 'sometimes|string|min:6|confirmed',
        ];
    }
}
