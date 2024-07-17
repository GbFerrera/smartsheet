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
    let message = `📄 Nova linha:\n\n`;

    // Percorrer as células (colunas) da linha
    for (const cell of rowData.cells) {
      // Obter o título da coluna (se disponível)
      const columnName = cell.columnTitle || `Coluna ${cell.columnId}`; // Usar o ID da coluna se o título não estiver disponível
      const cellValue = cell.value || 'Valor não especificado'; // Tratar caso o valor não esteja disponível

      // Adicionar nome e valor da coluna à mensagem, com quebra de linha
      message += `🔹 ${columnName}: ${cellValue}\n`;
    }

    return message.trim(); // Retornar a mensagem formatada
  } catch (error) {
    console.error(`Erro ao obter detalhes da linha ${rowId}:`, error.response ? error.response.data : error.message);
    throw error;
  }
}

module.exports = { getRowDetails };
