const studentForm = document.getElementById('student-form');

// 1. CAPTURA O ID DO CURSO DA URL
// Exemplo: cadastroAluno.html?cursoId=1
const urlParams = new URLSearchParams(window.location.search);
const cursoId = urlParams.get('cursoId');

// Validação de segurança: se não houver ID, volta para o gerenciamento
if (!cursoId) {
    alert("ID do curso não encontrado. Retornando ao gerenciador.");
    window.location.href = '../index.html';
}

// 2. ENVIAR DADOS PARA O BACKEND
studentForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Montando o objeto exatamente como o AlunoDTO espera (sem o campo curso)
    const novoAluno = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        matricula: document.getElementById('matricula').value,
        turma: document.getElementById('turma').value,
        senha: document.getElementById('senha').value,
        horasAcumuladas: 0 // Valor inicial padrão
    };

    console.log("Enviando Aluno para o curso ID " + cursoId + ":", novoAluno);

    try {
        // Usando o NOVO ENDPOINT que criamos no Java
        const response = await fetch(`http://localhost:8080/alunos/curso/${cursoId}`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify(novoAluno)
        });

        if (response.ok) {
            alert('Aluno cadastrado e vinculado com sucesso!');
            // Redireciona de volta para o perfil do curso específico
            window.location.href = `../PerfilCurso/perfil-Curso.html?id=${cursoId}`;
        } else {
            const erro = await response.json();
            alert('Erro: ' + (erro.message || 'Falha ao cadastrar aluno.'));
        }
    } catch (error) {
        console.error("Erro na requisição:", error);
        alert('Erro de conexão com o servidor. Verifique se o Backend está rodando.');
    }
});

// 3. SIDEBAR TOGGLE (Mantendo sua lógica original)
const sidebarHeader = document.querySelector('.sidebar-header');
if (sidebarHeader) {
    sidebarHeader.addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('collapsed');
        document.querySelector('.main-content').classList.toggle('expanded');
    });
}