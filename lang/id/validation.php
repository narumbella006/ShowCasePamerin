<?php

return [
    'required' => ':attribute wajib diisi.',
    'string' => ':attribute harus berupa teks.',
    'integer' => ':attribute harus berupa angka.',
    'boolean' => ':attribute harus bernilai ya atau tidak.',
    'array' => ':attribute harus berupa daftar.',
    'url' => ':attribute harus berupa tautan yang valid.',
    'email' => ':attribute harus berupa alamat email yang valid.',
    'image' => ':attribute harus berupa gambar.',
    'in' => 'Pilihan :attribute tidak valid.',
    'exists' => 'Pilihan :attribute tidak valid.',
    'unique' => ':attribute sudah dipakai.',
    'regex' => 'Format :attribute tidak valid.',
    'confirmed' => 'Konfirmasi :attribute tidak cocok.',
    'mimes' => ':attribute harus berformat: :values.',

    'max' => [
        'numeric' => ':attribute maksimal :max.',
        'file' => ':attribute maksimal :max kilobyte.',
        'string' => ':attribute maksimal :max karakter.',
        'array' => ':attribute maksimal :max item.',
    ],

    'min' => [
        'numeric' => ':attribute minimal :min.',
        'file' => ':attribute minimal :min kilobyte.',
        'string' => ':attribute minimal :min karakter.',
        'array' => ':attribute minimal :min item.',
    ],

    'custom' => [
        'attribute-name' => [
            'rule-name' => 'custom-message',
        ],
    ],

    'attributes' => [],
];
