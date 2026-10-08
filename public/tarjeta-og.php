<?php
/**
 * Vista previa (Open Graph) de la tarjeta digital /tarjeta/{slug} para robots de
 * redes (WhatsApp, Facebook…). El .htaccess envía aquí solo a los robots; las
 * personas reciben el sitio normal, que dibuja la tarjeta.
 */
$slug = preg_replace('/[^a-z0-9-]/', '', strtolower($_GET['c'] ?? ''));
$html = @file_get_contents(__DIR__ . '/index.html');
if ($html === false) { http_response_code(500); exit; }
header('Content-Type: text/html; charset=utf-8');
header('Cache-Control: public, max-age=300');
$api = 'https://yescomputo-admin.onrender.com/v1/cards/yes-computo/' . $slug . '?preview=1';
$ctx = stream_context_create(['http' => ['timeout' => 5, 'ignore_errors' => true, 'header' => "Accept: application/json\r\n"]]);
$raw = $slug ? @file_get_contents($api, false, $ctx) : false;
$card = $raw ? json_decode($raw, true) : null;
if (!$card || empty($card['data'])) { echo $html; exit; }
$d = $card['data'];
$e = function ($s) { return htmlspecialchars((string) $s, ENT_QUOTES, 'UTF-8'); };
$title = implode(' · ', array_filter([$d['name'] ?? '', ($d['company'] ?? '') ?: ($card['businessName'] ?? '')])) ?: 'Tarjeta digital';
$desc = implode(' — ', array_filter([$d['title'] ?? '', $d['tagline'] ?? ''])) ?: 'Guarda mi contacto con un toque.';
$img = ($d['photo'] ?? '') ?: (($card['logoUrl'] ?? '') ?: 'https://www.yescomputo.com/img/og-cover.png');
$url = 'https://www.yescomputo.com/tarjeta/' . $slug;
$html = preg_replace('#<title>.*?</title>#s', '<title>' . $e($title) . '</title>', $html, 1);
$html = preg_replace('#<meta\s+(property="og:[^"]+"|name="(description|twitter:[^"]+)")[^>]*>#i', '', $html);
$tags = '<meta name="description" content="' . $e($desc) . '">'
  . '<meta property="og:type" content="profile"><meta property="og:title" content="' . $e($title) . '">'
  . '<meta property="og:description" content="' . $e($desc) . '"><meta property="og:url" content="' . $e($url) . '">'
  . '<meta property="og:image" content="' . $e($img) . '"><meta name="twitter:card" content="summary">';
echo str_replace('</head>', $tags . '</head>', $html);
