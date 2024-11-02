const express = require('express');
const cors = require('cors');
const { KafkaClient, Consumer, Admin } = require('kafka-node');

const app = express();
const PORT = 8083;

app.use(cors());

const client = new KafkaClient({ kafkaHost: 'kafka:9093' });
const topicName = 'mensagens'; // O tópico deve ser criado manualmente

let messages = [];
let consumer = null;

const startConsumer = () => {
    try {
        consumer = new Consumer(
            client,
            [{ topic: topicName, partition: 0 }],
            {
                autoCommit: true,
                fromOffset: 'latest'
            }
        );

        consumer.on('message', (data) => {
            try {
                const parsedData = JSON.parse(data.value); // Assume que a mensagem é JSON
                const sentTime = parsedData.sent_time; // Tempo que a mensagem foi enviada
                const currentTime = Date.now() / 1000; // Tempo atual em segundos
                const latency = currentTime - sentTime; // Calcula a latência em segundos

                // Adiciona a mensagem ao array de mensagens
                const messageObject = {
                    message: parsedData.message,
                    latency: latency.toFixed(5), // Arredonda para 5 casas decimais
                    sent_time: sentTime,
                    received_time: currentTime
                };

                // Verifica se a mensagem contém min_latency e max_latency
                if (parsedData.min_latency !== undefined && parsedData.max_latency !== undefined) {
                    messageObject.min_latency = parsedData.min_latency;
                    messageObject.max_latency = parsedData.max_latency;
                }

                messages.push(messageObject);
            } catch (error) {
                console.error('Erro ao parsear mensagem:', error);
            }
        });

        consumer.on('error', (err) => {
            console.error('Erro no consumidor:', err);
            if (err.message.includes('topic does not exist')) {
                console.log('Tentando novamente em 5 segundos...');
                setTimeout(checkTopicExistsAndStartConsumer, 5000); // Tenta novamente após 5 segundos
            }
        });

    } catch (error) {
        console.error('Erro ao iniciar o consumidor:', error);
    }
};

const checkTopicExistsAndStartConsumer = () => {
    const admin = new Admin(client);
    admin.listTopics((err, res) => {
        if (err) {
            console.error('Erro ao listar tópicos:', err);
            return;
        }
        const topics = Object.keys(res[1].metadata);
        if (topics.includes(topicName)) {
            startConsumer();
        } else {
            console.log('Tópico não encontrado. Tentando novamente em 5 segundos...');
            setTimeout(checkTopicExistsAndStartConsumer, 5000);
        }
    });
};

app.get('/messages', (req, res) => {
    res.json(messages); // Retorna todas as mensagens acumuladas
});

app.listen(PORT, () => {
    console.log(`Kafka consumer running on http://localhost:${PORT}`);
    checkTopicExistsAndStartConsumer(); // Inicie a verificação do tópico e o consumidor
});
