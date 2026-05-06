
const sidebar = document.getElementById('sidebar');
const mainContent = document.querySelector('.main-content');
const API_BASE_URL = 'https://back-end-projeto-integrador.onrender.com'; 


document.addEventListener('DOMContentLoaded', () => {
    // Verificações de segurança
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userRole');

    if (!token || role !== 'ADMIN') {
        window.location.href = '../Login/index.html';
        return;
    }

    // Inicializa funções de interface
    if (sidebar) restoreMenuState();
    updateCurrentDate();
    configurarLogout();
    configurarAcoesRapidas();
    
    // Chamadas iniciais
    loadSystemData();
    checkSystemHealth();

    // Atualiza os dados periodicamente (5 em 5 minutos)
    setInterval(() => {
        loadSystemData();
        checkSystemHealth();
    }, 5 * 60 * 1000);
});


function configurarAcoesRapidas() {
    const botoesAcao = document.querySelectorAll('.action-btn');

    if (botoesAcao.length >= 4) {
        // Botão 0: Novo Curso
        botoesAcao[0].onclick = (e) => {
            e.preventDefault();
            window.location.href = '../CadastrarCurso/cadastroCurso.html';
        };

        // Botão 1: Novo Coordenador
        const labelCoord = botoesAcao[1].querySelector('span');
        if (labelCoord) labelCoord.textContent = 'Novo Coordenador';
        const iconeCoord = botoesAcao[1].querySelector('i');
        if (iconeCoord) iconeCoord.className = 'fas fa-user-tie';

        botoesAcao[1].onclick = (e) => {
            e.preventDefault();
            window.location.href = '../CadastrarCoordenador/cadastro-Coordenador.html';
        };
        
        // Botão 2: Gerenciar Cursos
        if (botoesAcao[2]) {
            botoesAcao[2].onclick = (e) => {
                e.preventDefault();
                window.location.href = '../GerenciarCurso/gerenciarCursos.html';
            };
        }

        // Botão 3: Novo Aluno
        const labelAluno = botoesAcao[3].querySelector('span');
        if (labelAluno) labelAluno.textContent = 'Novo Aluno';
        const iconeAluno = botoesAcao[3].querySelector('i');
        if (iconeAluno) iconeAluno.className = 'fas fa-user-graduate';

        botoesAcao[3].onclick = (e) => {
            e.preventDefault();
            window.location.href = '../CadastrarAluno/cadastrarAluno.html'; 
        };
    }
}


async function loadSystemData() {
    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };

    try {
        const [resAlunos, resCursos, resCoords] = await Promise.all([
            fetch(`${API_BASE_URL}/alunos`, { headers }),
            fetch(`${API_BASE_URL}/cursos`, { headers }),
            fetch(`${API_BASE_URL}/coordenadores`, { headers })
        ]);

        if (resAlunos.ok && resCursos.ok && resCoords.ok) {
            const alunos = await resAlunos.json();
            const cursos = await resCursos.json();
            const coordenadores = await resCoords.json();

            // Atualiza os cards numéricos
            document.getElementById('total-courses').textContent = cursos.length;
            document.getElementById('total-students').textContent = alunos.length;
            document.getElementById('total-coordinators').textContent = coordenadores.length;
            
            const totalHoras = alunos.reduce((acc, a) => acc + (a.horasAcumuladas || 0), 0);
            document.getElementById('total-hours').textContent = totalHoras.toLocaleString('pt-BR');
        }
    } catch (error) {
        console.error('Erro ao carregar dados dos KPIs:', error);
    }
}


async function checkSystemHealth() {
    const sStatus = document.getElementById('status-server');
    const sDetail = document.getElementById('detail-server');
    const dbStatus = document.getElementById('status-db');
    const dbDetail = document.getElementById('detail-db');
    const mailStatus = document.getElementById('status-mail');
    const mailDetail = document.getElementById('detail-mail');

    // Remove as classes de cor anteriores
    sStatus.className = 'health-status';
    dbStatus.className = 'health-status';
    mailStatus.className = 'health-status';

    try {
        const start = performance.now();
        // Endpoint do Actuator (certifique-se de que a URL base está correta e a rota aberta no SecurityConfig)
        const response = await fetch(`${API_BASE_URL}/actuator/health`); 
        const end = performance.now();
        const ping = Math.round(end - start);

        if (response.ok) {
            const data = await response.json();

            // 1. Status Geral do Servidor
            if (data.status === 'UP') {
                sStatus.classList.add('online');
                sDetail.textContent = `Online • Resposta: ${ping}ms`;
            } else {
                sStatus.classList.add('offline');
                sDetail.textContent = 'Instável • Verifique os logs';
            }

            // 2. Status do Banco de Dados
            if (data.components && data.components.db) {
                if (data.components.db.status === 'UP') {
                    dbStatus.classList.add('online');
                    // Mostra qual banco de dados está usando baseado no seu JSON
                    dbDetail.textContent = `Online • ${data.components.db.details.database}`; 
                } else {
                    dbStatus.classList.add('offline');
                    dbDetail.textContent = 'Offline • Sem conexão com Banco';
                }
            }

            // 3. Status do E-mail (SMTP)
            if (data.components && data.components.mail) {
                if (data.components.mail.status === 'UP') {
                    mailStatus.classList.add('online');
                    // Mostra o host do e-mail do seu JSON
                    mailDetail.textContent = `Online • ${data.components.mail.details.location}`; 
                } else {
                    mailStatus.classList.add('offline');
                    mailDetail.textContent = 'Offline • Falha no SMTP';
                }
            }

        } else {
            throw new Error("Actuator retornou status diferente de 2xx");
        }
    } catch (error) {
        console.warn("Falha ao se comunicar com /actuator/health:", error);
        
        // Em caso de catch, o backend está inacessível
        sStatus.classList.add('offline');
        sDetail.textContent = 'Offline • Sem conexão';
        
        dbStatus.classList.add('offline');
        dbDetail.textContent = 'Desconhecido';
        
        mailStatus.classList.add('offline');
        mailDetail.textContent = 'Desconhecido';
    }
}


function toggleMenu() {
    if (sidebar && mainContent) {
        sidebar.classList.toggle('collapsed');
        mainContent.classList.toggle('expanded');
        localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
    }
}

function restoreMenuState() {
    if (localStorage.getItem('sidebarCollapsed') === 'true') {
        sidebar.classList.add('collapsed');
        mainContent.classList.add('expanded');
    }
}

function updateCurrentDate() {
    const el = document.getElementById('current-date');
    if (el) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        el.textContent = new Date().toLocaleDateString('pt-BR', options);
    }
}

function configurarLogout() {
    const btn = document.querySelector('.user-text a');
    if (btn) {
        btn.onclick = (e) => {
            e.preventDefault();
            localStorage.clear();
            window.location.href = '../Login/index.html';
        };
    }
}

const menuTrigger = document.querySelector('.sidebar-header');
if (menuTrigger) menuTrigger.onclick = toggleMenu;