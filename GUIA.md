# 🚀 Guia de Instalação — Catálogo de Produtos

## O que este projeto inclui

| Página | URL | Descrição |
|--------|-----|-----------|
| Homepage | `/` | Hero + produtos em destaque |
| Catálogo | `/produtos` | Grelha com pesquisa e filtros por categoria |
| Produto | `/produto/[id]` | Detalhe completo + links de marketplace |
| Sobre nós | `/sobre` | Página de apresentação |
| Contactos | `/contactos` | Contactos da empresa |
| Admin Login | `/admin/login` | Login protegido |
| Admin Painel | `/admin` | Gerir produtos, imagens, etc. |

---

## 1. Pré-requisitos

Instala o seguinte se ainda não tiveres:

- **Node.js** (versão 18 ou superior): https://nodejs.org
- **Git** (opcional, mas recomendado): https://git-scm.com

---

## 2. Configurar o Firebase

### 2.1 Criar o projeto Firebase

1. Vai a https://console.firebase.google.com
2. Clica em **"Adicionar projeto"**
3. Dá um nome (ex: `catalogo-produtos`)
4. Desativa Google Analytics se não precisares → **Criar projeto**

### 2.2 Ativar Firestore

1. No menu lateral → **Firestore Database**
2. Clica **"Criar base de dados"**
3. Escolhe **"Modo de produção"** → escolhe a região mais próxima (ex: `europe-west1`)
4. Clica em **Concluído**

**Regras do Firestore** (menu "Regras"):
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Leitura pública dos produtos
    match /produtos/{id} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### 2.3 Ativar Storage

1. No menu lateral → **Storage**
2. Clica **"Começar"** → **"Modo de produção"**

**Regras do Storage**:
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /produtos/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### 2.4 Ativar Authentication

1. No menu lateral → **Authentication** → **"Começar"**
2. Clica no separador **"Sign-in method"**
3. Ativa **Email/palavra-passe**
4. Vai ao separador **"Users"** → **"Adicionar utilizador"**
5. Cria um utilizador com o teu email de admin e uma palavra-passe segura

### 2.5 Obter as chaves Firebase

1. No menu lateral → ⚙️ **Definições do projeto**
2. Em "As suas aplicações" → clica **"</>  Web"**
3. Dá um nome à app e clica **Registar app**
4. Copia o objeto `firebaseConfig` — vais precisar dos valores

---

## 3. Configurar o projeto local

### 3.1 Abrir a pasta do projeto

Abre a pasta `catalogo-website` no VS Code ou no editor que preferires.

### 3.2 Criar o ficheiro de configuração

Na raiz do projeto, cria um ficheiro chamado `.env.local` (copia de `.env.local.example`):

```
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=o-teu-projeto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=o-teu-projeto
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=o-teu-projeto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

NEXT_PUBLIC_ADMIN_EMAIL=o-teu-email-admin@empresa.com
```

> ⚠️ **Nunca partilhes este ficheiro.** Está no `.gitignore`.

### 3.3 Instalar dependências

Abre o terminal na pasta do projeto e executa:

```bash
npm install
```

### 3.4 Arrancar em modo de desenvolvimento

```bash
npm run dev
```

O site abre em: **http://localhost:3000**

---

## 4. Personalizar a marca

Procura `[MARCA]` em todos os ficheiros e substitui pelo nome real da empresa. Os ficheiros a editar são:

- `components/Navbar.jsx` — linha 11
- `components/Footer.jsx` — linha 11
- `components/Layout.jsx` — linha 8
- `pages/index.js` — linha 11
- `pages/sobre.js` — linha 8
- `pages/contactos.js`
- `pages/admin/login.js` — linha 11
- `pages/admin/index.js` — linha 17

**Dica rápida:** No VS Code, usa `Ctrl+Shift+H` para fazer substituição global de `[MARCA]` pelo nome real.

Substitui também:
- `[EMAIL]` pelo email de contacto real
- `[TELEFONE]` pelo telefone real
- `[Slogan da empresa]` pelo slogan real
- O conteúdo da página `sobre.js` com o texto real da empresa

