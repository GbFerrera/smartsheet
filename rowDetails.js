// rowDetails.js

const axios = require('axios');

const apiToken = '89V4QZvoNw2lFKwnBoqCQqOwYybRKz8LmQF4a'; // Substitua com seu token de API do Smartsheet
const sheetId = 4037790098476932; // Substitua com o ID da sua planilha no Smartsheet

const smartsheet = axios.create({
  baseURL: 'https://api.smartsheet.com/2.0',
  headers: {
    'Authorization': `Bearer ${apiToken}`,
    'Content-Type': 'application/json'
  }
});

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

module.exports = { getRowDetails };
