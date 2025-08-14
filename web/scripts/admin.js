// admin.js
// Carrega e gerencia a lista de usuários para o painel admin

const usuariosTable = document.getElementById('usuariosTable').getElementsByTagName('tbody')[0];

async function carregarUsuarios() {
    try {
        // Ajuste a URL conforme seu backend
        const resposta = await fetch('../data/funcionario.json');
        if (resposta.ok) {
            const usuarios = await resposta.json();
            usuariosTable.innerHTML = '';
            usuarios.forEach(usuario => {
                const row = usuariosTable.insertRow();
                row.insertCell(0).textContent = usuario.nome || usuario.username || usuario.user || 'Usuário';
                const cellAcoes = row.insertCell(1);
                const btnExcluir = document.createElement('button');
                btnExcluir.textContent = 'Excluir';
                btnExcluir.onclick = () => excluirUsuario(usuario.id || usuario.nome);
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
        // Ajuste a URL e método conforme seu backend
        const resposta = await fetch(`../data/funcionario.json`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
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
