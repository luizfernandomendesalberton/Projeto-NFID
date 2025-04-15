async function excluirMaterial(id) {
    const confirmacao = confirm('Tem certeza que deseja excluir este material?');

    if (!confirmacao) return;

    const urls = [
        `http://127.0.0.1:5000/excluir-material/${id}`,
        `https://dc61-177-74-79-181.ngrok-free.app/excluir-material/${id}`
    ];

    for (const url of urls) {
        try {
            const resposta = await fetch(url, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
            });

            if (resposta.ok) {
                const resultado = await resposta.json();
                await atualizaStatusNovo(id);
                alert(resultado.mensagem);
                location.reload();
                return;
            }
        } catch (error) {
            console.warn(`Erro ao excluir material de ${url}:`, error);
        }
    }
    alert('Falha ao excluir o material. Verifique sua conexão.');
}

function filtrarEquipamentos(tabela, idFiltro, nomeFiltro, statusFiltro) {
    const linhas = tabela.getElementsByTagName('tr');

    for (let linha of linhas) {
        const colunas = linha.getElementsByTagName('td');
        if (colunas.length === 0) continue;

        const id = colunas[0].textContent.trim().toLowerCase();
        const nome = colunas[1].textContent.trim().toLowerCase();
        const status = colunas[2].textContent.trim().toLowerCase();

        const idMatch = idFiltro === '' || id.includes(idFiltro);
        const nomeMatch = nomeFiltro === '' || nome.includes(nomeFiltro);
        const statusMatch = statusFiltro === 'all' || status === statusFiltro;
        console.log("status: ", status, "status do Filtro:", statusFiltro);

        linha.style.display = (idMatch && nomeMatch && statusMatch) ? '' : 'none';
    }
}

// Função para carregar o ESTOQUE
async function carregarEstoque() {
    const estoqueTable = document.getElementById('estoqueTable')?.getElementsByTagName('tbody')[0];
    if (!estoqueTable) return;

    const urls = [
        'http://127.0.0.1:5000/estoque',
        'https://dc61-177-74-79-181.ngrok-free.app/estoque'
    ];

    for (const url of urls) {
        try {
            const resposta = await fetch(url);
            if (resposta.ok) {
                const equipamentos = await resposta.json();
                estoqueTable.innerHTML = '';

                equipamentos.forEach((equip) => {
                    const row = estoqueTable.insertRow();
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
}

// Função para carregar os EQUIPAMENTOS
async function carregarEquipamento() {
    const equipamentoTable = document.getElementById('equipamentoTable')?.getElementsByTagName('tbody')[0];
    if (!equipamentoTable) return;

    const urls = [
        'http://127.0.0.1:5000/equipamento',
        'https://dc61-177-74-79-181.ngrok-free.app/equipamento'
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
            console.warn(`Erro ao carregar equipamentos de ${url}:`, error);
        }
    }
}

async function carregarBusca() {
    const buscaTable = document.getElementById('buscaTable')?.getElementsByTagName('tbody')[0];
    if (!buscaTable) return;

    const urls = [
        'http://127.0.0.1:5000/estoque',
        'https://dc61-177-74-79-181.ngrok-free.app/estoque'
    ];

    const materiais = {};

    try {
        const respostaMaterial = await fetch('http://127.0.0.1:5000/equipamentos_completos');
        if (respostaMaterial.ok) {
            const materiaisJson = await respostaMaterial.json();
            materiaisJson.forEach(material => {
                materiais[material.id] = {
                    local: material.local || 'Não atribuído',
                    funcionario: material.funcionario || 'Nenhum'
                };
            });
        }
    } catch (error) {
        console.warn('Erro ao carregar equipamentos:', error);
    }

    for (const url of urls) {
        try {
            const respostaEstoque = await fetch(url);
            if (respostaEstoque.ok) {
                const estoque = await respostaEstoque.json();
                buscaTable.innerHTML = '';

                estoque.forEach(async (equipamento) => {
                    const row = buscaTable.insertRow();
                    row.insertCell(0).textContent = equipamento.id;
                    row.insertCell(1).textContent = equipamento.nome;

                    const funcionario = materiais[equipamento.id]?.funcionario || 'Nenhum';
                    const novoStatus = funcionario !== 'Nenhum' ? 'Em Uso' : equipamento.status;

                    row.insertCell(2).textContent = novoStatus;

                    const local = materiais[equipamento.id]?.local || 'Não atribuído';
                    row.insertCell(3).textContent = local;
                    row.insertCell(4).textContent = funcionario;

                    if (novoStatus === 'Em Uso' && equipamento.status !== 'Em Uso') {
                        await fetch(`http://127.0.0.1:5000/atualizar_status/${equipamento.id}`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ status: 'Em Uso' })
                        });
                    }
                });
                return;
            }
        } catch (error) {
            console.warn(`Erro ao carregar estoque de ${url}:`, error);
        }
    }
}

async function atualizaStatus(numeroSerie) {
    const url = 'http://127.0.0.1:5000/atualizar_status/' + numeroSerie;

    try {
        const resposta = await fetch(url, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'Em Uso' })
        });

        if (resposta.ok) {
            const resultado = await resposta.json();
            console.log('Status atualizado:', resultado.mensagem);
        } else {
            console.warn('Falha ao atualizar status:', await resposta.text());
        }
    } catch (error) {
        console.error('Erro ao atualizar status:', error);
    }
}

