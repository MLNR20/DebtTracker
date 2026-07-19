<?php

namespace App\Repositories;

use App\Models\Contact;
use App\Repositories\Contracts\ContactRepositoryInterface;

class ContactRepository extends BaseRepository implements ContactRepositoryInterface
{
    protected array $searchable = ['first_name', 'last_name', 'email', 'contact_no'];

    public function __construct(Contact $model)
    {
        parent::__construct($model);
    }
}
