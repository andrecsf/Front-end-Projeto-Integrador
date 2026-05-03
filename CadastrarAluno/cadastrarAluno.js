// --- CONFIGURAÇÃO INICIAL ---
const studentForm = document.getElementById('student-form');

// 1. CAPTURA O ID DO CURSO DA URL (Ex: cadastrarAluno.html?cursoId=1)
const urlParams = new URLSearchParams(window.location.search);
const cursoId = urlParams.get('cursoId');
const token = localStorage.getItem('token'); // Recupera o token de autenticação[cite: 3]

// Validação: se não houver ID do curso, redireciona para evitar erro na API
if (!cursoId) {
    alert("ID do curso não encontrado. Retornando ao gerenciador.");
    window.location.href = '../index.html';
}

// 2. LÓGICA DE ENVIO DO FORMULÁRIO
studentForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Captura os valores dos inputs e monta o objeto conforme o AlunoDTO.java[cite: 4, 6]
    const novoAluno = {
        name: document.getElementById('name').value,      // Corrigido para 'name' (igual ao DTO)
        email: document.getElementById('email').value,
        matricula: document.getElementById('matricula').value,
        turma: document.getElementById('turma').value,
        senha: document.getElementById('senha').value,    // Corrigido para 'senha' (igual ao DTO)
        horasAcumuladas: 0 
    };

    console.log("Tentando cadastrar aluno no curso " + cursoId, novoAluno);

    try {
        // Envia para o endpoint que já vincula ao curso
        const response = await fetch(`http://localhost:8080/alunos/curso/${cursoId}`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Inclui o token se o backend exigir[cite: 3]
            },
            body: JSON.stringify(novoAluno)
        });

        if (response.ok) {
            alert('Aluno cadastrado e vinculado com sucesso!');
            // Redireciona de volta para a tela de perfil do curso
            window.location.href = `../PerfilCurso/perfil-Curso.html?id=${cursoId}`;
        } else {
            // Tenta capturar a mensagem de erro vinda do Service (ex: "E-mail já cadastrado!")
            const erroData = await response.json();
            alert('Erro: ' + (erroData.message || 'Falha ao cadastrar aluno. Verifique se os dados já existem.'));
        }
    } catch (error) {
        console.error("Erro na requisição:", error);
        alert('Erro de conexão com o servidor. Verifique se o Backend está rodando.');
    }
});

// --- COMPORTAMENTO DA INTERFACE (SIDEBAR) ---
const sidebarHeader = document.querySelector('.sidebar-header');
if (sidebarHeader) {
    sidebarHeader.addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('collapsed');
        document.querySelector('.main-content').classList.toggle('expanded');
    });
}

// --- FUNÇÃO DE CANCELAR ---
// Caso queira usar um botão de cancelar via JS
const btnCancel = document.querySelector('.btn-cancel');
if (btnCancel) {
    btnCancel.addEventListener('click', () => {
        window.location.href = `../PerfilCurso/perfil-Curso.html?id=${cursoId}`;
    });
}