async function atualizaStatusNovo(numeroSerie) {
    const url = 'http://127.0.0.1:5000/atualizar_status/' + numeroSerie;

    try {
        const resposta = await fetch(url, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'novo' })
        });

        if (resposta.ok) {
            const resultado = await resposta.json();
            console.log('Status atualizado:', resultado.mensagem);
        } else {
            console.warn('Falha ao atualizar status:', await resposta.text());
        }
    } catch (error) {
        console.error('Erro ao atualizar status:', error);
    }
}

function dadosUsuarios() {
    const NomeUsuario = localStorage.getItem('funcionarioAtual');

    const avatar = document.getElementById('avatar');
    if (NomeUsuario === "Gabriel") {
        avatar.src = './assets/icons/gabriel.jpg';
    } else if (NomeUsuario === "luiz fernando") {
        avatar.src = './assets/icons/luiz.png';
    } else {
        avatar.src = './assets/icons/novo.png';
    }
}

async function atualizarRelatorioEquipamentos() {
    try {
        const responseEquipamentos = await fetch('http://127.0.0.1:5000/equipamentos_completos');
        const dadosEquipamentos = await responseEquipamentos.json();

        const responseUsados = await fetch('http://127.0.0.1:5000/equipamento');
        const dadosUsados = await responseUsados.json();

        let total = dadosEquipamentos.length;
        let usados = dadosUsados.length;
        let parados = total - usados;
        let emprestados = 0;
        let novos = 0;

        dadosEquipamentos.forEach(equip => {
            const status = equip.status.toLowerCase();
            if (status === 'emprestado') emprestados++;
            if (status === 'novo') novos++;
        });

        document.getElementById('totalEquipo').textContent = total;
        document.getElementById('totalSendoUsado').textContent = usados;
        document.getElementById('totalParado').textContent = parados;
        document.getElementById('totalEmprestado').textContent = emprestados;
        document.getElementById('totalNovos').textContent = novos;

    } catch (error) {
        console.error('Erro ao atualizar relatório de equipamentos:', error);
    }
}

function tela() {
    const button = document.getElementById('entrarNFC');
    const screenHeight = window.innerHeight;
    const screenWidth = window.innerWidth;

    if (screenWidth >= 1500) {
        button.style.bottom = "222px";
        button.style.right = "612px";
    } else if (screenWidth <= 1366) {

    } else {
        button.style.bottom = "120px";
    }
}

tela();

export { excluirMaterial, filtrarEquipamentos, carregarEstoque, carregarEquipamento, carregarBusca, dadosUsuarios, atualizarRelatorioEquipamentos, atualizaStatus };