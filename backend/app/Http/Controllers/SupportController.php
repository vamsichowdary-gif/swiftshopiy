<?php

namespace App\Http\Controllers;

use App\Models\SupportTicket;
use Illuminate\Http\Request;

class SupportController extends Controller
{
    public function index(Request $request)
    {
        return response()->json(
            SupportTicket::where('user_id', $request->user()->id)->latest()->get()
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'subject' => 'required|string|max:150',
            'message' => 'required|string|min:5|max:5000',
        ]);

        $ticket = SupportTicket::create([
            ...$validated,
            'user_id' => $request->user()->id,
            'status' => 'Open',
        ]);

        return response()->json(['message' => 'Support request submitted.', 'ticket' => $ticket], 201);
    }

    public function adminIndex()
    {
        return response()->json(
            SupportTicket::with('user:id,user_id,username,name,email')->latest()->get()
        );
    }

    public function update(Request $request, SupportTicket $ticket)
    {
        $validated = $request->validate([
            'status' => 'required|in:Open,In Progress,Resolved',
            'admin_response' => 'nullable|string|max:5000',
        ]);

        $ticket->update($validated);

        return response()->json($ticket->load('user:id,user_id,username,name,email'));
    }
}
