<?php

namespace App\Repositories;

use App\Models\PaymentHistory;
use App\Repositories\Contracts\PaymentHistoryRepositoryInterface;

class PaymentHistoryRepository extends BaseRepository implements PaymentHistoryRepositoryInterface
{
    protected array $searchable = ['payment_type', 'remarks'];

    public function __construct(PaymentHistory $model)
    {
        parent::__construct($model);
    }
}
