<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Database\Seeders\UserSeeder;
use Database\Seeders\WorkspaceSeeder;
use Database\Seeders\NoteSeeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // call our seeders in order
        $this->call([
            UserSeeder::class,
            WorkspaceSeeder::class,
            NoteSeeder::class,
        ]);
    }
}
