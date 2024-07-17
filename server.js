const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

const apiToken = '89V4QZvoNw2lFKwnBoqCQqOwYybRKz8LmQF4a'; // Substitua com seu token de API do Smartsheet
const sheetId = '4037790098476932'; // Substitua com o ID da sua planilha no Smartsheet
const jimmyWebhookUrl = 'https://api.jimmy.chat/integration_webhook/in/route/3487147064058400/35b326f2-c5fc-4ab6-ae5a-4bf3129624a4'; // URL do webhook do Jimmy Chat

const smartsheet = axios.create({
  baseURL: 'https://api.smartsheet.com/2.0',
  headers: {
    'Authorization': `Bearer ${apiToken}`,
    'Content-Type': 'application/json'
  }
});

// Função para criar e ativar um webhook no Smartsheet
async function createAndActivateWebhook() {
  try {
    // Criar o webhook
    const createResponse = await smartsheet.post('/webhooks', {
      name: 'jimmy',
      callbackUrl: 'https://smartsheet.onrender.com/webhook', 
      scope: 'sheet',
      scopeObjectId: 4037790098476932,
      events: ['*.*'],
      version: 1
    });

    const webhookId = createResponse.data.result.id;
    console.log('Webhook criado com sucesso:', createResponse.data);

    // Ativar o webhook
    const activateResponse = await smartsheet.put(`/webhooks/${webhookId}`, {
      enabled: true
    });

    console.log('Webhook ativado com sucesso:', activateResponse.data);
  } catch (error) {
    console.error('Erro ao criar ou ativar o webhook:', error.response ? error.response.data : error.message);
  }
}

// Rota para receber notificações de webhook do Smartsheet
app.post('/webhook', async (req, res) => {
  console.log('Notificação de webhook do Smartsheet recebida:', req.body);

  // Encaminha os dados recebidos para o webhook do Jimmy Chat
  try {
    const response = await axios.post(jimmyWebhookUrl, req.body);
    console.log('Notificação encaminhada com sucesso para o Jimmy Chat:', response.data);
  } catch (error) {
    console.error('Erro ao encaminhar notificação para o Jimmy Chat:', error.response ? error.response.data : error.message);
  }

  res.status(200).send('OK');
});

// Iniciar o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  // Chamar a função para criar e ativar o webhook no Smartsheet quando o servidor iniciar
  createAndActivateWebhook();
});
