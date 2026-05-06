// --- CONFIGURAÇÃO INICIAL ---
const studentForm = document.getElementById('student-form');

// 1. CAPTURA O ID DO CURSO DA URL (Ex: cadastrarAluno.html?cursoId=1)
const urlParams = new URLSearchParams(window.location.search);
const cursoIdDaUrl = urlParams.get('cursoId');
const token = localStorage.getItem('token'); // Recupera o token de autenticação

// Elementos do novo select
const courseSelectionGroup = document.getElementById('course-selection-group');
const selectCurso = document.getElementById('student-course');
const BASE_URL = "https://back-end-projeto-integrador.onrender.com";

// 2. LÓGICA DE INICIALIZAÇÃO
document.addEventListener('DOMContentLoaded', () => {
    setupSidebar();

    
    if (cursoIdDaUrl) {
        
        if (courseSelectionGroup) {
            courseSelectionGroup.style.display = 'none';
        }
        
        
        const pageTitle = document.getElementById('page-title');
        if (pageTitle) {
            pageTitle.innerText = "Vincular Aluno ao Curso";
        }
    } else {
        
        carregarCursosNoSelect();
    }
});


async function carregarCursosNoSelect() {
    try {
        const response = await fetch(`${BASE_URL}/cursos`, {
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

    
    const novoAluno = {
        name: document.getElementById('name').value,      
        email: document.getElementById('email').value,
        matricula: document.getElementById('matricula').value,
        turma: document.getElementById('turma').value,
        senha: document.getElementById('senha').value,    
        horasAcumuladas: 0 
    };

    
    const finalCursoId = cursoIdDaUrl || (selectCurso ? selectCurso.value : null);
    
    
    let endpoint = `${BASE_URL}/alunos`; 
    if (finalCursoId) {
        endpoint = `${BASE_URL}/alunos/curso/${finalCursoId}`; 
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
            
            
            if (cursoIdDaUrl) {
                
                window.location.href = `../PerfilCurso/perfil-Curso.html?id=${cursoIdDaUrl}`;
            } else {
                
                window.history.back();
            }
        } else {
            const erroData = await response.json();
            alert('Erro: ' + (erroData.message || 'Falha ao processar cadastro.'));
        }
    } catch (error) {
        console.error("Erro na requisição:", error);
        alert('Erro de conexão com o servidor. Verifique se o Backend está rodando.');
    }
});

function toggleMenu() {
    document.getElementById('sidebar').classList.toggle('collapsed');
    document.querySelector('.main-content').classList.toggle('expanded');
    const isCollapsed = document.getElementById('sidebar').classList.contains('collapsed');
    localStorage.setItem('sidebarCollapsed', isCollapsed);
}

function restoreMenuState() {
    const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    if (isCollapsed) {
        document.getElementById('sidebar').classList.add('collapsed');
        document.querySelector('.main-content').classList.add('expanded');
    }
}

function setupSidebar() {
    const sidebarHeader = document.getElementById('sidebar-header');
    if (sidebarHeader) {
        sidebarHeader.addEventListener('click', toggleMenu);
    }
    restoreMenuState();
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