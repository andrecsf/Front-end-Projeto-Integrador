// --- CONFIGURAÇÃO INICIAL ---
const studentForm = document.getElementById('student-form');

// 1. CAPTURA O ID DO CURSO DA URL (Ex: cadastrarAluno.html?cursoId=1)
const urlParams = new URLSearchParams(window.location.search);
const cursoIdDaUrl = urlParams.get('cursoId');
const token = localStorage.getItem('token'); // Recupera o token de autenticação

// Elementos do novo select
const courseSelectionGroup = document.getElementById('course-selection-group');
const selectCurso = document.getElementById('student-course');

// 2. LÓGICA DE INICIALIZAÇÃO
document.addEventListener('DOMContentLoaded', () => {
    // Se o ID do curso estiver na URL, ele veio da tela de perfil do curso
    if (cursoIdDaUrl) {
        // Esconde o campo de seleção de curso, pois já sabemos qual é
        if (courseSelectionGroup) {
            courseSelectionGroup.style.display = 'none';
        }
        
        // Atualiza o título da página
        const pageTitle = document.getElementById('page-title');
        if (pageTitle) {
            pageTitle.innerText = "Vincular Aluno ao Curso";
        }
    } else {
        // Se for um cadastro global (sem ID na URL), carrega a lista de cursos no select
        carregarCursosNoSelect();
    }
});

// Função para buscar os cursos no backend e preencher o <select>
async function carregarCursosNoSelect() {
    try {
        const response = await fetch('http://localhost:8080/cursos', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error("Erro ao buscar cursos");
        
        const cursos = await response.json();
        cursos.forEach(curso => {
            const option = document.createElement('option');
            option.value = curso.id;
            option.textContent = curso.nome;
            if (selectCurso) {
                selectCurso.appendChild(option);
            }
        });
    } catch (error) {
        console.error('Erro ao carregar cursos:', error);
    }
}

// 3. LÓGICA DE ENVIO DO FORMULÁRIO
studentForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Captura os valores dos inputs e monta o objeto conforme o AlunoDTO.java
    const novoAluno = {
        name: document.getElementById('name').value,      
        email: document.getElementById('email').value,
        matricula: document.getElementById('matricula').value,
        turma: document.getElementById('turma').value,
        senha: document.getElementById('senha').value,    
        horasAcumuladas: 0 
    };

    // Define qual ID de curso usar: o da URL (prioridade) ou o selecionado no <select>
    const finalCursoId = cursoIdDaUrl || (selectCurso ? selectCurso.value : null);
    
    // Define para qual endpoint mandar a requisição dependendo se tem curso ou não
    let endpoint = 'http://localhost:8080/alunos'; // Cadastro comum sem vincular curso
    if (finalCursoId) {
        endpoint = `http://localhost:8080/alunos/curso/${finalCursoId}`; // Cadastro ou Vínculo com curso
    }

    console.log(`Enviando para: ${endpoint}`, novoAluno);

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify(novoAluno)
        });

        if (response.ok) {
            alert('Aluno processado com sucesso!');
            
            // Redirecionamento inteligente após o sucesso
            if (cursoIdDaUrl) {
                // Se veio do perfil do curso, volta para lá
                window.location.href = `../PerfilCurso/perfil-Curso.html?id=${cursoIdDaUrl}`;
            } else {
                // Se veio do menu global, volta para a página anterior
                window.history.back();
            }
        } else {
            // Tenta capturar a mensagem de erro específica vinda do Service
            const erroData = await response.json();
            alert('Erro: ' + (erroData.message || 'Falha ao processar cadastro.'));
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
const btnCancel = document.querySelector('.btn-cancel');
if (btnCancel) {
    btnCancel.addEventListener('click', () => {
        // Cancelamento inteligente
        if (cursoIdDaUrl) {
            window.location.href = `../PerfilCurso/perfil-Curso.html?id=${cursoIdDaUrl}`;
        } else {
            window.history.back();
        }
    });
}