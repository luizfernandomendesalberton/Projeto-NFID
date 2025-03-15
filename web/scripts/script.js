import { excluirEquipamento } from "./task.js";

// Verifica se já existem usuários no LocalStorage, caso contrário, inicializa com um usuário padrão
if (!localStorage.getItem('users')) {
    const defaultUser = [{ username: "admin", password: "admin123" }];
    localStorage.setItem('users', JSON.stringify(defaultUser));
}

// Função para verificar o login
document.getElementById('loginForm')?.addEventListener('submit', function(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const users = JSON.parse(localStorage.getItem('users'));
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        window.location.href = 'cadastro-equipamento.html';
    } else {
        alert('Usuário ou senha incorretos!');
    }
});

// Função para cadastrar novos usuários
document.getElementById('cadastroUsuarioForm')?.addEventListener('submit', function(event) {
    event.preventDefault();
    const novoUsername = document.getElementById('novoUsername').value;
    const novaSenha = document.getElementById('novaSenha').value;

    // Verifica se o usuário já existe
    const users = JSON.parse(localStorage.getItem('users'));
    const userExists = users.some(u => u.username === novoUsername);

    if (userExists) {
        alert('Usuário já cadastrado!');
        return;
    }

    const newUser = {
        username: novoUsername,
        password: novaSenha
    };

    // Adiciona o novo usuário à lista
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    alert('Usuário cadastrado com sucesso!');
});

// Função para cadastrar equipamentos
document.getElementById('cadastroForm')?.addEventListener('submit', function(event) {
    event.preventDefault();
    const numeroSerie = document.getElementById('numeroSerie').value;
    const local = document.getElementById('local').value;
    const funcionario = document.getElementById('funcionario').value;

    const equipamento = {
        numeroSerie,
        local,
        funcionario
    };

    //Salva no LocalStorage
    let equipamentos = JSON.parse(localStorage.getItem('equipamentos')) || [];
    equipamentos.push(equipamento);
    localStorage.setItem('equipamentos', JSON.stringify(equipamentos));

    alert('Equipamento cadastrado com sucesso!');
    document.getElementById('cadastroForm').reset();
});

// Função para carregar o estoque
document.addEventListener('DOMContentLoaded', function() {
    const estoqueTable = document.getElementById('estoqueTable')?.getElementsByTagName('tbody')[0];
    if (estoqueTable) {
        const equipamentos = JSON.parse(localStorage.getItem('equipamentos')) || [];
        equipamentos.forEach((equipamento, index) => {
            const row = estoqueTable.insertRow();
            row.insertCell(0).textContent = equipamento.numeroSerie;
            row.insertCell(1).textContent = equipamento.local;
            row.insertCell(2).textContent = equipamento.funcionario;

            // Botão de exclusão
            const cellAcoes = row.insertCell(3);
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Excluir';
            deleteBtn.classList.add('delete-btn');
            deleteBtn.addEventListener('click', () => excluirEquipamento(index));
            cellAcoes.appendChild(deleteBtn);
        });
    }
});
