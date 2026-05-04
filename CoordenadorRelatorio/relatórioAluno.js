// ============================================================
//  relatórioAluno.js  –  Integração com o Back-end Spring Boot
// ============================================================
//
//  Endpoints utilizados:
//    GET /alunos/{id}                  → dados do aluno (name, horasAcumuladas)
//    GET /alunos/{id}/curso            → busca o curso do aluno para pegar cargaHorariaMax
//    GET /submissoes?alunoId={id}      → submissões do aluno
//
//  Como o back-end atual não expõe endpoint de submissões por aluno
//  nem retorna o curso com cargaHorariaMax diretamente no AlunoDTO,
//  a solução adota a seguinte estratégia:
//
//   1. Busca todos os cursos em que o aluno está matriculado via
//      GET /alunos/{id}  (os cursos precisam ser adicionados ao AlunoDTO,
//      ver comentário no código).
//   2. Busca todas as submissões via GET /submissoes e filtra pelo nome
//      do aluno (workaround até o back-end ter endpoint /submissoes?alunoId=).
//   3. Exibe SOMENTE submissões com status APROVADO nos cards.
//   4. Calcula progresso = horasAcumuladas / cargaHorariaMax * 100.
//
//  ⚠️  CONFIGURAÇÃO OBRIGATÓRIA:
//      1. Ajuste BASE_URL para o endereço do seu servidor.
//      2. Ajuste ALUNO_ID para o ID do aluno logado
//         (no futuro, virá do token JWT via localStorage/sessionStorage).
//      3. CARGA_HORARIA_FALLBACK é usado quando o curso não retorna
//         cargaHorariaMax (ex.: endpoint ainda não implementado).
// ============================================================

const BASE_URL = "http://localhost:8080";   // ← altere conforme necessário
const ALUNO_ID = 1;                          // ← substitua pelo ID do usuário logado
const CARGA_HORARIA_FALLBACK = 200;          // ← horas obrigatórias padrão do curso

// ── Elementos do DOM ──────────────────────────────────────────
const nomeAlunoEl     = document.getElementById("nome-aluno");
const horasTextoEl    = document.getElementById("horas-texto");
const percentEl       = document.getElementById("percent");
const progressBarEl   = document.getElementById("progress");
const cardsContainer  = document.getElementById("cards-container");
const loadingEl       = document.getElementById("loading");
const erroEl          = document.getElementById("erro-msg");

// ── Utilitários ────────────────────────────────────────────────
function formatarData(isoString) {
  if (!isoString) return "—";
  const d = new Date(isoString);
  return d.toLocaleDateString("pt-BR");
}

function mostrarErro(msg) {
  if (erroEl) {
    erroEl.textContent = msg;
    erroEl.style.display = "block";
  }
  if (loadingEl) loadingEl.style.display = "none";
}

function ocultarLoading() {
  if (loadingEl) loadingEl.style.display = "none";
}

// ── Criação de card de atividade ───────────────────────────────
function criarCardAtividade(submissao) {
  const card = document.createElement("div");
  card.className = "card atividade";

  // Badge de status
  const statusClass = submissao.status === "APROVADO" ? "tag-aprovado"
                    : submissao.status === "REJEITADO" ? "tag-rejeitado"
                    : "tag-pendente";
  const statusLabel = submissao.status === "APROVADO" ? "Aprovado"
                    : submissao.status === "REJEITADO" ? "Rejeitado"
                    : "Pendente";

  // Link para certificado (se existir)
  const certLink = submissao.urlCertificado
    ? `<a class="cert-link" href="${submissao.urlCertificado}" target="_blank">📎 Ver certificado</a>`
    : "";

  // Observação do coordenador (só se rejeitado)
  const obs = (submissao.status === "REJEITADO" && submissao.observacaoCoordenador)
    ? `<p class="obs-coord">💬 ${submissao.observacaoCoordenador}</p>`
    : "";

  card.innerHTML = `
    <div class="card-header-row">
      <h3>${submissao.nomeCategoria || "Atividade Complementar"}</h3>
      <span class="tag ${statusClass}">${statusLabel}</span>
    </div>
    <p>👤 ${submissao.nomeAluno || "—"}</p>
    <p>📅 ${formatarData(submissao.dataEnvio)} · <strong>${submissao.horasAproveitadas || 0}h</strong></p>
    ${obs}
    ${certLink}
  `;

  return card;
}

