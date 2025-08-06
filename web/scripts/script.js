import { excluirMaterial, filtrarEquipamentos, carregarEstoque, carregarEquipamento, carregarBusca, dadosUsuarios, atualizarRelatorioEquipamentos, atualizaStatus } from "./task.js";
import { loginNFC } from "./nfid.js";
import { buscaNFID } from "./nfid.js";
import { cadastraNFID } from './nfid.js';

// Função para realizar o Login com base nos Usuários Cadastrados
document.getElementById('loginForm')?.addEventListener('submit', async function (event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const loginData = { username, password };

    const urls = [
        'http://127.0.0.1:5000/login',
        'https://dc61-177-74-79-181.ngrok-free.app/login'
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
        'https://dc61-177-74-79-181.ngrok-free.app/cadastro-usuario'
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
        'https://dc61-177-74-79-181.ngrok-free.app/busca-cadastro'
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
                atualizaStatus(numeroSerie);
                atualizarRelatorioEquipamentos();
                return;
            } else {
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
        'https://dc61-177-74-79-181.ngrok-free.app/equipamento'
    ];

    let equipamentoNomeMap = {};

    try {
        const respostaEquipamentos = await fetch('http://127.0.0.1:5000/estoque');
        if (respostaEquipamentos.ok) {
            const equipamentos = await respostaEquipamentos.json();
            equipamentos.forEach(equip => {
                equipamentoNomeMap[equip.id] = equip.nome;
            });
        }
    } catch (error) {
        console.warn('Erro ao carregar lista de equipamentos:', error);
    }

    for (const url of urls) {
        try {
            const resposta = await fetch(url);
            if (resposta.ok) {
                const materiais = await resposta.json();
                equipamentoTable.innerHTML = '';

                materiais.forEach((material) => {
                    const row = equipamentoTable.insertRow();
                    row.insertCell(0).textContent = material.numeroSerie;
                    row.insertCell(1).textContent = equipamentoNomeMap[material.numeroSerie] || 'Desconhecido';
                    row.insertCell(2).textContent = material.local;
                    row.insertCell(3).textContent = material.funcionario;

                    // Botão de exclusão
                    const cellAcoes = row.insertCell(4);
                    const deleteBtn = document.createElement('button');
                    deleteBtn.textContent = 'Remover';
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
            console.warn(`Erro ao carregar equipamentos de ${url}:`, error);
        }
    }
});

document.getElementById('cadastroNovos')?.addEventListener('submit', async function (event) {
    event.preventDefault();

    const nomeEquipamento = document.getElementById('nomeEquipamento').value;
    const status = document.getElementById('status').value;

    if (status === "all") {
        alert("Por favor, selecione um status válido.");
        return;
    }

    const urls = [
        'http://127.0.0.1:5000/estoque',
        'https://dc61-177-74-79-181.ngrok-free.app/estoque'
    ];

    let ultimoId = 0;

    for (const url of urls) {
        try {
            const response = await fetch(url);
            if (response.ok) {
                const estoque = await response.json();
                ultimoId = estoque.length > 0 ? estoque[estoque.length - 1].id : 0;
                break;
            }
        } catch (error) {
            console.warn(`Erro ao buscar estoque de ${url}:`, error);
        }
    }

    const novoId = ultimoId + 1;
    const novoEquipamento = { id: novoId, nome: nomeEquipamento, status };

    for (const url of urls) {
        try {
            const salvarResponse = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(novoEquipamento)
            });

            if (salvarResponse.ok) {
                alert("Equipamento cadastrado com sucesso!");
                document.getElementById('cadastroNovos').reset();
                return;
            }
        } catch (error) {
            console.warn(`Erro ao cadastrar equipamento em ${url}:`, error);
        }
    }
});

document.addEventListener('DOMContentLoaded', async function () {
    const equipamentoTable = document.getElementById('equipamentoTable')?.getElementsByTagName('tbody')[0];
    if (!equipamentoTable) return;

    const urls = [
        'http://127.0.0.1:5000/estoque',
        'https://dc61-177-74-79-181.ngrok-free.app/estoque'
    ];

    for (const url of urls) {
        try {
            const resposta = await fetch(url);
            if (resposta.ok) {
                const equipamentos = await resposta.json();
                equipamentoTable.innerHTML = '';

                equipamentos.forEach((equip) => {
                    const row = equipamentoTable.insertRow();
                    row.insertCell(0).textContent = equip.id;
                    row.insertCell(1).textContent = equip.nome;
                    row.insertCell(2).textContent = equip.status;

                    // Botão de exclusão
                    const cellAcoes = row.insertCell(3);
                    const deleteBtn = document.createElement('button');
                    deleteBtn.textContent = 'Excluir';
                    deleteBtn.classList.add('delete-btn');
                    deleteBtn.setAttribute('data-id', equip.id);
                    cellAcoes.appendChild(deleteBtn);

                    deleteBtn.addEventListener('click', function () {
                        const id = this.getAttribute('data-id');
                        console.log(`ID do equipamento a excluir: ${id}`);
                        excluirEquipamento(id);
                    });
                });

                return;
            }
        } catch (error) {
            console.warn(`Erro ao carregar estoque de ${url}:`, error);
        }
    }
});

document.addEventListener('DOMContentLoaded', async function () {
    const equipamentoTable = document.getElementById('equipamentoTable');
    const estoqueTable = document.getElementById('estoqueTable');
    const buscaTable = document.getElementById('buscaTable');

    if (equipamentoTable) {
        carregarEquipamento();
    }
    if (estoqueTable) {
        carregarEstoque();
    }
    if (buscaTable) {
        carregarBusca();
    }
});

// Função para excluir um equipamento
async function excluirEquipamento(id) {
    const urls = [
        'http://127.0.0.1:5000/estoque',
        'https://dc61-177-74-79-181.ngrok-free.app/estoque'
    ];

    for (const url of urls) {
        try {
            const resposta = await fetch(`${url}/${id}`, {
                method: 'DELETE'
            });

            if (resposta.ok) {
                alert("Equipamento excluído com sucesso!");
                location.reload();
                return;
            }
        } catch (error) {
            console.warn(`Erro ao excluir equipamento de ${url}:`, error);
        }
    }
    alert("Erro ao excluir equipamento.");
}

document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.getElementById('searchInput');
    const filterStatus = document.getElementById('filterStatus');
    const searchNome = document.getElementById('searchNome');
    const searchButton = document.getElementById('searchButton');
    const buscaTable = document.getElementById('buscaTable')?.getElementsByTagName('tbody')[0];

    if (!buscaTable) return;

    searchButton.addEventListener('click', () => {
        const idFiltro = searchInput.value.trim().toLowerCase();
        const nomeFiltro = searchNome.value.trim().toLowerCase();
        const statusFiltro = filterStatus.value;

        filtrarEquipamentos(buscaTable, idFiltro, nomeFiltro, statusFiltro);
    });
});

