<?php
require 'vendor/autoload.php';

use RdKafka\Producer;
use RdKafka\Conf;

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit;
}
// Cria a configuração do produtor
$conf = new Conf();
$conf->set('metadata.broker.list', 'kafka:9093'); // Altere para o nome do serviço Kafka no Docker

// Cria o produtor com a configuração
$producer = new Producer($conf);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $message = $input['message'] ?? '';

    if ($message) {
        $timestamp = microtime(true); // Tempo em segundos desde o Epoch
        $messageWithTime = json_encode([
            'message' => $message,
            'sent_time' => $timestamp,
        ]);
        $topic = $producer->newTopic("mensagens");
        $topic->produce(RD_KAFKA_PARTITION_UA, 0, $messageWithTime);
        $producer->flush(10000);

        echo json_encode(['status' => 'Mensagem enviada', 'data' => $messageWithTime]);
    } else {
        http_response_code(400);
        echo json_encode(['error' => 'Mensagem não fornecida']);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Método não permitido']);
}
?>
