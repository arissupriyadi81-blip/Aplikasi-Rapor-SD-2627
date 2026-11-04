<?php
/**
 * Konfigurasi Database PDO - E-Rapor SD AJ (IAS Al-Jannah)
 * Kompatibel dengan XAMPP, Laragon, & Hosting MySQL/MariaDB
 */

date_default_timezone_set('Asia/Jakarta');

$db_host = getenv('DB_HOST') ?: '127.0.0.1';
$db_port = getenv('DB_PORT') ?: '3306';
$db_name = getenv('DB_NAME') ?: 'erapor_sd_aj';
$db_user = getenv('DB_USER') ?: 'root';
$db_pass = getenv('DB_PASS') ?: '';

$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
    PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
];

try {
    $pdo = new PDO("mysql:host={$db_host};port={$db_port};dbname={$db_name};charset=utf8mb4", $db_user, $db_pass, $options);
} catch (PDOException $e) {
    // Sembunyikan detail teknis di produksi
    error_log("Database Connection Error: " . $e->getMessage());
    die(json_encode([
        'status' => 'error',
        'message' => 'Gagal terhubung ke database MySQL. Pastikan database erapor_sd_aj sudah diimpor dan service MySQL berjalan.'
    ]));
}

/**
 * Helper untuk format tanggal Indonesia
 */
function tgl_indo($tanggal) {
    if (!$tanggal || $tanggal == '0000-00-00') return '-';
    $bulan = [
        1 => 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    $pecahkan = explode('-', substr($tanggal, 0, 10));
    return $pecahkan[2] . ' ' . $bulan[(int)$pecahkan[1]] . ' ' . $pecahkan[0];
}
