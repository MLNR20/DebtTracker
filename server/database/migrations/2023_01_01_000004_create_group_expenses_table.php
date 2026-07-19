<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('group_expenses', function (Blueprint $table) {
            $table->uuid('expense_id')->primary();
            $table->foreignUuid('group_id')->constrained('groups', 'group_id');
            $table->foreignUuid('paid_by_user_id')->constrained('users', 'user_id');
            $table->decimal('total_amount', 12, 2);
            $table->string('description')->nullable();
            $table->string('split_type');
            $table->timestamp('date_incurred');
            $table->timestamp('date_created')->useCurrent();
            $table->boolean('is_deleted')->default(false);
        });
    }

    public function down()
    {
        Schema::dropIfExists('group_expenses');
    }
};
