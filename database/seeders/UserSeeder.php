<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Main test user
        User::factory()->create([
            'name' => 'Dev User',
            'email' => 'dev@example.test',
            'company_name' => 'DevCo',
            'password' => bcrypt('password'),
        ]);

        // Additional users
        User::factory()->count(10)->create();
    }
}
