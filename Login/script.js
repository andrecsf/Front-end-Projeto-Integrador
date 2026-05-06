const BASE_URL = "https://back-end-projeto-integrador.onrender.com/";

let selectedProfile = 'aluno';

 
function selectProfile(profile) {
    selectedProfile = profile;
    
    // Remove a classe 'active' de todos os cards
    const cards = document.querySelectorAll('.profile-card');
    cards.forEach(card => card.classList.remove('active'));

    // Adiciona a classe 'active' ao card clicado
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }
    
    console.log("Perfil visual selecionado:", selectedProfile);
}

/*
 * Processa o formulário de login
 */
document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const email = e.target.querySelector('input[type="email"]').value;
    const password = e.target.querySelector('input[type="password"]').value;

    const loginData = {
        email: email,
        password: password
    };

    try {
        const response = await fetch('${BASE_URL}/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData)
        });

        if (response.ok) {
            const data = await response.json(); 
            

            /**
             * VALIDAÇÃO DE PERFIL:
             
             */
            const roleDoBanco = data.role; 
            
            // Mapeamento para comparar os termos do Back com os termos do Front
            const rolesMap = {
                'ADMIN': 'admin',
                'COORDENADOR': 'coordenador',
                'ALUNO': 'aluno'
            };

            if (rolesMap[roleDoBanco] !== selectedProfile) {
                alert(`Acesso negado! Este utilizador tem perfil de ${rolesMap[roleDoBanco]}, mas selecionou o acesso de ${selectedProfile}.`);
                return; // Interrompe o login
            }

            // Se passar na validação, guarda os dados e entra
            localStorage.setItem('token', data.token);
            localStorage.setItem('userRole', roleDoBanco);

            alert('Login realizado com sucesso!');
            direcionarParaPainel(selectedProfile);

        } else {
            alert('Falha na autenticação: E-mail ou senha incorretos.');
        }
    } catch (error) {
        console.error('Erro de conexão:', error);
        alert('Erro ao conectar com o servidor. O Back-end está ativo?');
    }
});

/**
 * Redirecionamento após sucesso
 */
function direcionarParaPainel(perfil) {
    const paginas = {
        'admin': '../PerfilSuperadmin/dashboard-superadmin.html',
        'coordenador': '../TelaInicial/telaInicial.html',
        'aluno': 'dashboard-aluno.html'
    };
    
    window.location.href = paginas[perfil] || 'index.html';
}