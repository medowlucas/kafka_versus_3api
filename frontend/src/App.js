import React, { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
    const [message, setMessage] = useState('');
    const [messagesFromConsumer, setMessagesFromConsumer] = useState([]);
    
    useEffect(() => {
        const fetchMessagesFromConsumer = () => {
            axios.get('http://localhost:8083/messages') // Consome do consumidor
                .then(response => {
                    setMessagesFromConsumer(response.data);
                })
                .catch(error => console.error('Erro ao buscar mensagens do consumidor:', error));
        };

        fetchMessagesFromConsumer();
        
        // Atualiza a cada 5 segundos
        const interval = setInterval(fetchMessagesFromConsumer, 5000);

        return () => clearInterval(interval);
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        axios.post('http://localhost:8082', { message })
            .then(response => {
                console.log('Mensagem enviada:', response.data);
                setMessage(''); // Limpa o campo de entrada
            })
            .catch(error => console.error('Erro ao enviar mensagem:', error));
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '20px' }}>
            <div style={{ flex: 1, marginRight: '20px' }}>
                <h2>Enviar Mensagem</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Digite sua mensagem"
                        required
                    />
                    <button type="submit">Enviar</button>
                </form>
            </div>

            <div style={{ flex: 1 }}>
                <h2>Mensagens do Consumidor</h2>
                <ul>
                {messagesFromConsumer.map((msg, index) => (
                    <li key={index}>
                        Mensagem: {msg.message}<br />
                        Latência: {msg.latency} segundos
                    </li>
                ))}
                </ul>
            </div>
        </div>
    );
}

export default App;
