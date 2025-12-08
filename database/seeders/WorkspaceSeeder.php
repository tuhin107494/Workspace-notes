<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Workspace;
use Illuminate\Database\Seeder;

class WorkspaceSeeder extends Seeder
{
    public function run(): void
    {
        // Create one workspace per user
        User::all()->each(function (User $user) {
            Workspace::create([
                'user_id' => $user->id,
                'name' => $user->company_name ?: ($user->name . "'s Workspace"),
            ]);
        });
    }
}
