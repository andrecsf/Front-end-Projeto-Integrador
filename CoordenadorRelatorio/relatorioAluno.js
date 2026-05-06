
const BASE_URL = "https://back-end-projeto-integrador.onrender.com";

// ── Lê o alunoId da query string da URL ──────────────────────
function getAlunoIdDaURL() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('alunoId');
    if (!id) {
        mostrarErro("ID do aluno não informado. Volte para a lista e tente novamente.");
        return null;
    }
    return id;
}

// ── Token JWT ─────────────────────────────────────────────────
function getToken() {
    const token = localStorage.getItem('token');
    if (!token) {
        alert("Sessão expirada. Faça login novamente.");
        window.location.href = "../Login/index.html";
        return null;
    }
    return token;
}

function authHeaders() {
    return {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
    };
}

// ── Elementos do DOM ──────────────────────────────────────────
const nomeAlunoEl    = document.getElementById("nome-aluno");
const horasTextoEl   = document.getElementById("horas-texto");
const percentEl      = document.getElementById("percent");
const progressBarEl  = document.getElementById("progress");
const cardsContainer = document.getElementById("cards-container");
const loadingEl      = document.getElementById("loading");
const erroEl         = document.getElementById("erro-msg");

// ── Utilitários ───────────────────────────────────────────────
function formatarData(isoString) {
    if (!isoString) return "—";
    return new Date(isoString).toLocaleDateString("pt-BR");
}

function mostrarErro(msg) {
    if (erroEl) { erroEl.textContent = msg; erroEl.style.display = "block"; }
    if (loadingEl) loadingEl.style.display = "none";
}

function ocultarLoading() {
    if (loadingEl) loadingEl.style.display = "none";
}

// ── Card de atividade ─────────────────────────────────────────
function criarCardAtividade(submissao) {
    const card = document.createElement("div");
    card.className = "card atividade";

    const statusClass = submissao.status === "APROVADO" ? "tag-aprovado"
                      : submissao.status === "REJEITADO" ? "tag-rejeitado"
                      : "tag-pendente";
    const statusLabel = submissao.status === "APROVADO" ? "Aprovado"
                      : submissao.status === "REJEITADO" ? "Rejeitado"
                      : "Pendente";

    const certLink = submissao.urlCertificado
        ? `<a class="cert-link" href="${submissao.urlCertificado}" target="_blank">📎 Ver certificado</a>`
        : "";

    const obs = (submissao.status === "REJEITADO" && submissao.observacaoCoordenador)
        ? `<p class="obs-coord">💬 ${submissao.observacaoCoordenador}</p>`
        : "";

    card.innerHTML = `
        <div class="card-header-row">
            <h3>${submissao.nomeCategoria || "Atividade Complementar"}</h3>
            <span class="tag ${statusClass}">${statusLabel}</span>
        </div>
        <p>📅 ${formatarData(submissao.dataEnvio)} · <strong>${submissao.horasAproveitadas || 0}h</strong></p>
        ${obs}
        ${certLink}
    `;

    return card;
}

// ── Carregar relatório ────────────────────────────────────────
async function carregarRelatorio() {
    const alunoId = getAlunoIdDaURL();
    if (!alunoId) return;

    const token = getToken();
    if (!token) return;

    try {
        // 1. Dados do aluno
        const resAluno = await fetch(`${BASE_URL}/alunos/${alunoId}`, {
            headers: authHeaders()
        });
        if (!resAluno.ok) throw new Error(`Erro ao buscar aluno (HTTP ${resAluno.status})`);
        const aluno = await resAluno.json();

        const cargaHorariaMax = (aluno.cursos && aluno.cursos[0]?.cargaHorariaMax)
            ? aluno.cursos[0].cargaHorariaMax
            : 200;

        // 2. Submissões: busca todas e filtra pelo nome do aluno
        const resSubmissoes = await fetch(`${BASE_URL}/submissoes`, {
            headers: authHeaders()
        });
        if (!resSubmissoes.ok) throw new Error(`Erro ao buscar submissões (HTTP ${resSubmissoes.status})`);
        const todasSubmissoes = await resSubmissoes.json();

        const submissoesDoAluno = todasSubmissoes.filter(s => s.nomeAluno === aluno.name);
        const aprovadas  = submissoesDoAluno.filter(s => s.status === "APROVADO");
        const pendentes  = submissoesDoAluno.filter(s => s.status === "PENDENTE");
        const rejeitadas = submissoesDoAluno.filter(s => s.status === "REJEITADO");

        // 3. Preenche o card do aluno
        const horasAcumuladas = aluno.horasAcumuladas || 0;
        const percentual = Math.min(Math.round((horasAcumuladas / cargaHorariaMax) * 100), 100);

        if (nomeAlunoEl)   nomeAlunoEl.textContent = aluno.name || "Aluno";
        if (horasTextoEl)  horasTextoEl.textContent = `${horasAcumuladas}h / ${cargaHorariaMax}h obrigatórias`;
        if (percentEl)     percentEl.textContent = `${percentual}%`;
        if (progressBarEl) {
            setTimeout(() => {
                progressBarEl.style.width = percentual + "%";
                if (percentual >= 100)     progressBarEl.style.background = "#16a34a";
                else if (percentual >= 60) progressBarEl.style.background = "#2f6df6";
                else if (percentual >= 30) progressBarEl.style.background = "#f59e0b";
                else                       progressBarEl.style.background = "#ef4444";
            }, 100);
        }

        // 4. Renderiza atividades
        ocultarLoading();

        if (cardsContainer) {
            cardsContainer.innerHTML = "";

            if (submissoesDoAluno.length === 0) {
                cardsContainer.innerHTML = `
                    <div class="card sem-atividades">
                        <p>Nenhuma atividade complementar enviada ainda.</p>
                    </div>`;
                return;
            }

            [...aprovadas, ...pendentes, ...rejeitadas].forEach(sub => {
                cardsContainer.appendChild(criarCardAtividade(sub));
            });
        }

    } catch (err) {
        console.error("Erro ao carregar relatório:", err);
        mostrarErro(`Não foi possível carregar os dados. (${err.message})`);
    }
}

