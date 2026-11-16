<?php
// The deployment builder replaces this marker with a unique installation key.
// Read the generated config.php in Hostinger's File Manager to copy your key.
// The key works only until the first admin account has been created.
return [
    'installation_key' => '__INSTALLATION_KEY__',
    // Private storage lives alongside public_html, not inside the public website.
    'data_directory' => dirname(__DIR__) . '/mercyforhumanity-data',
    // Optional external donation destination. Leave empty until confirmed.
    'donation_url' => '',
];
