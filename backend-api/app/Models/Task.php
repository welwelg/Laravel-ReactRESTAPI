<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    use HasFactory;

    // Ito lang ang mga columns na pwedeng galawin ng user via API
    protected $fillable = [
        'title',
        'description',
        'is_completed',
    ];
}
