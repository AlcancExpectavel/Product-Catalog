| Página | URL | Descrição |
|--------|-----|-----------|
| Homepage | `/` | Hero + produtos em destaque |
| Catálogo | `/produtos` | Grelha com pesquisa e filtros por categoria |
| Produto | `/produto/[id]` | Detalhe completo + links de marketplace |
| Sobre nós | `/sobre` | Página de apresentação |
| Contactos | `/contactos` | Contactos da empresa |
| Admin Login | `/admin/login` | Login protegido |
| Admin Painel | `/admin` | Gerir produtos, imagens, etc. |

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

- `[EMAIL]` pelo email de contacto real
- `[TELEFONE]` pelo telefone real
- `[Slogan da empresa]` pelo slogan real
- O conteúdo da página `sobre.js` com o texto real da empresa

### Adicionar o logótipo

 ficheiro de logo em `public/logo.png` e nos ficheiros da Navbar/Footer substitui o bloco de texto pelo componente `<Image>` 

### Cores da marca

Editar `tailwind.config.js` e substituir as cores `brand` pelas cores oficiais (em formato hex).

---

## 5. Adicionar produtos (painel admin)

1. Acede a http://localhost:3000/admin/login
2. Faz login com o email e palavra-passe que criaste no Firebase Authentication
3. Clica em **"Novo produto"**
4. Preenche os campos: nome, SKU, categoria, descrição, características, imagens, etc.
5. Adiciona links de marketplace (Worten, Fnac, Amazon) se tiveres
6. Clica **"Criar produto"**

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

## 9. Próximos passos

- [ ] Substituir todos os placeholders `[MARCA]`, `[EMAIL]`, `[TELEFONE]`
- [ ] Adicionar o logótipo em `public/logo.png`
- [ ] Definir as cores da marca em `tailwind.config.js`
- [ ] Adicionar produtos pelo painel admin