// ── SIDEBAR COLAPSÁVEL ────────────────────────────────────────
function initSidebar() {
    const sidebar       = document.getElementById("sidebar");
    const mainContent   = document.getElementById("mainContent");
    const sidebarToggle = document.getElementById("sidebarToggle");

    function toggleMenu() {
        sidebar.classList.toggle("collapsed");
        mainContent.classList.toggle("expanded");
        localStorage.setItem("relatorioAluno_sidebarCollapsed", sidebar.classList.contains("collapsed"));
    }

    function restoreMenuState() {
        if (localStorage.getItem("relatorioAluno_sidebarCollapsed") === "true") {
            sidebar.classList.add("collapsed");
            mainContent.classList.add("expanded");
        }
    }

    if (sidebarToggle) sidebarToggle.addEventListener("click", toggleMenu);
    restoreMenuState();

    // Nome do coordenador na sidebar
    try {
        const token = localStorage.getItem('token');
        if (token) {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const el = document.getElementById('sidebar-user-name');
            if (el && payload.sub) el.textContent = payload.sub;
        }
    } catch (_) {}
}

// ── NOTIFICAÇÕES ──────────────────────────────────────────────
async function carregarNotificacoes(alunoId) {
    const notifBadge  = document.getElementById("notif-badge");
    const notifLista  = document.getElementById("notif-lista");

    try {
        const resAluno = await fetch(`${BASE_URL}/alunos/${alunoId}`, { headers: authHeaders() });
        const aluno = await resAluno.json();

        const res = await fetch(`${BASE_URL}/notificacaoEmail`, { headers: authHeaders() });
        if (!res.ok) return;
        const todas = await res.json();

        const minhas = todas.filter(n => n.destinatario === aluno.email);

        if (minhas.length > 0) {
            notifBadge.textContent = minhas.length > 9 ? "9+" : minhas.length;
            notifBadge.style.display = "flex";
        } else {
            notifBadge.style.display = "none";
        }

        notifLista.innerHTML = minhas.length === 0
            ? `<p class="notif-vazia">Nenhuma notificação.</p>`
            : minhas.map(n => `
                <div class="notif-item">
                    <p class="notif-assunto">${n.assunto || "Notificação"}</p>
                    <p class="notif-corpo">${n.corpo || ""}</p>
                </div>`).join("");

    } catch (err) {
        console.warn("Erro ao carregar notificações:", err);
        const lista = document.getElementById("notif-lista");
        if (lista) lista.innerHTML = `<p class="notif-vazia">Erro ao carregar.</p>`;
    }
}

function initNotificacoes(alunoId) {
    const notifBtn    = document.getElementById("openNotif");
    const notifPainel = document.getElementById("notif-painel");
    const closeNotif  = document.getElementById("closeNotif");

    const toggleNotif = (e) => { e.stopPropagation(); notifPainel.classList.toggle("open"); };
    const fecharNotif = () => notifPainel.classList.remove("open");

    if (notifBtn)   notifBtn.addEventListener("click", toggleNotif);
    if (closeNotif) closeNotif.addEventListener("click", fecharNotif);

    document.addEventListener("click", (e) => {
        if (notifPainel && notifBtn &&
            !notifPainel.contains(e.target) && !notifBtn.contains(e.target)) {
            fecharNotif();
        }
    });

    carregarNotificacoes(alunoId);
}

// ── INIT ──────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
    initSidebar();

    const alunoId = getAlunoIdDaURL();
    if (alunoId) {
        carregarRelatorio();
        initNotificacoes(alunoId);
    }
});