### Adicionar o logótipo

Coloca o teu ficheiro de logo em `public/logo.png` e nos ficheiros da Navbar/Footer substitui o bloco de texto pelo componente `<Image>` conforme indicado nos comentários.

### Cores da marca

Edita `tailwind.config.js` e substitui as cores `brand` pelas cores oficiais da tua empresa (em formato hex).

---

## 5. Adicionar produtos (painel admin)

1. Acede a http://localhost:3000/admin/login
2. Faz login com o email e palavra-passe que criaste no Firebase Authentication
3. Clica em **"Novo produto"**
4. Preenche os campos: nome, SKU, categoria, descrição, características, imagens, etc.
5. Adiciona links de marketplace (Worten, Fnac, Amazon) se tiveres
6. Clica **"Criar produto"**

---

## 6. Deploy no Vercel

### 6.1 Fazer push para o GitHub (recomendado)

```bash
git init
git add .
git commit -m "primeiro commit"
git branch -M main
git remote add origin https://github.com/o-teu-utilizador/catalogo-website.git
git push -u origin main
```

### 6.2 Criar projeto no Vercel

1. Vai a https://vercel.com → **"Add New Project"**
2. Importa o repositório GitHub
3. Em **"Environment Variables"**, adiciona todas as variáveis do teu `.env.local`
4. Clica **Deploy**

O site fica disponível num URL do tipo `catalogo-website.vercel.app`.

### 6.3 Múltiplos sites no Vercel

Sim, podes ter vários projetos! Cada projeto Vercel é independente. Não há qualquer conflito. Basta criar um novo projeto por cada site.

---

## 7. Estrutura de ficheiros

```
catalogo-website/
├── components/
│   ├── Layout.jsx        ← Wrapper com Navbar + Footer
│   ├── Navbar.jsx        ← Barra de navegação
│   ├── Footer.jsx        ← Rodapé
│   └── ProductCard.jsx   ← Cartão de produto
├── lib/
│   ├── firebase.js       ← Configuração Firebase
│   └── produtos.js       ← Funções de leitura/escrita
├── pages/
│   ├── _app.js
│   ├── index.js          ← Homepage
│   ├── produtos.js       ← Catálogo
│   ├── sobre.js          ← Sobre nós
│   ├── contactos.js      ← Contactos
│   ├── produto/
│   │   └── [id].js       ← Detalhe de produto
│   └── admin/
│       ├── login.js      ← Login admin
│       └── index.js      ← Painel admin
├── styles/
│   └── globals.css
├── .env.local.example    ← Template de configuração
├── next.config.js
├── tailwind.config.js
└── package.json
```

---

## 8. Estrutura de um produto no Firestore

Cada produto é um documento na coleção `produtos` com estes campos:

```json
{
  "nome": "Climatizador portátil 3 em 1",
  "sku": "SKU540",
  "categoria": "Para o Ambiente",
  "descricaoCurta": "Arrefecimento, ventilação e humidificação num só aparelho.",
  "descricao": "Descrição completa...",
  "caracteristicas": ["Funcionalidade 3 em 1", "Controlo remoto", "..."],
  "inclui": ["1x Climatizador", "1x Controlo remoto", "..."],
  "crossells": ["SKU428", "SKU400"],
  "imagens": ["https://firebasestorage.googleapis.com/..."],
  "linkWorten": "https://www.worten.pt/...",
  "linkFnac": "",
  "linkAmazon": "",
  "criadoEm": "Timestamp",
  "atualizadoEm": "Timestamp"
}
```

---

## 9. Próximos passos sugeridos

- [ ] Substituir todos os placeholders `[MARCA]`, `[EMAIL]`, `[TELEFONE]`
- [ ] Adicionar o logótipo em `public/logo.png`
- [ ] Definir as cores da marca em `tailwind.config.js`
- [ ] Configurar o Firebase e criar o ficheiro `.env.local`
- [ ] Adicionar os primeiros produtos pelo painel admin
- [ ] Fazer deploy no Vercel
- [ ] Comprar um domínio e ligar ao Vercel (opcional)
