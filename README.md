# ARCUZ TATTOO

Aplicação full-stack demonstrativa para um estúdio fictício de tatuagem: site institucional, portfólio persistente, captação de solicitações, painel protegido, uploads e agenda.

> Todos os nomes, contatos, endereços, trabalhos e compromissos são fictícios. O projeto não representa uma empresa real.

## Stack e arquitetura

- Node.js 24 + Express 5 (site e API no mesmo serviço)
- SQLite nativo do Node, migrations SQL e seed idempotente
- HTML/CSS/JavaScript responsivos, sem framework pesado no navegador
- bcrypt para hash de senha; sessão opaca persistida no banco e cookie `HttpOnly`
- Multer para JPG/PNG/WebP, até 8 MB por arquivo
- Docker Compose com rede, volume, nomes e healthcheck exclusivos

Estrutura principal:

```text
public/              site público e painel
src/server.js        API, autenticação e regras
src/migrations/      esquema versionado
src/seed.js          conteúdo inicial
data/uploads/        uploads locais persistidos
test/                smoke tests de API
```

## Início rápido com Docker

O projeto usa a porta `4187`, escolhida após verificar as portas locais em uso.

```bash
docker compose up --build -d
```

- Site: http://localhost:4187
- Login: http://localhost:4187/admin
- Saúde: http://localhost:4187/api/health

Credenciais demonstrativas:

```text
E-mail: artista@arcuz.local
Senha:  ArcuzDemo2026!
```

Troque `SESSION_SECRET`, `ADMIN_EMAIL` e `ADMIN_PASSWORD` no `.env` antes de qualquer uso fora de demonstração. O usuário inicial é criado apenas quando o banco está vazio.

Parar somente este projeto:

```bash
docker compose down
```

Parar e remover também o volume de dados deste projeto:

```bash
docker compose down -v
```

## Execução sem Docker

```bash
npm install
npm run migrate
npm run seed
npm start
```

Verificações:

```bash
npm run build
npm test
```

## Uso do painel

1. Entre em `/admin`.
2. Abra **Novo trabalho**, preencha os dados, adicione uma ou várias imagens e marque **Publicado**.
3. O item passa a aparecer imediatamente no portfólio público e nos filtros.
4. Em **Portfólio**, edite, publique/despublique, reordene ou exclua.
5. Em **Agenda**, use `+ Agendamento`; sobreposições geram um alerta explícito.
6. Solicitações e mensagens enviadas pelo site aparecem em **Visão geral** e **Solicitações**.

## Personalização

- Nome, assinatura, WhatsApp, Instagram, endereço e artista: painel **Configurações**.
- Paleta e tipografia: variáveis no início de `public/styles.css` e `public/admin.css`.
- Logo: substitua `public/logo.svg`; favicon: `public/favicon.svg`.
- Textos editoriais: `public/index.html`.
- Categorias: tabela `tattoo_categories` (seed em `src/seed.js`).
- Imagens iniciais: seed em `src/seed.js`. Novas imagens devem ser inseridas pelo painel.

## Banco, migrations e dados

O banco fica em `data/arcuz.sqlite` no host e em `/app/data/arcuz.sqlite` no container. As migrations são aplicadas automaticamente ao iniciar o container e registradas na tabela `migrations`. O seed é idempotente.

Entidades: `users`, `tattoo_categories`, `tattoo_works`, `tattoo_images`, `appointments`, `tattoo_requests`, `contact_messages`, `site_settings` e `sessions`.

## Mídia demonstrativa

Fotos gratuitas sob licença Pexels, usadas apenas como demonstração:

- Matheus Bertelli: https://www.pexels.com/photo/tattoo-artist-creating-intricate-design-indoors-35833278/
- Kenneth Surillo: https://www.pexels.com/photo/tattoo-artist-at-work-in-studio-environment-29547855/
- Kenneth Surillo: https://www.pexels.com/photo/tattoo-artist-at-work-in-studio-setting-29547857/
- cottonbro studio: https://www.pexels.com/photo/woman-in-a-tattoo-studio-5088509/
- Kaboompics: https://www.pexels.com/photo/tattoo-on-an-arm-4750247/
- Brett Sayles: https://www.pexels.com/photo/close-up-photo-of-person-with-tattoos-2126124/
- ROMAN ODINTSOV: https://www.pexels.com/photo/black-tattoo-on-a-person-s-arm-8349189/
- Aleiha M.: https://www.pexels.com/photo/close-up-view-of-tattoo-on-arm-10710995/
- Licença Pexels: https://www.pexels.com/license/
- Vídeo do hero por Omar Zupa: https://www.pexels.com/video/close-up-on-tattoo-artist-working-9966329/

Para produção, substitua as imagens por fotografias próprias e confirme autorizações de imagem/modelo. A arquitetura atual usa URLs no seed e arquivos locais para uploads; a [Fase 2](./ROADMAP.md) prevê armazenamento em nuvem.

## Segurança e limitações da Fase 1

- Implementado: hash bcrypt, cookies `HttpOnly`/`SameSite`, sessão server-side, Helmet, validação obrigatória no servidor, limites e MIME de upload, queries preparadas e rotas protegidas.
- Antes de produção: adicionar CSRF dedicado, rate limiting, antivírus/inspeção de arquivo, recuperação de senha, 2FA, storage externo, backups e PostgreSQL gerenciado.
- O botão WhatsApp usa número demonstrativo configurável; nenhum envio oficial de e-mail/WhatsApp está conectado.
- O produto é dedicado a um único estúdio. Não há e não está planejado checkout, pagamento online, marketplace, múltiplas unidades, white-label ou SaaS.

Consulte [ROADMAP.md](./ROADMAP.md) para as próximas fases.
