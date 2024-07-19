// server.js

const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const { getRowDetails } = require('./rowDetails'); // Importar a função corretamente

const app = express();
app.use(bodyParser.json());

const apiToken = '89V4QZvoNw2lFKwnBoqCQqOwYybRKz8LmQF4a'; // Substitua com seu token de API do Smartsheet
const sheetId = 4037790098476932; // Substitua com o ID da sua planilha no Smartsheet
const jimmyWebhookUrl = 'https://api.jimmy.chat/integration_webhook/in/route/3487147064058400/35b326f2-c5fc-4ab6-ae5a-4bf3129624a4'; // URL do webhook do Jimmy Chat

const smartsheet = axios.create({
  baseURL: 'https://api.smartsheet.com/2.0',
  headers: {
    'Authorization': `Bearer ${apiToken}`,
    'Content-Type': 'application/json'
  }
});

// Função para listar todos os webhooks
async function listWebhooks() {
  try {
    const response = await smartsheet.get('/webhooks');
    console.log('Lista de Webhooks:', response.data);
    return response.data;
  } catch (error) {
    console.error('Erro ao listar os webhooks:', error.response ? error.response.data : error.message);
    throw error;
  }
}

// Função para criar e ativar um webhook no Smartsheet
async function createAndActivateWebhook(callbackUrl) {
  try {
    // Criar o webhook
    const createResponse = await smartsheet.post('/webhooks', {
      name: 'jimmy',
      callbackUrl: callbackUrl,
      scope: 'sheet',
      scopeObjectId: sheetId,
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

    // Verificar o webhook
    const verifyWebhook = await smartsheet.get(`/webhooks/${webhookId}`);
    console.log('Webhook verificado:', verifyWebhook.data);

    return webhookId;
  } catch (error) {
    console.error('Erro ao criar ou ativar o webhook:', error.response ? error.response.data : error.message);
    throw error;
  }
}

// Rota para receber notificações de webhook do Smartsheet
app.post('/webhook', async (req, res) => {
  console.log('Notificação de webhook do Smartsheet recebida:', req.body);

  if (req.body.challenge) {
    // Responder ao desafio de validação do webhook
    res.set('Smartsheet-Hook-Response', req.body.challenge);
    res.status(200).send({ challenge: req.body.challenge });
    return;
  }

  // Verifica se há eventos de criação de nova linha
  const newRowEvents = req.body.events.filter(event => event.objectType === 'row' && event.eventType === 'created');

  if (newRowEvents.length > 0) {
    try {
      // Obter os detalhes da primeira linha criada (supondo apenas um evento por vez)
      const rowId = newRowEvents[0].id;
      const rowDetails = await getRowDetails(rowId); // Utiliza a função importada corretamente

      // Enviar os dados completos para o webhook do Jimmy Chat
      const response = await axios.post(jimmyWebhookUrl, {
        event: 'new_row_created',
        data: {
          rowDetails: rowDetails
        }
      });

      console.log('Notificação encaminhada com sucesso para o Jimmy Chat:', response.data);
      res.status(200).send('Notificação encaminhada com sucesso para o Jimmy Chat');
    } catch (error) {
      console.error('Erro ao encaminhar notificação para o Jimmy Chat:', error.response ? error.response.data : error.message);
      res.status(500).send('Erro ao encaminhar notificação para o Jimmy Chat');
    }
  } else {
    console.log('Nenhum evento de criação de nova linha encontrado.');
    res.status(200).send('Nenhum evento de criação de nova linha encontrado.');
  }
});

// Rota para listar todos os webhooks registrados
app.get('/list-webhooks', async (req, res) => {
  try {
    const webhooks = await listWebhooks();
    res.status(200).json(webhooks);
  } catch (error) {
    res.status(500).send('Erro ao listar webhooks');
  }
});

// Iniciar o servidor
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor iniciado na porta ${port}`);
});

// Criar e ativar o webhook ao iniciar o servidor
(async () => {
  try {
    const webhookId = await createAndActivateWebhook('https://smartsheet.onrender.com/webhook');
    console.log(`Webhook criado e ativado com ID: ${webhookId}`);
  } catch (error) {
    console.error('Erro ao criar e ativar webhook durante a inicialização:', error);
  }
})();
