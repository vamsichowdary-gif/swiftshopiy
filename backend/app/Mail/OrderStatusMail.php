<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OrderStatusMail extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * @param string $status 'Placed' | 'Shipped' | 'Delivered' | 'Cancelled'
     */
    public function __construct(
        public string $customerName,
        public string $orderId,
        public string $status,
        public array $items = [],
        public string $totalAmount = '',
        public ?string $trackingLink = null
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Update on Order #{$this->orderId}: {$this->status} - SwiftShopiy",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.order-status',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}