document.getElementById('gravarNFC').addEventListener('click', async () => {
    const nfid = document.getElementById('nfid').value;
    const nome = document.getElementById('nomeNFC').value;
    const status = document.getElementById('statusNFC').value;
    const resposta = document.getElementById('respostaNFC');

    if (!("NDEFReader" in window)) {
        resposta.textContent = "NFC não suportado neste navegador.";
        return;
    }

    try {
        const ndef = new NDEFReader();
        await ndef.write(JSON.stringify({ nfid, nome, status }));
        resposta.innerHTML = "<strong>Dados gravados com sucesso na tag NFC!</strong>";
    } catch (e) {
        resposta.innerHTML = "<strong>Erro ao gravar na tag NFC: </strong>" + e;
    }
});