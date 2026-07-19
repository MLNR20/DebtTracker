<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('debts', function (Blueprint $table) {
            $table->uuid('debt_id')->primary();
            $table->foreignUuid('expense_id')->nullable()->constrained('group_expenses', 'expense_id');
            $table->foreignUuid('creditor_id')->constrained('users', 'user_id');
            $table->foreignUuid('debtor_user_id')->nullable()->constrained('users', 'user_id');
            $table->foreignUuid('debtor_contact_id')->nullable()->constrained('contacts', 'contact_id');
            $table->decimal('total_amount', 12, 2);
            $table->decimal('remaining_amount', 12, 2);
            $table->string('description')->nullable();
            $table->timestamp('due_date')->nullable();
            $table->string('status');
            $table->timestamp('date_created')->useCurrent();
            $table->timestamp('date_updated')->useCurrent()->useCurrentOnUpdate();
            $table->boolean('is_deleted')->default(false);
        });
    }

    public function down()
    {
        Schema::dropIfExists('debts');
    }
};
