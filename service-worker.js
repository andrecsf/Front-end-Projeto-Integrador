const CACHE_NAME = 'atividades-extracurriculares-v1';

// Importante: Removido o "../" pois o SW está na raiz. 
// Certifique-se de que o nome das pastas (Maiúsculas/Minúsculas) está idêntico ao seu projeto.
const STATIC_ASSETS = [
  '/',
  '/Login/index.html',
  '/Login/style.css',
  '/Login/script.js',
  '/Login/manifest.json',
  '/Login/icons/launchericon-72x72.png',
  '/Login/icons/launchericon-96x96.png',
  '/Login/icons/launchericon-144x144.png',
  '/Login/icons/launchericon-192x192.png',
  '/Login/icons/launchericon-512x512.png',
  '/Login/icons/icon-152.png',
  '/Login/icons/icon-167.png',
  '/Login/icons/icon-180.png',

  // Arquivos comuns
  '/common-style.css',
  '/common-script.js',

  // Tela Inicial (Coordenador)
  '/TelaInicial/telaInicial.html',
  '/TelaInicial/telaInicial.css',
  '/TelaInicial/telaInicial.js',

  // Home Super Admin
  '/HomeAdmin/home-super-admin.html',
  '/HomeAdmin/style-home.css',
  '/HomeAdmin/dashboard.js',
  '/HomeAdmin/img/imagemuser-superadmin.png',

  // Perfil Super Admin
  '/PerfilSuperadmin/dashboard-superadmin.html',
  '/PerfilSuperadmin/style-dashboard-superadmin.css',
  '/PerfilSuperadmin/script-dashboard-superadmin.js',

  // Cadastrar Aluno
  '/CadastrarAluno/cadastrarAluno.html',
  '/CadastrarAluno/cadastrarAluno.css',
  '/CadastrarAluno/cadastrarAluno.js',

  // Cadastrar Coordenador
  '/CadastrarCoordenador/cadastro-coordenador.html',
  '/CadastrarCoordenador/style-cadastro-coordenador.css',
  '/CadastrarCoordenador/script-cadastro-coordenador.js',

  // Cadastrar Categoria
  '/CadastrarCategoria/cadastrarCategoria.html',
  '/CadastrarCategoria/cadastrarCategoria.css',
  '/CadastrarCategoria/cadastrarCategoria.js',

  // Cadastrar Curso
  '/CadastrarCurso/cadastroCurso.html',
  '/CadastrarCurso/cadastroCurso.css',
  '/CadastrarCurso/cadastroCurso.js',

  // Gerenciar Curso (Admin)
  '/GerenciarCurso/gerenciarCursos.html',
  '/GerenciarCurso/gerenciaCursos.css',
  '/GerenciarCurso/gerenciarCursos.js',

  // Gerenciar Curso (Coordenador)
  '/GerenciarCursoCoordenador/gerenciarCursoCoordenador.html',
  '/GerenciarCursoCoordenador/gerenciarCursoCoordenador.css',
  '/GerenciarCursoCoordenador/gerenciarCursoCoordenador.js',

  // Vincular Coordenador
  '/VincularCoordenador/vincular.html',
  '/VincularCoordenador/vincular.css',
  '/VincularCoordenador/vincular.js',

  // Perfil Curso (Admin)
  '/PerfilCurso/perfil-curso.html',
  '/PerfilCurso/style-perfil.css',
  '/PerfilCurso/script-perfil.js',

  // Perfil Curso (Coordenador)
  '/PerfilCursoCoordenador/perfilCursoCoordenador.html',
  '/PerfilCursoCoordenador/perfilCursoCoordenador.css',
  '/PerfilCursoCoordenador/perfilCursoCoordenador.js',

  // Perfil Coordenador
  '/PerfilCoordenador/perfil-coordenador.html',
  '/PerfilCoordenador/style-perfil-coordenador.css',
  '/PerfilCoordenador/script-perfil-coordenador.js',

  // Meu Perfil Coordenador
  '/MeuPerfilCoordenador/Meuperfilcoordenador.html',
  '/MeuPerfilCoordenador/Meuperfilcoordenador.css',
  '/MeuPerfilCoordenador/Meuperfilcoordenador.js',

  // Atividades Pendentes
  '/AtividadesPendentes/atividadesPendentes.html',
  '/AtividadesPendentes/atividadesPendentes.css',
  '/AtividadesPendentes/atividadesPendentes.js',

  // Perfil Aluno
  '/PerfilAluno/relatorio-aluno.html',
  '/PerfilAluno/style-relatorio-aluno.css',
  '/PerfilAluno/script-relatorio-aluno.js',

  // Relatórios dos Alunos (Admin/Coordenador)
  '/RelatoriosDosAlunos/relatoriosDosAlunos.html',
  '/RelatoriosDosAlunos/relatoriosDosAlunos.css',
  '/RelatoriosDosAlunos/realatoriosDosAlunos.js',

  // Relatório Aluno (Coordenador)
  '/CoordenadorRelatorio/relatorioAluno.html',
  '/CoordenadorRelatorio/relatorioAluno.css',
  '/CoordenadorRelatorio/relatorioAluno.js',

  // Gerenciar Usuário
  '/PI TELAGerenciarUsuário/TELAGERENCIARUSUARIO.html',
  '/PI TELAGerenciarUsuário/TELAGERENCIARUSUSARIO.js',
  '/PI TELAGerenciarUsuário/TELASTYLE.css',

  // Validar Certificado
  '/ValidarCertificado/validar-certificado.html',
  '/ValidarCertificado/estilo-validar.css',
  '/ValidarCertificado/validar-certificado.js',

  // Visualizar Certificado
  '/VisualizarCertificado/visualizar-certificado.html',
  '/VisualizarCertificado/estilo-visualizar.css',
  '/VisualizarCertificado/visualizar-certificado.js',
];

const API_ROUTES = [
  '/auth/',
  '/alunos',
  '/coordenadores',
  '/cursos',
  '/categorias',
  '/submissoes',
  '/notificacaoEmail',
  '/actuator/',
];

// ─── INSTALL ────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Fazendo cache dos assets estáticos...');
      return Promise.allSettled(
        STATIC_ASSETS.map((asset) =>
          cache.add(asset).catch((err) =>
            console.warn(`[SW] Falha ao cachear: ${asset}`, err)
          )
        )
      );
    }).then(() => {
      console.log('[SW] Install concluído.');
      return self.skipWaiting();
    })
  );
});

// ─── ACTIVATE ───────────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] Removendo cache antigo:', name);
            return caches.delete(name);
          })
      )
    ).then(() => {
      console.log('[SW] Activate concluído. SW ativo.');
      return self.clients.claim();
    })
  );
});

// ─── FETCH ──────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (event.request.method !== 'GET') return;
  if (!url.protocol.startsWith('http')) return;

  const isApiCall = API_ROUTES.some((route) => url.pathname.includes(route));
  
  if (isApiCall) {
    event.respondWith(networkFirst(event.request));
  } else {
    event.respondWith(cacheFirst(event.request));
  }
});

// ─── ESTRATÉGIAS ────────────────────────────────────────────────────────────

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (err) {
    if (request.mode === 'navigate') {
      const fallback = await caches.match('/Login/index.html');
      if (fallback) return fallback;
    }
    return new Response('Offline: Recurso não disponível.', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
}

async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (err) {
    const cached = await caches.match(request);
    if (cached) return cached;

    return new Response(
      JSON.stringify({ erro: 'Você está offline e não há dados em cache.' }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      }
    );
  }
}