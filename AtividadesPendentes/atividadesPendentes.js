/* 
   ATIVIDADES PENDENTES (FILA) - SCRIPT
*/

document.addEventListener('DOMContentLoaded', () => {
    // =========================
    // ELEMENTOS DOM
    // =========================
    const sidebar       = document.getElementById('sidebar');
    const mainContent   = document.getElementById('mainContent');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const pendingGrid   = document.getElementById('pendingGrid');
    const contador      = document.getElementById('contadorPendentes');

    // =========================
    // LÓGICA DO MENU
    // =========================
    function toggleMenu() {
        sidebar.classList.toggle('collapsed');
        mainContent.classList.toggle('expanded');
        localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
    }

    function restoreMenuState() {
        if (localStorage.getItem('sidebarCollapsed') === 'true') {
            sidebar.classList.add('collapsed');
            mainContent.classList.add('expanded');
        }
    }

    if (sidebarToggle) sidebarToggle.addEventListener('click', toggleMenu);
    restoreMenuState();

    // =========================
    // 🔐 AUTH (NOVO)
    // =========================
    function getToken() {
        return localStorage.getItem('token');
    }

    function authFetch(url, options = {}) {
        const token = getToken();

        if (!token) {
            console.warn("Sem token, redirecionando...");
            window.location.href = "/login.html";
            return Promise.reject("Sem token");
        }

        return fetch(url, {
            ...options,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                ...(options.headers || {})
            }
        });
    }

    // =========================
    // API
    // =========================
    const API_URL_SUBMISSOES = 'http://localhost:8080/submissoes';

    async function carregarPendentes() {
        try {
            // ✅ CORRIGIDO AQUI
            const response = await authFetch(API_URL_SUBMISSOES);

            if (response.status === 403) {
                throw new Error("Acesso negado (403)");
            }

            if (!response.ok) {
                throw new Error("Erro ao buscar submissões");
            }

            const todasSubmissoes = await response.json();

            const pendentes = todasSubmissoes
                .filter(sub => sub.status === 'PENDENTE')
                .sort((a, b) => new Date(a.dataEnvio) - new Date(b.dataEnvio));

            renderizarCards(pendentes);

        } catch (error) {
            console.error(error);
            pendingGrid.innerHTML = '<p style="color: red; grid-column: 1/-1; text-align: center;">Erro ao conectar com o servidor.</p>';
            contador.innerText = error.message;
        }
    }

    // =========================
    // RENDER
    // =========================
    function renderizarCards(pendentes) {
        pendingGrid.innerHTML = ''; 
        
        contador.innerText = `Você tem ${pendentes.length} atividade(s) aguardando revisão.`;

        if (pendentes.length === 0) {
            pendingGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 40px; background: white; border-radius: 12px; border: 1px solid var(--border-color);">
                    <i class="fa-regular fa-circle-check" style="font-size: 3rem; color: var(--green); margin-bottom: 15px;"></i>
                    <h3 style="color: var(--text-main);">Tudo limpo por aqui!</h3>
                    <p style="color: var(--text-muted);">Não há nenhuma atividade pendente de revisão no momento.</p>
                </div>`;
            return;
        }

        pendentes.forEach(sub => {
            const dataEnvio = new Date(sub.dataEnvio).toLocaleDateString('pt-BR');

            const cardHTML = `
                <div class="pending-card" onclick="abrirValidacao(${sub.id})">
                    <div class="card-top">
                        <h3>${sub.nomeAluno}</h3>
                        <span class="date-badge">
                            <i class="fa-regular fa-calendar"></i> ${dataEnvio}
                        </span>
                    </div>
                    
                    <div class="card-body">
                        <div class="detail-row">
                            <span class="detail-label">Categoria:</span>
                            <span class="detail-value">${sub.nomeCategoria}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Horas Solicitadas:</span>
                            <span class="detail-value">${sub.horasAproveitadas}h</span>
                        </div>
                    </div>

                    <div class="card-footer">
                        <span>Analisar Submissão <i class="fa-solid fa-arrow-right"></i></span>
                    </div>
                </div>
            `;

            pendingGrid.innerHTML += cardHTML;
        });
    }

    // =========================
    // NAVEGAÇÃO
    // =========================
    window.abrirValidacao = function(idSubmissao) {
        window.location.href = `../ValidarCertificado/validar-certificado.html?id=${idSubmissao}`;
    }

    // =========================
    // INIT
    // =========================
    carregarPendentes();
});