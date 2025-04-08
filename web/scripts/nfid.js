
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

export { loginNFC };