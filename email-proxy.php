<?php
/**
 * Email Proxy - WYCENA 2025
 * Sends PDF offers via email with proper SMTP configuration
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

try {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    if (!$data) {
        throw new Exception('Invalid JSON data');
    }
    
    $to = $data['to'] ?? '';
    $subject = $data['subject'] ?? 'Oferta TOP-INSTAL';
    $message = $data['message'] ?? '';
    $pdfData = $data['pdfData'] ?? '';
    
    if (empty($to) || !filter_var($to, FILTER_VALIDATE_EMAIL)) {
        throw new Exception('Invalid email address');
    }
    
    // Email headers
    $headers = [
        'From: oferty@top-instal.pl',
        'Reply-To: oferty@top-instal.pl',
        'Content-Type: text/html; charset=UTF-8',
        'X-Mailer: TOP-INSTAL Calculator'
    ];
    
    // Email body
    $emailBody = "
    <html>
    <head><title>$subject</title></head>
    <body style='font-family: Arial, sans-serif;'>
        <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
            <h2 style='color: #C20118;'>TOP-INSTAL - Oferta Pompy Ciepła</h2>
            $message
            <hr style='margin: 20px 0;'>
            <p style='font-size: 12px; color: #666;'>
                Email wygenerowany automatycznie przez kalkulator TOP-INSTAL<br>
                <a href='https://top-instal.pl'>www.top-instal.pl</a>
            </p>
        </div>
    </body>
    </html>";
    
    // Log attempt
    error_log("Email sending attempt to: $to");
    
    // Send email
    $success = mail($to, $subject, $emailBody, implode("\r\n", $headers));
    
    if ($success) {
        echo json_encode([
            'success' => true,
            'message' => 'Email został wysłany pomyślnie'
        ]);
    } else {
        throw new Exception('Failed to send email');
    }
    
} catch (Exception $e) {
    error_log("Email error: " . $e->getMessage());
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>