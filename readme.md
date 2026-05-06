# 🎓 Front-end — Projeto Integrador

Sistema de Gestão Acadêmica desenvolvido como parte das atividades do curso de **Análise e Desenvolvimento de Sistemas**, com foco no gerenciamento de alunos, coordenadores, cursos, certificados e relatórios.

---

## 📋 Sobre o Projeto

O front-end é composto por páginas HTML, CSS e JavaScript puro (Vanilla JS), organizadas em módulos por funcionalidade. Cada módulo representa uma tela do sistema e se comunica com o back-end Java (Spring Boot) via API REST, utilizando `fetch` com autenticação JWT (Bearer Token).

## Site 
sgesenac.netlify.app

---

## 🗂️ Estrutura de Pastas

```
Front-end-Projeto-Integrador-main/
│
├── Login/                        # Tela de login com seleção de perfil
├── TelaInicial/                  # Dashboard inicial do Coordenador
│
├── HomeAdmin/                    # Home do Super Admin
├── PerfilSuperadmin/             # Dashboard do Super Admin
│
├── CadastrarAluno/               # Formulário de cadastro de aluno
├── CadastrarCoordenador/         # Formulário de cadastro de coordenador
├── CadastrarCurso/               # Formulário de cadastro de curso
├── CadastrarCategoria/           # Formulário de cadastro de categoria
│
├── PerfilAluno/                  # Perfil e relatório individual do aluno
├── PerfilCoordenador/            # Perfil do coordenador
├── PerfilCurso/                  # Perfil de um curso (Admin)
├── PerfilCursoCoordenador/       # Perfil de um curso (Coordenador)
│
├── GerenciarCurso/               # Listagem e gerenciamento de cursos (Admin)
├── GerenciarCursoCoordenador/    # Listagem e gerenciamento de cursos (Coordenador)
├── PI TELAGerenciarUsuário/      # Tela de gerenciamento de usuários
│
├── CoordenadorRelatorio/         # Relatório de aluno visto pelo Coordenador
├── RelatoriosDosAlunos/          # Listagem geral de relatórios de alunos
│
├── ValidarCertificado/           # Tela para validar/aprovar certificados
├── VisualizarCertificado/        # Tela para visualizar um certificado
├── VincularCoordenador/          # Vincular coordenador a um curso
│
├── common-script.js              # Script compartilhado (sidebar, logout)
├── common-style.css              # Estilos globais compartilhados
└── readme.md
```

---

## 🔐 Autenticação e Perfis

A tela de login (`Login/index.html`) permite que o usuário selecione seu perfil antes de entrar:

| Perfil | Role no Back-end | Redireciona para |
|---|---|---|
| 👑 Super Admin | `ADMIN` | `PerfilSuperadmin/` |
| 👨‍🏫 Coordenador | `COORDENADOR` | `TelaInicial/` |
| 🎓 Aluno | `ALUNO` | `dashboard-aluno.html` |

O sistema valida se a role retornada pela API corresponde ao perfil selecionado no card. O token JWT é armazenado no `localStorage` e enviado nas requisições subsequentes via header `Authorization: Bearer <token>`.

---

## ⚙️ Tecnologias Utilizadas

- **HTML5**
- **CSS3** (com variáveis CSS e design responsivo)
- **JavaScript (ES6+)** — Vanilla JS, sem frameworks
- **Font Awesome 6** — Ícones via CDN
- **Fetch API** — Comunicação assíncrona com o back-end
- **localStorage** — Persistência de token e estado da sidebar

---

## 🔗 Integração com o Back-end

O front-end consome uma API REST esperada em `http://localhost:8080`. Os principais endpoints utilizados são:

| Método | Endpoint | Descrição |
|---|---|---|
| `POST` | `/auth/login` | Autenticação do usuário |
| `GET` | `/cursos` | Lista todos os cursos |
| `POST` | `/alunos` | Cadastra um novo aluno |
| `POST` | `/coordenadores` | Cadastra um novo coordenador |
| `POST` | `/cursos` | Cadastra um novo curso |

> Todas as rotas protegidas exigem o header `Authorization: Bearer <token>`.

---

## 🚀 Como Executar

1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/Front-end-Projeto-Integrador.git
   ```

2. Certifique-se de que o back-end Java está rodando em `http://localhost:8080`.

3. Abra o arquivo de entrada no navegador:
   ```
   Login/index.html
   ```

> Não é necessário nenhum bundler ou servidor de desenvolvimento. O projeto funciona diretamente pelo navegador, mas recomenda-se usar a extensão **Live Server** (VS Code) para evitar problemas de CORS em ambiente local.

---

## 🧩 Funcionalidades por Módulo

### Super Admin
- Dashboard com visão geral do sistema
- Cadastro de alunos, coordenadores, cursos e categorias
- Gerenciamento de usuários
- Vinculação de coordenadores a cursos
- Visualização de perfis de cursos

### Coordenador
- Tela inicial com seus cursos
- Gerenciamento dos cursos sob sua responsabilidade
- Acesso ao perfil de cada curso
- Visualização de relatórios e certificados dos alunos
- Validação e aprovação de certificados

### Aluno
- Visualização do próprio perfil e histórico
- Acesso ao seu certificado

---

## 🗒️ Observações

- O arquivo `common-script.js` centraliza a lógica de **toggle da sidebar** e **logout**, sendo compartilhado entre todas as páginas que possuem menu lateral.
- O arquivo `common-style.css` define a base visual (cores, tipografia, layout) aplicada globalmente.
- Algumas telas aceitam parâmetros via **query string** na URL (ex: `cadastrarAluno.html?cursoId=1`) para contextualizar o cadastro a um curso específico.

---

## 👥 Equipe

Projeto desenvolvido por estudantes do curso de **Análise e Desenvolvimento de Sistemas** — Senac.

André Salgado
Caio Victor
Leticia Gabrielle
Luciana Borges
Priscila Barbosa
