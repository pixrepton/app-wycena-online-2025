<?php
/**
 * PDF Generator - WYCENA 2025
 * Generates PDF offers from calculation data
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
    
    // Log received data
    error_log("PDF generation request: " . json_encode($data));
    
    // Extract calculation data
    $buildingData = $data['buildingData'] ?? [];
    $pumpData = $data['pumpData'] ?? [];
    $pricing = $data['pricing'] ?? [];
    
    // Generate HTML content for PDF
    $htmlContent = generatePDFTemplate($buildingData, $pumpData, $pricing);
    
    // For now, return the HTML content (client-side PDF generation)
    echo json_encode([
        'success' => true,
        'htmlContent' => $htmlContent,
        'message' => 'PDF template generated successfully'
    ]);
    
} catch (Exception $e) {
    error_log("PDF generation error: " . $e->getMessage());
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}

function generatePDFTemplate($buildingData, $pumpData, $pricing) {
    $date = date('d.m.Y');
    $time = date('H:i');
    
    $powierzchnia = $buildingData['powierzchnia'] ?? 'Nie podano';
    $mocObliczona = $buildingData['mocObliczona'] ?? 'Nie obliczono';
    $typBudynku = $buildingData['typBudynku'] ?? 'Dom jednorodzinny';
    
    $recommendedKit = $pumpData['kit'] ?? 'Do ustalenia';
    $buffer = $pumpData['buffer'] ?? 'Standardowy';
    $cwu = $pumpData['cwu'] ?? 'Standardowe';
    
    $priceTotal = $pricing['total'] ?? 'Do wyceny';
    
    return "
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset='UTF-8'>
        <title>Oferta TOP-INSTAL</title>
        <style>
            body { 
                font-family: 'Segoe UI', Arial, sans-serif; 
                margin: 20px; 
                color: #333; 
                line-height: 1.6;
            }
            .header { 
                text-align: center; 
                border-bottom: 3px solid #C20118; 
                padding-bottom: 20px; 
                margin-bottom: 30px; 
            }
            .logo { 
                font-size: 28px; 
                font-weight: bold; 
                color: #C20118; 
                margin-bottom: 10px; 
            }
            .section { 
                margin-bottom: 25px; 
                padding: 15px; 
                border-left: 4px solid #C20118; 
                background: #f9f9f9; 
            }
            .section h3 { 
                margin-top: 0; 
                color: #C20118; 
            }
            .data-row { 
                display: flex; 
                justify-content: space-between; 
                margin: 8px 0; 
                padding: 5px 0; 
                border-bottom: 1px dotted #ccc; 
            }
            .footer { 
                margin-top: 40px; 
                text-align: center; 
                font-size: 12px; 
                color: #666; 
                border-top: 1px solid #ccc; 
                padding-top: 20px; 
            }
        </style>
    </head>
    <body>
        <div class='header'>
            <div class='logo'>TOP-INSTAL</div>
            <h1>Oferta Pompy Ciepła Panasonic</h1>
            <p>Data: $date, Godzina: $time</p>
        </div>
        
        <div class='section'>
            <h3>📋 Dane Budynku</h3>
            <div class='data-row'>
                <span>Powierzchnia ogrzewana:</span>
                <strong>$powierzchnia m²</strong>
            </div>
            <div class='data-row'>
                <span>Typ budynku:</span>
                <strong>$typBudynku</strong>
            </div>
            <div class='data-row'>
                <span>Obliczona moc grzewcza:</span>
                <strong>$mocObliczona kW</strong>
            </div>
        </div>
        
        <div class='section'>
            <h3>🔧 Rekomendowane Urządzenia</h3>
            <div class='data-row'>
                <span>Pompa ciepła:</span>
                <strong>$recommendedKit</strong>
            </div>
            <div class='data-row'>
                <span>Zbiornik buforowy:</span>
                <strong>$buffer</strong>
            </div>
            <div class='data-row'>
                <span>Przygotowanie CWU:</span>
                <strong>$cwu</strong>
            </div>
        </div>
        
        <div class='section'>
            <h3>💰 Wycena</h3>
            <div class='data-row'>
                <span>Wartość całkowita:</span>
                <strong style='color: #C20118; font-size: 18px;'>$priceTotal</strong>
            </div>
        </div>
        
        <div class='footer'>
            <p><strong>TOP-INSTAL</strong> | Profesjonalne instalacje grzewcze</p>
            <p>www.top-instal.pl | kontakt@top-instal.pl</p>
            <p>Oferta wygenerowana automatycznie przez kalkulator online</p>
        </div>
    </body>
    </html>";
}
?>