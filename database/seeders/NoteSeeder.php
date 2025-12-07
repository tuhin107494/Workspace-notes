<?php

namespace Database\Seeders;

use App\Models\Note;
use App\Models\User;
use App\Models\NoteVote;
use App\Models\Workspace;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Redis;

class NoteSeeder extends Seeder
{
    public function run(): void
    {
        $faker = \Faker\Factory::create();
        $tagsPool = ['howto', 'tips', 'internal', 'public', 'cli', 'api', 'design'];

        Workspace::all()->each(function (Workspace $ws) use ($faker, $tagsPool) {
            for ($i = 0; $i < 5000; $i++) {
                $note = Note::create([
                    'workspace_id' => $ws->id,
                    'user_id' => $ws->user_id,
                    'title' => ucfirst($faker->words(5, true)),
                    'content' => $faker->paragraphs(3, true),
                    'type' => $faker->randomElement(['public','private']),
                    'is_draft' => $faker->boolean(20),
                ]);

                // Add tags
                $tags = $faker->randomElements($tagsPool, rand(1, 3));
                foreach ($tags as $t) {
                    $note->tags()->create(['tag' => $t]);
                }

                // Add some votes from random users
                $voters = User::inRandomOrder()->take(rand(1,5))->get();
                foreach ($voters as $user) {
                    NoteVote::updateOrCreate(
                        ['note_id' => $note->id, 'user_id' => $user->id],
                        ['vote' => $faker->randomElement(['up','down'])]
                    );
                }
            }
        });

        // Rebuild Redis indexes from DB counts
        $this->rebuildRedisScores();
    }

    protected function rebuildRedisScores()
    {
        // For each note compute up/down from DB and store in Redis + update sorted-sets
        Note::with('votes')->chunk(200, function ($notes) {
            foreach ($notes as $note) {
                $up = $note->votes->where('vote', 'up')->count();
                $down = $note->votes->where('vote', 'down')->count();

                Redis::hset("note:{$note->id}:votes", 'up', $up);
                Redis::hset("note:{$note->id}:votes", 'down', $down);

                $score = $up - $down;
                Redis::zadd('notes:score', $score, $note->id);
                if ($note->workspace_id) {
                    Redis::zadd("workspace:{$note->workspace_id}:notes:score", $score, $note->id);
                }
            }
        });
    }
}
