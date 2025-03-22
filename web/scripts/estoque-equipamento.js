// Função para carregar os equipamentos na tabela
function carregarEstoque(filtro = "") {
    const estoqueTable = document.getElementById('estoqueTable').getElementsByTagName('tbody')[0];
    estoqueTable.innerHTML = ""; // Limpa a tabela antes de carregar os dados

    const equipamentos = JSON.parse(localStorage.getItem('equipamentos')) || [];

    equipamentos.forEach((equipamento, index) => {
        // Filtra os equipamentos com base no RFID, tipo ou descrição
        if (
            equipamento.rfid.includes(filtro) ||
            equipamento.tipo.toLowerCase().includes(filtro.toLowerCase()) ||
            equipamento.descricao.toLowerCase().includes(filtro.toLowerCase())
        ) {
            const row = estoqueTable.insertRow();
            row.insertCell(0).textContent = equipamento.rfid;
            row.insertCell(1).textContent = equipamento.tipo;
            row.insertCell(2).textContent = equipamento.descricao;

            // Botão de exclusão
            const cellAcoes = row.insertCell(3);
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Excluir';
            deleteBtn.classList.add('delete-btn');
            deleteBtn.addEventListener('click', () => excluirEquipamento(index));
            cellAcoes.appendChild(deleteBtn);
        }
    });
}

// Função para excluir um equipamento
function excluirEquipamento(index) {
    let equipamentos = JSON.parse(localStorage.getItem('equipamentos')) || [];
    equipamentos.splice(index, 1); // Remove o equipamento do array
    localStorage.setItem('equipamentos', JSON.stringify(equipamentos)); // Atualiza o LocalStorage
    alert('Equipamento excluído com sucesso!');
    carregarEstoque(); // Recarrega a tabela
}

// Função para buscar equipamentos
document.getElementById('botaoBusca').addEventListener('click', () => {
    const filtro = document.getElementById('buscaInput').value;
    carregarEstoque(filtro);
});

// Função para voltar à tela de cadastro
document.getElementById('voltarCadastro').addEventListener('click', () => {
    window.location.href = 'busca-cadastro.html';
});

// Função para sair (voltar ao login)
document.getElementById('sair').addEventListener('click', () => {
    window.location.href = 'index.html';
});

// Carrega os equipamentos ao abrir a página
document.addEventListener('DOMContentLoaded', () => {
    carregarEstoque();
});