// admin.js
// Carrega e gerencia a lista de usuários para o painel admin


import { backendBase } from './script.js';
const usuariosTable = document.getElementById('usuariosTable').getElementsByTagName('tbody')[0];

async function carregarUsuarios() {
    try {
    const resposta = await fetch(`${backendBase}/funcionarios`);
        if (resposta.ok) {
            const usuarios = await resposta.json();
            usuariosTable.innerHTML = '';
            usuarios.forEach(usuario => {
                const row = usuariosTable.insertRow();
                row.insertCell(0).textContent = usuario.username || usuario.nome || usuario.id || 'Usuário';
                const cellAcoes = row.insertCell(1);
                const btnExcluir = document.createElement('button');
                btnExcluir.textContent = 'Excluir';
                btnExcluir.onclick = () => excluirUsuario(usuario.username || usuario.nome || usuario.id);
                cellAcoes.appendChild(btnExcluir);
            });
        } else {
            usuariosTable.innerHTML = '<tr><td colspan="2">Erro ao carregar usuários</td></tr>';
        }
    } catch (e) {
        usuariosTable.innerHTML = '<tr><td colspan="2">Erro ao carregar usuários</td></tr>';
    }
}

async function excluirUsuario(id) {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return;
    try {
    const resposta = await fetch(`${backendBase}/excluir-usuario/${encodeURIComponent(id)}`, {
            method: 'DELETE'
        });
        if (resposta.ok) {
            alert('Usuário excluído com sucesso!');
            carregarUsuarios();
        } else {
            alert('Erro ao excluir usuário.');
        }
    } catch (e) {
        alert('Erro ao excluir usuário.');
    }
}

carregarUsuarios();