// ── Busca e renderização principal ─────────────────────────────
async function carregarRelatorio() {
  try {
    // 1. Busca dados do aluno
    const resAluno = await fetch(`${BASE_URL}/alunos/${ALUNO_ID}`);
    if (!resAluno.ok) throw new Error(`Erro ao buscar aluno (HTTP ${resAluno.status})`);
    const aluno = await resAluno.json();

    // 2. Tenta buscar os cursos do aluno para obter cargaHorariaMax
    let cargaHorariaMax = CARGA_HORARIA_FALLBACK;
    if (aluno.cursos && aluno.cursos.length > 0 && aluno.cursos[0].cargaHorariaMax) {
      cargaHorariaMax = aluno.cursos[0].cargaHorariaMax;
    }

    // 3. Busca todas as submissões e filtra pelo nome do aluno
    const resSubmissoes = await fetch(`${BASE_URL}/submissoes`);
    if (!resSubmissoes.ok) throw new Error(`Erro ao buscar submissões (HTTP ${resSubmissoes.status})`);
    const todasSubmissoes = await resSubmissoes.json();

    const submissoesDoAluno = todasSubmissoes.filter(
      (s) => s.nomeAluno === aluno.name
    );

    const aprovadas = submissoesDoAluno.filter((s) => s.status === "APROVADO");
    const pendentes  = submissoesDoAluno.filter((s) => s.status === "PENDENTE");
    const rejeitadas = submissoesDoAluno.filter((s) => s.status === "REJEITADO");

    // 4. Preenche card do aluno
    const horasAcumuladas = aluno.horasAcumuladas || 0;
    const percentual = Math.min(Math.round((horasAcumuladas / cargaHorariaMax) * 100), 100);

    if (nomeAlunoEl)    nomeAlunoEl.textContent = aluno.name || "Aluno";
    if (horasTextoEl)   horasTextoEl.textContent = `${horasAcumuladas}h / ${cargaHorariaMax}h obrigatórias`;
    if (percentEl)      percentEl.textContent = `${percentual}%`;
    if (progressBarEl) {
      setTimeout(() => {
        progressBarEl.style.width = percentual + "%";
        if (percentual >= 100)       progressBarEl.style.background = "#16a34a";
        else if (percentual >= 60)   progressBarEl.style.background = "#2f6df6";
        else if (percentual >= 30)   progressBarEl.style.background = "#f59e0b";
        else                         progressBarEl.style.background = "#ef4444";
      }, 100);
    }

    // 5. Renderiza cards de atividades
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

      [...aprovadas, ...pendentes, ...rejeitadas].forEach((sub) => {
        cardsContainer.appendChild(criarCardAtividade(sub));
      });
    }

  } catch (err) {
    console.error("Erro ao carregar relatório:", err);
    mostrarErro(`Não foi possível carregar os dados. Verifique se o servidor está rodando em ${BASE_URL}. (${err.message})`);
  }
}

// ── Inicia carregamento ────────────────────────────────────────
document.addEventListener("DOMContentLoaded", carregarRelatorio);

// ── SIDEBAR COLAPSÁVEL (igual ao relatoriosDosAlunos) ──────────
const sidebar      = document.getElementById("sidebar");
const mainContent  = document.getElementById("mainContent");
const sidebarToggle = document.getElementById("sidebarToggle");

// Mantidos no DOM para não quebrar referências do JS original
const overlay  = document.getElementById("overlay");
const openBtn  = document.getElementById("openMenu");
const closeBtn = document.getElementById("closeMenu");

function toggleMenu() {
  sidebar.classList.toggle("collapsed");
  mainContent.classList.toggle("expanded");
  const isCollapsed = sidebar.classList.contains("collapsed");
  localStorage.setItem("relatorioAluno_sidebarCollapsed", isCollapsed);
}

function restoreMenuState() {
  const isCollapsed = localStorage.getItem("relatorioAluno_sidebarCollapsed") === "true";
  if (isCollapsed) {
    sidebar.classList.add("collapsed");
    mainContent.classList.add("expanded");
  }
}

if (sidebarToggle) sidebarToggle.addEventListener("click", toggleMenu);

// Lógica original de overlay mantida para não quebrar nada
if (openBtn)  openBtn.addEventListener("click", () => {});
if (closeBtn) closeBtn.addEventListener("click", () => {});
if (overlay)  overlay.addEventListener("click", () => {});

document.addEventListener("DOMContentLoaded", restoreMenuState);

// ── Notificações (mantidas intactas) ──────────────────────────
const notifBtn    = document.getElementById("openNotif");
const notifPainel = document.getElementById("notif-painel");
const notifLista  = document.getElementById("notif-lista");
const notifBadge  = document.getElementById("notif-badge");
const closeNotif  = document.getElementById("closeNotif");

async function carregarNotificacoes() {
  try {
    const res = await fetch(`${BASE_URL}/notificacaoEmail`);
    if (!res.ok) return;
    const todas = await res.json();

    const resAluno = await fetch(`${BASE_URL}/alunos/${ALUNO_ID}`);
    const aluno = await resAluno.json();

    const minhas = todas.filter(n => n.destinatario === aluno.email);

    if (minhas.length > 0) {
      notifBadge.textContent = minhas.length > 9 ? "9+" : minhas.length;
      notifBadge.style.display = "flex";
    } else {
      notifBadge.style.display = "none";
    }

    if (minhas.length === 0) {
      notifLista.innerHTML = `<p class="notif-vazia">Nenhuma notificação.</p>`;
      return;
    }

    notifLista.innerHTML = minhas.map(n => `
      <div class="notif-item">
        <p class="notif-assunto">${n.assunto || "Notificação"}</p>
        <p class="notif-corpo">${n.corpo || ""}</p>
      </div>
    `).join("");

  } catch (err) {
    console.warn("Erro ao carregar notificações:", err);
    notifLista.innerHTML = `<p class="notif-vazia">Erro ao carregar.</p>`;
  }
}

function toggleNotif(e) {
  e.stopPropagation();
  notifPainel.classList.toggle("open");
}

function fecharNotif() {
  notifPainel.classList.remove("open");
}

if (notifBtn)   notifBtn.addEventListener("click", toggleNotif);
if (closeNotif) closeNotif.addEventListener("click", fecharNotif);

document.addEventListener("click", (e) => {
  if (!notifPainel || !notifBtn) return;
  if (!notifPainel.contains(e.target) && !notifBtn.contains(e.target)) {
    fecharNotif();
  }
});

document.addEventListener("DOMContentLoaded", carregarNotificacoes);
