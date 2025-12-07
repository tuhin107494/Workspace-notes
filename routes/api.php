<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\NoteController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\WorkspaceController;

// Public routes
Route::post('register', [UserController::class, 'register']);
Route::post('login', [UserController::class, 'login']);



Route::get('notes', [NoteController::class, 'index']);

// Protected routes (require authentication)
Route::middleware('auth:api')->group(function () {

    // User
    Route::post('logout', [UserController::class, 'logout']);
    Route::put('profile/{user}', [UserController::class, 'update']);
    
    // Workspaces
    Route::get('workspaces', [WorkspaceController::class, 'index']); // List workspaces
    Route::post('workspaces', [WorkspaceController::class, 'store']); // Create workspace
    Route::get('workspaces/{workspace}', [WorkspaceController::class, 'show']); // View single
    Route::put('workspaces/{workspace}', [WorkspaceController::class, 'update']); // Update
    Route::delete('workspaces/{workspace}', [WorkspaceController::class, 'destroy']); // Delete

    // Notes
    Route::get('workspaces/{workspace}/notes', [NoteController::class, 'index']); // List notes
    Route::post('workspaces/{workspace}/notes', [NoteController::class, 'store']); // Create note
    Route::get('notes/{note}', [NoteController::class, 'show']); // View note
    Route::put('notes/{note}', [NoteController::class, 'update']); // Update note
    Route::delete('notes/{note}', [NoteController::class, 'destroy']); // Delete note
    Route::post('notes/{note}/vote', [NoteController::class, 'vote']); // Vote on a note

    // Tags (optional)
    Route::get('tags', [NoteController::class, 'tags']); // List all tags
});
