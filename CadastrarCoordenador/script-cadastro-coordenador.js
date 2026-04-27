// Elementos do DOM
const toggleMenuBtn = document.getElementById('toggle-menu');
const sidebar = document.getElementById('sidebar');
const mainContent = document.querySelector('.main-content');
const coordinatorForm = document.getElementById('coordinator-form');
const btnTogglePassword = document.getElementById('btn-toggle-password');
const passwordInput = document.getElementById('coordinator-password');
const btnSave = document.getElementById('btn-save');
const btnCancel = document.getElementById('btn-cancel');

// Função para alternar o menu
function toggleMenu() {
    sidebar.classList.toggle('collapsed');
    mainContent.classList.toggle('expanded');
    
    // Salvar estado do menu no localStorage
    const isCollapsed = sidebar.classList.contains('collapsed');
    localStorage.setItem('sidebarCollapsed', isCollapsed);
}

// Restaurar estado do menu ao carregar a página
function restoreMenuState() {
    const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    if (isCollapsed) {
        sidebar.classList.add('collapsed');
        mainContent.classList.add('expanded');
    }
}

// Função para alternar visibilidade da senha
function togglePasswordVisibility() {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    
    // Alterar ícone
    const icon = btnTogglePassword.querySelector('i');
    if (type === 'text') {
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Função para validar e-mail
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Função para validar senha
function isValidPassword(password) {
    // Mínimo de 6 caracteres
    return password.length >= 6;
}

// Submissão do formulário
coordinatorForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Coletar dados do formulário
    const coordinatorData = {
        name: document.getElementById('coordinator-name').value.trim(),
        email: document.getElementById('coordinator-email').value.trim(),
        password: document.getElementById('coordinator-password').value
    };

    // Validação básica
    if (!coordinatorData.name) {
        alert('Por favor, digite o nome completo.');
        return;
    }

    if (!isValidEmail(coordinatorData.email)) {
        alert('Por favor, digite um e-mail válido.');
        return;
    }

    if (!isValidPassword(coordinatorData.password)) {
        alert('A senha deve ter no mínimo 6 caracteres.');
        return;
    }

    try {
        // Aqui você faria a chamada para o backend
        // Exemplo:
        // const response = await fetch('/api/coordinators', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(coordinatorData)
        // });
        // if (!response.ok) throw new Error('Erro ao salvar coordenador');
        // const result = await response.json();
        
        // Por enquanto, apenas exibir uma mensagem de sucesso
        console.log('Dados do coordenador:', coordinatorData);
        alert('Coordenador cadastrado com sucesso!');
        
        // Redirecionar para a página anterior
        window.history.back();
    } catch (error) {
        console.error('Erro ao salvar coordenador:', error);
        alert('Erro ao salvar o coordenador. Tente novamente.');
    }
});

// Event Listeners
document.querySelector('.sidebar-header').addEventListener('click', toggleMenu);

btnTogglePassword.addEventListener('click', (e) => {
    e.preventDefault();
    togglePasswordVisibility();
});

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    // Restaurar estado do menu
    restoreMenuState();
});

/**
 * Exemplo de função para integração com backend
 * Descomente e adapte conforme sua API
 */
async function saveCoordinatorToBackend(coordinatorData) {
    try {
        const response = await fetch('/api/coordinators', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // 'Authorization': 'Bearer SEU_TOKEN_AQUI'
            },
            body: JSON.stringify(coordinatorData)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Coordenador salvo com sucesso:', result);
        return result;
    } catch (error) {
        console.error('Erro ao salvar coordenador no backend:', error);
        throw error;
    }
}
