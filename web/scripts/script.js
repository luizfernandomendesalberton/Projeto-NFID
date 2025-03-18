import { excluirEquipamento } from "./task.js";

// Função para realizar o Login com base nos Usuários Cadastrados
document.getElementById('loginForm')?.addEventListener('submit', async function(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const loginData = { username, password };

    try {
        const resposta = await fetch('http://127.0.0.1:5000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loginData)
        });

        const resultado = await resposta.json();
        
        if (resposta.ok) {
            alert(resultado.mensagem);
            window.location.href = 'cadastro-equipamento.html';
        } else {
            alert(resultado.mensagem);
        }
    } catch (erro) {
        console.error('Erro ao tentar logar:', erro);
        alert('Erro ao conectar com o servidor.');
    }
});

// Função para cadastrar novos usuários
document.getElementById('cadastroUsuarioForm')?.addEventListener('submit', async function(event) {
    event.preventDefault();

    const novoUsername = document.getElementById('novoUsername').value;
    const novaSenha = document.getElementById('novaSenha').value;

    const newUser = { username: novoUsername, password: novaSenha };
    console.log("dados: " + newUser);
    

    const resposta = await fetch('http://127.0.0.1:5000/cadastro-usuario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
    });

    const resultado = await resposta.json();
    console.log(resultado);
    
    alert(resultado.mensagem);
});

// Ainda não Funcional V

// Função para cadastrar equipamentos
document.getElementById('cadastroForm')?.addEventListener('submit', async function(event) {
    event.preventDefault();

    const numeroSerie = document.getElementById('numeroSerie').value;
    const local = document.getElementById('local').value;
    const funcionario = document.getElementById('funcionario').value;

    const equipamento = { numeroSerie, local, funcionario };

    const resposta = await fetch('http://127.0.0.1:5000/cadastrar-material', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(equipamento)
    });

    const resultado = await resposta.json();
    alert(resultado.mensagem);
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
