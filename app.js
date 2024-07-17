const axios = require('axios');

// Substitua 'YOUR_API_TOKEN' pelo seu token de API Smartsheet
const apiToken = '89V4QZvoNw2lFKwnBoqCQqOwYybRKz8LmQF4a';

// ID do workspace "Projetos - André"
const workspaceId = '7752115020949380';

// Configuração da instância axios
const smartsheet = axios.create({
  baseURL: 'https://api.smartsheet.com/2.0',
  headers: {
    'Authorization': `Bearer ${apiToken}`,
    'Content-Type': 'application/json'
  }
});

// Função para listar todas as planilhas em um workspace específico
async function listSheetsInWorkspace(workspaceId) {
  try {
    const response = await smartsheet.get(`/workspaces/${workspaceId}`);
    const workspace = response.data;
    console.log(`Planilhas no workspace ${workspace.name}:`);
    workspace.sheets.forEach(sheet => {
      console.log(`ID: ${sheet.id}, Nome: ${sheet.name}`);
      // Verifica se a planilha é "Jimmy Chat"
      if (sheet.name === 'Jimmy Chat') {
        console.log('Encontrada planilha "Jimmy Chat"');
        getSheet(sheet.id);
      }
    });
  } catch (error) {
    console.error('Erro ao listar as planilhas no workspace:', error.response ? error.response.data : error.message);
  }
}

// Função para obter os dados de uma planilha específica
async function getSheet(sheetId) {
  try {
    const response = await smartsheet.get(`/sheets/${sheetId}`);
    console.log('Dados da planilha:');
    console.log(response.data);
  } catch (error) {
    console.error('Erro ao obter os dados da planilha:', error.response ? error.response.data : error.message);
  }
}

// Chamar a função para listar as planilhas no workspace "Projetos - André"
listSheetsInWorkspace(workspaceId);
