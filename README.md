# 🥗 Nutribas — Sistema de Gestão para Nutricionistas

O **Nutribas** é uma plataforma web moderna, rápida e intuitiva desenvolvida para auxiliar nutricionistas no gerenciamento de seus pacientes, acompanhamento de consultas, controle de retornos e elaboração de planos alimentares personalizados.

---

## 🚀 Funcionalidades Atuais

### 1. 🔐 Autenticação & Segurança
- **Login e Cadastro**: Acesso exclusivo para nutricionistas com validações de credenciais.
- **Sessão Persistente**: Manutenção da sessão do profissional autenticado.
- **Rotas Protegidas**: Bloqueio de acesso não autorizado às páginas internas do sistema.
- **Isolamento de Dados**: Cada profissional visualiza e gerencia exclusivamente os seus próprios pacientes e consultas.

### 2. 📊 Dashboard Principal
- **Total de Pacientes Ativos**: Contagem em tempo real de pacientes cadastrados vinculados ao nutricionista.
- **Consultas da Semana**: Métrica dinâmica de consultas agendadas/realizadas no decorrer da semana atual (segunda a domingo).
- **Pacientes sem Retorno**: Lista inteligente de pacientes cuja última consulta ocorreu há mais de 30 dias e que ainda não possuem retorno agendado, com atalho direto para visualização do perfil.
- **Menu Lateral Fixo (Sidebar)**: Acesso rápido à navegação, exibição do perfil e botão de logout.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Roteamento**: [React Router DOM](https://reactrouter.com/)
- **Estilização**: CSS3 Moderno (Vanilla CSS com Design System personalizado)
- **Banco de Dados**: [Neon PostgreSQL Serverless](https://neon.tech/) via `@neondatabase/serverless`

---

## 📁 Estrutura do Projeto

```text
nutribas/
├── _prompts/              # Especificações e prompts de desenvolvimento
├── public/                # Arquivos estáticos
├── src/
│   ├── components/        # Componentes compartilhados (Layout, Sidebar, etc.)
│   ├── contexts/          # Contextos globais do React (AuthContext)
│   ├── lib/               # Clientes e utilitários (Neon DB Client)
│   ├── pages/             # Telas da aplicação (Login, Register, Dashboard, Pacientes)
│   ├── App.jsx            # Configuração de rotas públicas e protegidas
│   ├── index.css          # Design System e estilos globais
│   └── main.jsx           # Ponto de entrada da aplicação
├── .env.local             # Variáveis de ambiente (Connection String Neon)
├── package.json           # Dependências e scripts do projeto
└── vite.config.js         # Configurações do Vite
```

---

## ⚙️ Como Rodar o Projeto Localmente

### Pré-requisitos
- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- [Git](https://git-scm.com/)

### Passo a Passo

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/johnzerou/nutribas.git
   cd nutribas
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente:**
   Crie um arquivo `.env.local` na raiz do projeto contendo a URL de conexão do seu banco Neon:
   ```env
   VITE_NEON_DB_URL=postgresql://<usuario>:<senha>@<host-neon>/<database>?sslmode=require
   ```

4. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```
   Acesse a aplicação no navegador em `http://localhost:5173`.

5. **Gerar build de produção:**
   ```bash
   npm run build
   ```

---

## 🗄️ Estrutura do Banco de Dados (Neon PostgreSQL)

- **`nutricionistas`**: Dados cadastrais dos profissionais (ID, Nome, Email, Senha, Created_at).
- **`pacientes`**: Cadastro completo, histórico de saúde, anamnese e hábitos alimentares.
- **`consultas`**: Histórico de atendimentos, métricas corporais, observações e data de próximo retorno.
- **`planos_alimentares`**: Planos nutricionais em formato JSONB estruturado.

---

## 📌 Próximos Passos
- [ ] Cadastro e listagem detalhada de pacientes (Anamnese e dados clínicos).
- [ ] Histórico de consultas e evolução antropométrica (peso, circunferências, % gordura).
- [ ] Criador interativo de planos alimentares.
- [ ] Exportação/compartilhamento de dietas via PDF e WhatsApp.

---

Desenvolvido com carinho para aprimorar a gestão nutricional e a saúde dos pacientes! 🌱
