document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('gravarLoginNFC');
    if (!btn) return;

    btn.addEventListener('click', async (event) => {
        event.preventDefault();

        const username = document.getElementById('usuarioNFC').value;
        const password = document.getElementById('senhaNFC').value;
        const resposta = document.getElementById('respostaLoginNFC');

        if (!username || !password) {
            resposta.innerHTML = "<strong>Preencha usuário e senha!</strong>";
            return;
        }

        if (!("NDEFReader" in window)) {
            resposta.innerHTML = "<strong>NFC não suportado neste navegador.</strong>";
            return;
        }

        try {
            const ndef = new NDEFReader();
            await ndef.write(JSON.stringify({ username, password }));
            resposta.innerHTML = "<strong>Login gravado com sucesso na tag NFC!</strong>";
        } catch (e) {
            resposta.innerHTML = "<strong>Erro ao gravar login na tag NFC: </strong>" + e;
        }
    });
});