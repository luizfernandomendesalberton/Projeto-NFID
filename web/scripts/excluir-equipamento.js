import { backendBase } from './script.js';

export async function excluirEquipamentoCompleto(id) {
    if (!confirm('Tem certeza que deseja excluir este equipamento?')) return;

    // Exclui do estoque
    const estoqueResp = await fetch(`${backendBase}/estoque/${id}`, { method: 'DELETE' });

    // Exclui do material (caso exista)
    const materialResp = await fetch(`${backendBase}/excluir-material/${id}`, { method: 'DELETE' });

    if (estoqueResp.ok && (materialResp.ok || materialResp.status === 404)) {
        alert('Equipamento excluído com sucesso!');
        // Recarrega a tabela
        if (typeof carregarBusca === 'function') carregarBusca();
        else location.reload();
    } else {
        alert('Erro ao excluir equipamento.');
    }
}