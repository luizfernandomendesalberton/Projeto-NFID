// Cadastro de usuário via NFC
export async function cadastraUsuarioNFC() {
    try {
        if ("NDEFReader" in window) {
            const ndef = new NDEFReader();
            await ndef.scan();

            let resposta = document.getElementById("resposta");
            if (!resposta) {
                resposta = document.createElement("div");
                resposta.id = "resposta";
                resposta.style.margin = "10px 0";
                document.body.appendChild(resposta);
            }
            resposta.style.display = "block";
            resposta.innerHTML = "<strong>Aguardando leitura da tag NFC...</strong>";

            ndef.onreading = async event => {
                resposta.style.display = "none";
                const decoder = new TextDecoder();
                for (const record of event.message.records) {
                    const rawData = decoder.decode(record.data);
                    try {
                        const dados = JSON.parse(rawData);
                        // Espera-se que a tag tenha pelo menos username e password
                        if (!dados.username || !dados.password) {
                            alert("A tag NFC deve conter pelo menos username e password.");
                            return;
                        }
                        // Monta o objeto para cadastro
                        const usuario = {
                            username: dados.username,
                            password: dados.password,
                            nome: dados.nome || '',
                            cargo: dados.cargo || '',
                            email: dados.email || ''
                        };
                        // Envia para o backend
                        const resp = await fetch('/cadastro-usuario', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(usuario)
                        });
                        if (resp.ok) {
                            const result = await resp.json();
                            alert(result.mensagem || 'Usuário cadastrado com sucesso!');
                        } else {
                            const result = await resp.json();
                            alert(result.mensagem || 'Erro ao cadastrar usuário.');
                        }
                    } catch (erro) {
                        resposta.style.display = "block";
                        resposta.innerHTML = "<strong>Erro ao interpretar os dados da tag NFC.</strong>";
                        setTimeout(() => { resposta.style.display = "none"; }, 2000);
                    }
                }
            };
        } else {
            alert("NFC não é suportado neste navegador.");
        }
    } catch (erro) {
        alert("Erro ao tentar usar NFC.");
    }
}

