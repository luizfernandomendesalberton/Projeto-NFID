import { excluirMaterial } from "./task.js";

// Função para realizar o Login com base nos Usuários Cadastrados
document.getElementById('loginForm')?.addEventListener('submit', async function (event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const loginData = { username, password };

    const urls = [
        'http://127.0.0.1:5000/login',
        'https://b188-177-74-79-181.ngrok-free.app/login'
    ];

    for (const url of urls) {
        try {
            const resposta = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(loginData)
            });

            if (resposta.ok) {
                const resultado = await resposta.json();
                alert(resultado.mensagem);
                localStorage.setItem('funcionarioAtual', username);
                window.location.href = 'busca-cadastro.html';
                return;
            }
        } catch (erro) {
            console.warn(`Falha ao conectar em ${url}:`, erro);
        }
    }
    alert('Erro ao fazer Login!');
});

// Função para cadastrar novos usuários
document.getElementById('cadastroUsuarioForm')?.addEventListener('submit', async function (event) {
    event.preventDefault();

    const novoUsername = document.getElementById('novoUsername').value;
    const novaSenha = document.getElementById('novaSenha').value;

    const newUser = { username: novoUsername, password: novaSenha };
    const urls = [
        'http://127.0.0.1:5000/cadastro-usuario',
        'https://b188-177-74-79-181.ngrok-free.app/cadastro-usuario'
    ];

    for (const url of urls) {
        try {
            const resposta = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newUser)
            });

            if (resposta.ok) {
                const resultado = await resposta.json();
                console.log(resultado);
                alert(resultado.mensagem);
                return;
            }
        } catch (erro) {
            console.warn(`Falha ao conectar em ${url}:`, erro);
        }
    }
});

document.addEventListener('DOMContentLoaded', function () {
    const funcionarioSpan = document.getElementById('funcionario');
    
    if (funcionarioSpan) {
        const funcionarioAtual = localStorage.getItem('funcionarioAtual');

        if (funcionarioAtual) {
            funcionarioSpan.textContent = funcionarioAtual;
            console.log("Funcionário preenchido:", funcionarioAtual);
        } else {
            alert("Erro: Usuário não encontrado. Faça login novamente.");
        }
    }
});

// Função para cadastrar equipamentos
document.getElementById('cadastroForm')?.addEventListener('submit', async function (event) {
    event.preventDefault();
    const numeroSerie = document.getElementById('numeroSerie').value;
    const local = document.getElementById('local').value;
    const funcionario = localStorage.getItem('funcionarioAtual');
    

    const equipamento = { numeroSerie, local, funcionario };
    const urls = [
        'http://127.0.0.1:5000/busca-cadastro',
        'https://b188-177-74-79-181.ngrok-free.app/busca-cadastro'
    ];

    for (const url of urls) {
        try {
            const resposta = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(equipamento)
            });

            if (resposta.ok) {
                const resultado = await resposta.json();
                alert(resultado.mensagem);
                document.getElementById('cadastroForm').reset();
                return;
            }
        } catch (erro) {
            console.warn(`Falha ao conectar em ${url}:`, erro);
        }
    }

    alert('Erro ao conectar com o servidor.');
});

// Função para carregar o equipamento do servidor
document.addEventListener('DOMContentLoaded', async function () {
    const equipamentoTable = document.getElementById('equipamentoTable')?.getElementsByTagName('tbody')[0];
    if (!equipamentoTable) return;

    const urls = [
        'http://127.0.0.1:5000/equipamento',
        'https://b188-177-74-79-181.ngrok-free.app/equipamento'
    ];

    for (const url of urls) {
        try {
            const resposta = await fetch(url);
            if (resposta.ok) {
                const materiais = await resposta.json();
                equipamentoTable.innerHTML = '';

                materiais.forEach((material) => {
                    const row = equipamentoTable.insertRow();
                    row.insertCell(0).textContent = material.numeroSerie;
                    row.insertCell(1).textContent = material.local;
                    row.insertCell(2).textContent = material.funcionario;

                    // Botão de exclusão
                    const cellAcoes = row.insertCell(3);
                    const deleteBtn = document.createElement('button');
                    deleteBtn.textContent = 'Excluir';
                    deleteBtn.classList.add('delete-btn');
                    deleteBtn.setAttribute('data-id', material.numeroSerie);
                    cellAcoes.appendChild(deleteBtn);

                    deleteBtn.addEventListener('click', function () {
                        const id = this.getAttribute('data-id');
                        console.log(`ID do material a excluir: ${id}`);
                        excluirMaterial(id);
                    });
                });

                return;
            }
        } catch (error) {
            console.warn(`Erro ao carregar equipamento de ${url}:`, error);
        }
    }
});