<?php
namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Workspace;
use Tymon\JWTAuth\Facades\JWTAuth;
use Illuminate\Support\Facades\Hash;
use App\Http\Requests\LoginUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Requests\RegisterUserRequest;

class UserController extends Controller
{
    // Register
    public function register(RegisterUserRequest $request)
    {
        $data = $request->validated();
        $user = User::create([
            'name' => $data['name'],
            'company_name' => $data['company_name'] ?? null,
            'email' => $data['email'],
            'password' => bcrypt($data['password']),
        ]);

        // Create a default workspace for the new user's company
        try {
            Workspace::create([
                'user_id' => $user->id,
                'name' => $data['company_name'] ? $data['company_name'] . ' Workspace' : 'Default Workspace',
            ]);
        } catch (\Throwable $e) {
            // Don't block registration on workspace creation failure
        }

        $token = JWTAuth::fromUser($user);
        return response()->json(['user'=>$user, 'token'=>$token]);
    }

    // Login
    public function login(LoginUserRequest $request)
    {
        $credentials = $request->validated();

        if (!$token = JWTAuth::attempt($credentials)) {
            return response()->json(['error' => 'Invalid credentials'], 401);
        }

        return response()->json(['token'=>$token, 'user'=>auth()->user()]);
    }

    // Profile / update
    public function update(UpdateUserRequest $request, User $user)
    {
        $data = $request->validated();
        if(isset($data['password'])){
            $data['password'] = bcrypt($data['password']);
        }

        $user->update($data);

        return response()->json(['user'=>$user]);
    }

    // Logout
    public function logout()
    {
        JWTAuth::invalidate(JWTAuth::getToken());
        return response()->json(['message'=>'Logged out successfully']);
    }
}