let konamiCode = [
    "ArrowUp", "ArrowUp",
    "ArrowDown", "ArrowDown",
    "ArrowLeft", "ArrowRight",
    "ArrowLeft", "ArrowRight"
];

let inputSequence = [];

window.addEventListener("keydown", (event) => {
    inputSequence.push(event.key);
    if (inputSequence.length > konamiCode.length) {
        inputSequence.shift();
    }

    if (JSON.stringify(inputSequence) === JSON.stringify(konamiCode)) {
        ativarModoHacker();
        inputSequence = [];
    }
});

function ativarModoHacker() {
    document.body.style.filter = "hue-rotate(300deg) saturate(100%)";
    document.body.insertAdjacentHTML('beforeend', `
      <div id="hackerMsg" style="
        position:fixed;
        top:0; left:0;
        width:100%;
        background:#000;
        color:#0f0;
        text-align:center;
        padding:10px;
        font-weight:bold;
        z-index:-1;
        font-family: monospace;
      ">🧠 Modo Desenvolvimento Ativado: Bem-vindo à Zona de Testes!</div>
    `);
}

// Funções para NFID

document.getElementById('entrarNFC')?.addEventListener('click', async function () {
    loginNFC();
});
document.getElementById('buscarNFID')?.addEventListener('click', buscaNFID);

document.getElementById('cadastraNFID')?.addEventListener('click', cadastraNFID);
dadosUsuarios();
atualizarRelatorioEquipamentos();