<?php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RegisterUserRequest extends FormRequest
{
    public function authorize()
    {
        // Anyone can register
        return true;
    }

    public function rules()
    {
        return [
            'name'         => 'required|string|min:4|max:255',
            'company_name' => 'required|string|min:6|max:255',
            'email'        => 'required|email|unique:users,email',
            'password'     => 'required|string|min:6|confirmed', // password_confirmation field required
        ];
    }
}