async function loginNFC() {
    try {
        if ("NDEFReader" in window) {
            const ndef = new NDEFReader();
            await ndef.scan();

            const resposta = document.getElementById("resposta");
            resposta.style.display = "block";
            resposta.innerHTML = "<strong>Aguardando leitura da tag NFC...</strong>";

            ndef.onreading = event => {
                resposta.style.display = "none";
                const decoder = new TextDecoder();
                for (const record of event.message.records) {
                    const rawData = decoder.decode(record.data);
                    console.log("Dado NFC bruto:", rawData);

                    try {
                        const dados = JSON.parse(rawData);

                        document.getElementById("username").value = dados.username || "";
                        document.getElementById("password").value = dados.password || "";

                        document.getElementById("entrarFuncionario").click();

                    } catch (erro) {
                        console.error("Erro ao interpretar os dados da tag:", erro);
                        resposta.style.display = "block";
                        resposta.innerHTML = "<strong>Erro ao interpretar os dados da tag NFC.</strong>";
                        setTimeout(() => {
                            resposta.style.display = "none";
                        }, 2000);
                    }
                }
            };
        } else {
            alert("NFC não é suportado neste navegador.");
        }
    } catch (erro) {
        console.error("Erro ao iniciar a leitura NFC:", erro);
        alert("Erro ao tentar usar NFC.");
    }
}
export async function buscaNFID() {
    try {
        if ("NDEFReader" in window) {
            const ndef = new NDEFReader();
            await ndef.scan();

            const resposta = document.getElementById("resposta");
            if (resposta) {
                resposta.style.display = "block";
                resposta.innerHTML = "<strong>Aguardando leitura da tag NFC...</strong>";
            }

            ndef.onreading = async event => {
                if (resposta) resposta.style.display = "none";
                const decoder = new TextDecoder();
                for (const record of event.message.records) {
                    const rawData = decoder.decode(record.data);
                    try {
                        const dados = JSON.parse(rawData);
                        const idBuscado = dados.id || dados.nfid || dados.numeroSerie || "";
                        if (!idBuscado) {
                            alert("Tag NFC não contém ID do equipamento.");
                            return;
                        }
                        // Busca o equipamento na lista e exibe na tabela, incluindo local, funcionário e ação de exclusão
                        const buscaTable = document.getElementById('buscaTable')?.getElementsByTagName('tbody')[0];
                        if (!buscaTable) return;
                        // Busca dados completos
                        const [resEstoque, resMateriais] = await Promise.all([
                            fetch(`${window.backendBase || ''}/estoque`),
                            fetch(`${window.backendBase || ''}/equipamentos_completos`)
                        ]);
                        if (resEstoque.ok && resMateriais.ok) {
                            const lista = await resEstoque.json();
                            const materiaisJson = await resMateriais.json();
                            const materiais = {};
                            materiaisJson.forEach(material => {
                                materiais[material.id] = {
                                    local: material.local || 'Não atribuído',
                                    funcionario: material.funcionario || 'Nenhum'
                                };
                            });
                            buscaTable.innerHTML = '';
                            const encontrado = lista.find(e => String(e.id) === String(idBuscado));
                            if (encontrado) {
                                const row = buscaTable.insertRow();
                                row.insertCell(0).textContent = encontrado.id;
                                row.insertCell(1).textContent = encontrado.nome;
                                // Status
                                const funcionario = materiais[encontrado.id]?.funcionario || 'Nenhum';
                                const novoStatus = funcionario !== 'Nenhum' ? 'Em Uso' : encontrado.status;
                                row.insertCell(2).textContent = novoStatus;
                                // Local
                                const local = materiais[encontrado.id]?.local || 'Não atribuído';
                                row.insertCell(3).textContent = local;
                                // Funcionário
                                row.insertCell(4).textContent = funcionario;
                                // Ações
                                const cellAcoes = row.insertCell(5);
                                const btnExcluir = document.createElement('button');
                                btnExcluir.textContent = 'Excluir';
                                btnExcluir.className = 'btn-excluir';
                                btnExcluir.onclick = () => {
                                    import('./excluir-equipamento.js').then(mod => mod.excluirEquipamentoCompleto(encontrado.id));
                                };
                                cellAcoes.appendChild(btnExcluir);
                            } else {
                                buscaTable.innerHTML = '<tr><td colspan="6">Equipamento não encontrado.</td></tr>';
                            }
                        }
                    } catch (erro) {
                        if (resposta) {
                            resposta.style.display = "block";
                            resposta.innerHTML = "<strong>Erro ao interpretar os dados da tag NFC.</strong>";
                            setTimeout(() => { resposta.style.display = "none"; }, 2000);
                        }
                    }
                }
            };
        } else {
            alert("NFC não é suportado neste navegador.");
        }
    } catch (erro) {
        alert("Erro ao tentar usar NFC.");
    }
}
export async function cadastraNFID() {
    try {
        if ("NDEFReader" in window) {
            const ndef = new NDEFReader();
            await ndef.scan();

            const resposta = document.getElementById("resposta");
            if (resposta) {
                resposta.style.display = "block";
                resposta.innerHTML = "<strong>Aguardando leitura da tag NFC...</strong>";
            }

            ndef.onreading = event => {
                if (resposta) resposta.style.display = "none";
                const decoder = new TextDecoder();
                for (const record of event.message.records) {
                    const rawData = decoder.decode(record.data);
                    try {
                        const dados = JSON.parse(rawData);
                        // Preenche os campos do formulário de cadastro
                       document.getElementById("id").value = dados.id || dados.nfid || dados.numeroSerie || "";
                        document.getElementById("nomeEquipamento").value = dados.nome || "";
                        document.getElementById("status").value = (dados.status || "novo").toLowerCase();

                        // Aciona o cadastro automaticamente
                        const btn = document.getElementById("cadastrarButton");
                        if (btn) btn.click();

                    } catch (erro) {
                        if (resposta) {
                            resposta.style.display = "block";
                            resposta.innerHTML = "<strong>Erro ao interpretar os dados da tag NFC.</strong>";
                            setTimeout(() => { resposta.style.display = "none"; }, 2000);
                        }
                    }
                }
            };
        } else {
            alert("NFC não é suportado neste navegador.");
        }
    } catch (erro) {
        alert("Erro ao tentar usar NFC.");
    }
}
export async function cadastraPorNFID() {
    try {
        if ("NDEFReader" in window) {
            const ndef = new NDEFReader();
            await ndef.scan();

            const resposta = document.getElementById("resposta");
            if (resposta) {
                resposta.style.display = "block";
                resposta.innerHTML = "<strong>Aguardando leitura da tag NFC...</strong>";
            }

            ndef.onreading = event => {
                if (resposta) resposta.style.display = "none";
                const decoder = new TextDecoder();
                for (const record of event.message.records) {
                    const rawData = decoder.decode(record.data);
                    try {
                        const dados = JSON.parse(rawData);
                        // Preenche apenas o campo de número de série do formulário de utilização
                        document.getElementById("numeroSerie").value = dados.id || dados.nfid || dados.numeroSerie || "";

                        // Aciona o cadastro automaticamente
                        const btn = document.querySelector('#cadastroForm button[type="submit"]');
                        if (btn) btn.click();

                    } catch (erro) {
                        if (resposta) {
                            resposta.style.display = "block";
                            resposta.innerHTML = "<strong>Erro ao interpretar os dados da tag NFC.</strong>";
                            setTimeout(() => { resposta.style.display = "none"; }, 2000);
                        }
                    }
                }
            };
        } else {
            alert("NFC não é suportado neste navegador.");
        }
    } catch (erro) {
        alert("Erro ao tentar usar NFC.");
    }
}

export { loginNFC };
