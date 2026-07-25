<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreContactRequest;
use App\Http\Requests\UpdateContactRequest;
use App\Models\Contact;
use App\Repositories\Contracts\ContactRepositoryInterface;
use App\Traits\LogsActivity;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContactController extends Controller
{
    use LogsActivity;

    public function __construct(protected ContactRepositoryInterface $contacts)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $perPage = (int) $request->integer('per_page', 15);
        $search = $request->string('search')->value() ?: null;

        return response()->json($this->contacts->paginate($perPage, $search, ['user']));
    }

    public function store(StoreContactRequest $request): JsonResponse
    {
        $contact = $this->contacts->create($request->validated());

        $this->logActivity('contact_created', "Created contact {$contact->first_name} {$contact->last_name}");

        return response()->json($contact->load('user'), 201);
    }

    public function show(Contact $contact): JsonResponse
    {
        return response()->json($contact->load('user'));
    }

    public function update(UpdateContactRequest $request, Contact $contact): JsonResponse
    {
        $updated = $this->contacts->update($contact->contact_id, $request->validated());

        $this->logActivity('contact_updated', "Updated contact {$updated->first_name} {$updated->last_name}");

        return response()->json($updated->load('user'));
    }

    public function destroy(Contact $contact): JsonResponse
    {
        $this->logActivity('contact_deleted', "Deleted contact {$contact->first_name} {$contact->last_name}");

        $this->contacts->delete($contact->contact_id);

        return response()->json(null, 204);
    }
}
