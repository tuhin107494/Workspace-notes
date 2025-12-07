<?php
namespace App\Console\Commands;

use Carbon\Carbon;
use App\Models\NoteHistory;
use Illuminate\Console\Command;

class DeleteOldNoteHistories extends Command
{
    protected $signature = 'notes:clean-history';
    protected $description = 'Delete note histories older than 7 days';

    public function handle()
    {
        // Delete in chunks to avoid memory overload
        NoteHistory::where('created_at', '<', Carbon::now()->subDays(7))
                   ->chunkById(1000, function ($histories) {
                       $histories->each->delete();
                   });

        $this->info("Old histories deleted successfully.");
    }
}
