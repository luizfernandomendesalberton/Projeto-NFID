async function excluirMaterial(id) {
    const confirmacao = confirm('Tem certeza que deseja excluir este material?');

    if (confirmacao) {
        try {
            const resposta = await fetch(`http://127.0.0.1:5000/excluir-material/${id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!resposta.ok) {
                throw new Error(`Erro HTTP: ${resposta.status}`);
            }

            const resultado = await resposta.json();
            alert(resultado.mensagem);
            location.reload();
        } catch (error) {
            console.error('Erro ao excluir material:', error);
        }
    }
}

export { excluirMaterial };