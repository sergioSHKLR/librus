# librus

**Build step 4 of 4** · Publish host for **librus.app** (+ ecosystem map)

---

## 📑 Table of contents

1. 🇺🇸 [English](#-english--build-step-4-of-4)
   1. 🎯 [Audience](#-audience)
   2. 🗺️ [Pipeline position](#-pipeline-position)
   3. 🌐 [This host](#-this-host)
   4. ⚠️ [Do not hand-edit the app](#️-do-not-hand-edit-the-app)
   5. 📚 [Ecosystem map](#-ecosystem-map)
   6. 🤝 [How to help](#-how-to-help)
2. 🇧🇷 [Português](#-português--etapa-4-de-4)
   1. 🎯 [Público](#-público)
   2. 🗺️ [Posição no pipeline](#-posição-no-pipeline)
   3. 🌐 [Este host](#-este-host)
   4. ⚠️ [Não edite o app à mão](#️-não-edite-o-app-à-mão)
   5. 📚 [Mapa do ecossistema](#-mapa-do-ecossistema)
   6. 🤝 [Como ajudar](#-como-ajudar)

---

# 🇺🇸 English — Build step 4 of 4

GitHub Pages **deployment mirror** of `librus-shell` `dist/` for **https://librus.app**.

This README is also the **volunteer entry map** for the whole Librus family.

## 🎯 Audience

1. Maintainers who verify Pages / DNS / CNAME  
2. Collaborators oriented to the right upstream repo  
3. Reviewers assessing the project (not end readers)  

## 🗺️ Pipeline position

1. [`doutrina-content`](https://github.com/sergioSHKLR/doutrina-content) — content  
2. [`librus-linker`](https://github.com/sergioSHKLR/librus-linker) — links  
3. [`librus-shell`](https://github.com/sergioSHKLR/librus-shell) — SPA build  
4. **This repo** (and sibling hosts) — live publish  

## 🌐 This host

1. **Site:** [librus.app](https://librus.app)  
2. **Flavor:** `librus`  
3. **Source of truth for UI:** always [`librus-shell`](https://github.com/sergioSHKLR/librus-shell)  
4. **Deploy:** Actions on shell push `dist/` here (`main`)  

## ⚠️ Do not hand-edit the app

1. Do **not** patch JS/CSS in this repo for features — change **librus-shell**, then deploy.  
2. Treat committed `assets/` / `index.html` here as **generated**.  
3. CNAME / Pages settings are host concerns; app behavior is shell concerns.  

## 📚 Ecosystem map

1. ⚙️ [librus-shell](https://github.com/sergioSHKLR/librus-shell) — step 3 · engine  
2. 📖 [doutrina-content](https://github.com/sergioSHKLR/doutrina-content) — step 1 · Markdown  
3. 🔗 [librus-linker](https://github.com/sergioSHKLR/librus-linker) — step 2 · injection  
4. 🌐 [doutrina](https://github.com/sergioSHKLR/doutrina) — step 4 · doutrina.org  
5. 🏛️ [centro](https://github.com/sergioSHKLR/centro) — step 4 · centro.doutrina.org  

## 🤝 How to help

1. Open issues on the **upstream** repo that owns the layer (content vs shell vs linker).  
2. For UI bugs: shell + flavor + viewport.  
3. For text/anchors: doutrina-content.  
4. For live DNS/Pages only: this host.  

---

# 🇧🇷 Português — Etapa 4 de 4

Espelho de publicação (GitHub Pages) do `dist/` de `librus-shell` em **https://librus.app**.

Este README também é o **mapa de entrada** para voluntários da família Librus.

## 🎯 Público

1. Mantenedores de Pages / DNS / CNAME  
2. Colaboradores que precisam achar o repo certo  
3. Avaliadores do projeto (não leitores finais)  

## 🗺️ Posição no pipeline

1. [`doutrina-content`](https://github.com/sergioSHKLR/doutrina-content) — conteúdo  
2. [`librus-linker`](https://github.com/sergioSHKLR/librus-linker) — ligações  
3. [`librus-shell`](https://github.com/sergioSHKLR/librus-shell) — build da SPA  
4. **Este repo** (e hosts irmãos) — publicação  

## 🌐 Este host

1. **Site:** [librus.app](https://librus.app)  
2. **Sabor:** `librus`  
3. **Fonte da UI:** sempre [`librus-shell`](https://github.com/sergioSHKLR/librus-shell)  
4. **Deploy:** Actions do shell enviam `dist/` para cá  

## ⚠️ Não edite o app à mão

1. Não corrija JS/CSS de produto aqui — altere **librus-shell** e publique.  
2. `assets/` / `index.html` aqui são **gerados**.  
3. CNAME/Pages = host; comportamento do app = shell.  

## 📚 Mapa do ecossistema

1. ⚙️ [librus-shell](https://github.com/sergioSHKLR/librus-shell) — etapa 3  
2. 📖 [doutrina-content](https://github.com/sergioSHKLR/doutrina-content) — etapa 1  
3. 🔗 [librus-linker](https://github.com/sergioSHKLR/librus-linker) — etapa 2  
4. 🌐 [doutrina](https://github.com/sergioSHKLR/doutrina) — etapa 4 · doutrina.org  
5. 🏛️ [centro](https://github.com/sergioSHKLR/centro) — etapa 4 · centro.doutrina.org  

## 🤝 Como ajudar

1. Abra issues no repo **upstream** da camada certa.  
2. Bugs de UI: shell + sabor + viewport.  
3. Texto/âncoras: doutrina-content.  
4. Só DNS/Pages: este host.  
