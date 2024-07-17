// Função para obter os detalhes de uma linha pelo ID
 async function getRowDetails(rowId) {
  try {
    const response = await smartsheet.get(`/sheets/${sheetId}/rows/${rowId}`);
    const rowData = response.data;

    // Montar a mensagem com os detalhes da linha
    let message = `Nova linha:\n`;

    // Percorrer as células (colunas) da linha
    for (const cell of rowData.cells) {
      const columnName = cell.columnTitle; // Nome da coluna
      const cellValue = cell.value; // Valor da célula

      // Adicionar nome e valor da coluna à mensagem
      message += `${columnName}: ${cellValue}\n`;
    }

    return message.trim(); // Retornar a mensagem formatada
  } catch (error) {
    console.error(`Erro ao obter detalhes da linha ${rowId}:`, error.response ? error.response.data : error.message);
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
      const rowDetailsMessage = await getRowDetails(rowId);

      // Enviar os dados completos para o webhook do Jimmy Chat
      const response = await axios.post(jimmyWebhookUrl, {
        event: 'new_row_created',
        data: {
          rowEvent: newRowEvents[0],
          message: rowDetailsMessage
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


module.exports = getRowDetails
