<?php

namespace App\Traits;

use App\Models\Log;

trait LogsActivity
{
    protected function logActivity(string $type, string $details): void
    {
        $userId = auth()->id();

        if (! $userId) {
            return;
        }

        Log::create([
            'user_id' => $userId,
            'logs_type' => $type,
            'logs_details' => $details,
        ]);
    }
}
