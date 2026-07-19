<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('payment_histories', function (Blueprint $table) {
            $table->uuid('history_id')->primary();
            $table->foreignUuid('payment_id')->constrained('payments', 'payment_id');
            $table->foreignUuid('debt_id')->constrained('debts', 'debt_id');
            $table->decimal('paid_amount', 12, 2);
            $table->string('payment_type');
            $table->string('remarks')->nullable();
            $table->decimal('remaining_amount', 12, 2);
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down()
    {
        Schema::dropIfExists('payment_histories');
    }
};
