<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('notes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workspace_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete(); // owner company
            $table->string('title');
            $table->text('content');
            $table->enum('type', ['public', 'private'])->default('private');
            $table->boolean('is_draft')->default(true);
            $table->timestamps();

            // Indexes for performance
            $table->index('workspace_id');
            $table->index('user_id');
            $table->index('type');
            $table->index('is_draft');
            $table->index(['title']);
            $table->index(['type', 'is_draft']); // common query filter
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notes');
    }
};
