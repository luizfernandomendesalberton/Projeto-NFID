async function excluirMaterial(id) {
    const confirmacao = confirm('Tem certeza que deseja excluir este material?');

    if (!confirmacao) return;

    const urls = [
        `http://127.0.0.1:5000/excluir-material/${id}`,
        `https://b188-177-74-79-181.ngrok-free.app/excluir-material/${id}`
    ];

    for (const url of urls) {
        try {
            const resposta = await fetch(url, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
            });

            if (resposta.ok) {
                const resultado = await resposta.json();
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

export { excluirMaterial };