<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Workspace;
use App\Models\User;

class WorkspaceSeeder extends Seeder
{
    public function run(): void
    {
        // Create one workspace per user
        User::all()->each(function (User $user) {
            Workspace::create([
                'user_id' => $user->id,
                'name' => $user->company_name ?: ($user->name . "'s Workspace"),
                'description' => null,
            ]);
        });
    }
}
