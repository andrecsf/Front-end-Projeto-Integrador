// Elementos do DOM
const sidebar = document.getElementById('sidebar');
const mainContent = document.querySelector('.main-content');
const coordinatorForm = document.getElementById('coordinator-form');
const btnTogglePassword = document.getElementById('btn-toggle-password');
const passwordInput = document.getElementById('coordinator-password');
const btnSave = document.getElementById('btn-save');

// Função para alternar o menu
function toggleMenu() {
    sidebar.classList.toggle('collapsed');
    mainContent.classList.toggle('expanded');
    const isCollapsed = sidebar.classList.contains('collapsed');
    localStorage.setItem('sidebarCollapsed', isCollapsed);
}

// Restaurar estado do menu
function restoreMenuState() {
    const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    if (isCollapsed) {
        sidebar.classList.add('collapsed');
        mainContent.classList.add('expanded');
    }
}

// Visibilidade da senha
function togglePasswordVisibility() {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    const icon = btnTogglePassword.querySelector('i');
    icon.classList.toggle('fa-eye');
    icon.classList.toggle('fa-eye-slash');
}

// --- INTEGRAÇÃO COM BACKEND ---

async function carregarCursosNoSelect() {
    const selectCurso = document.getElementById('coordinator-course');
    if (!selectCurso) return; 

    const token = localStorage.getItem('token');

    try {
        const response = await fetch('http://localhost:8080/cursos', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const cursos = await response.json();

        cursos.forEach(curso => {
            const option = document.createElement('option');
            option.value = curso.id;
            option.textContent = curso.nome;
            selectCurso.appendChild(option);
        });
    } catch (error) {
        console.error('Erro ao carregar cursos:', error);
    }
}

// Submissão do formulário
coordinatorForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const token = localStorage.getItem('token');
    const cursoId = document.getElementById('coordinator-course')?.value;

    const coordinatorData = {
        name: document.getElementById('coordinator-name').value.trim(),
        email: document.getElementById('coordinator-email').value.trim(),
        password: passwordInput.value
    };

    if (coordinatorData.password.length < 6) {
        alert('A senha deve ter no mínimo 6 caracteres.');
        return;
    }

    btnSave.disabled = true;
    btnSave.innerText = 'Salvando...';

    try {
        // 1. Salvar o Coordenador
        const response = await fetch('http://localhost:8080/coordenadores', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(coordinatorData)
        });

        if (!response.ok) throw new Error('Erro ao cadastrar coordenador (Email já existe ou erro no servidor)');

        const novoCoord = await response.json();

        // 2. Vínculo Opcional
        if (cursoId) {
            await fetch(`http://localhost:8080/coordenadores/${novoCoord.id}/cursos/${cursoId}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
        }

        alert('Coordenador cadastrado com sucesso!');
        window.history.back();

    } catch (error) {
        alert(error.message);
    } finally {
        btnSave.disabled = false;
        btnSave.innerText = 'Finalizar Vínculo';
    }
});

// Event Listeners
document.querySelector('.sidebar-header').addEventListener('click', toggleMenu);
btnTogglePassword.addEventListener('click', (e) => {
    e.preventDefault();
    togglePasswordVisibility();
});

document.addEventListener('DOMContentLoaded', () => {
    restoreMenuState();
    carregarCursosNoSelect(); // Carrega os cursos assim que a página abrir
});