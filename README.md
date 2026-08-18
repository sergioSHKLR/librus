- 🇺🇸 [English](#english)
  - ⚙️ [1. The Entry Point: Librus Core (librus-shell)](#1-the-entry-point-librus-core-librus-shell)
  - 📖 [2. The Specialized Flavor: Doutrina (doutrina / doutrina-content)](#2-the-specialized-flavor-doutrina-doutrina--doutrina-content)
  - 🏛️ [3. The Hyper-Specialized Sub-Flavor: Centro (centro)](#3-the-hyper-specialized-sub-flavor-centro-centro)
  - 🤝 [How to Contribute](#how-to-contribute)
- 🇧🇷 [Português](#português)
  - ⚙️ [1. O Ponto de Entrada: Núcleo Librus (librus-shell)](#1-o-ponto-de-entrada-núcleo-librus-librus-shell)
  - 📖 [2. O Sabor Especializado: Doutrina (doutrina / doutrina-content)](#2-o-sabor-especializado-doutrina-doutrina--doutrina-content)
  - 🏛️ [3. A Subvariante Hiperespecializada: Centro (centro)](#3-a-subvariante-hiperespecializada-centro-centro)
  - 🤝 [Como Contribuir](#como-contribuir)

# 🌐 Librus Ecosystem: Repository Guide & Contribution Hub

Welcome to the **Librus** project family! 🚀 Librus is a zero-framework, vanilla web platform designed for high-performance, accessible digital text repositories.

Because the project is modular, it spans multiple repositories ranging from the foundational core engine down to specialized downstream implementations. Choose the repository that matches your area of interest to get started.

---

## ⚙️ 1. The Entry Point: Librus Core (`librus-shell`)

- **Repository:** [sergioSHKLR/librus-shell](https://github.com/sergioSHKLR/librus-shell)
- **What it is:** The foundational, agnostic web application engine. It handles the core single-page reader interface (SPA), UI components, navigation, and zero-framework performance optimization using vanilla HTML, CSS, and JavaScript.
- **Who it's for:** Frontend developers, UI/UX contributors, and performance enthusiasts working on the core engine.

## 📖 2. The Specialized Flavor: Doutrina (`doutrina` / `doutrina-content`)

- **Web:** [doutrina.org](https://doutrina.org)
- **Repositories:**
  - [sergioSHKLR/doutrina-content](https://github.com/sergioSHKLR/doutrina-content) (Raw Markdown content repository)
  - [sergioSHKLR/librus-linker](https://github.com/sergioSHKLR/librus-linker) (Automated cross-reference linker tool)
  - [sergioSHKLR/doutrina](https://github.com/sergioSHKLR/doutrina) (Main site wrapper)

- **What it is:** The primary specialized implementation built on top of Librus, tailored specifically for Spiritist literature, classical book transcriptions, and structured study repositories. Content passes from `doutrina-content` through `librus-linker` before being built by the shell.
- **Who it's for:** Content curators, researchers, proofreaders, and text editors managing Markdown libraries and historical literature.

## 🏛️ 3. The Hyper-Specialized Sub-Flavor: Centro (`centro`)

- **Web:** [centro.doutrina.org](https://centro.doutrina.org)
- **Repository:** [sergioSHKLR/centro](https://github.com/sergioSHKLR/centro)
- **What it is:** A further specialized sub-flavor branching directly off of Doutrina. It provides tailored layouts, focused modules, and configuration adjustments specifically designed for study center applications and operational reference use.
- **Who it's for:** Contributors looking to refine specialized presentation layers, specific study aids, or localized center toolsets.

---

## 🤝 How to Contribute

1. **Explore the Repos:** Pick the layer you want to impact (Core Engine, Content Pipeline, Main Doutrina flavor, or Centro sub-flavor).
2. **Fork & Clone:** Set up your workspace locally.
3. **Submit a PR:** Push your improvements, proofreads, or code fixes via a Pull Request.

---

# 🌐 Ecossistema Librus: Guia de Repositórios e Central de Contribuição

Bem-vindo à família de projetos **Librus**! 🚀 O Librus é uma plataforma web em _vanilla_ (sem frameworks), projetada para criar repositórios de textos digitais de alta performance e acessibilidade.

Como o projeto é modular, ele se divide em vários repositórios, desde o motor central base até implementações especializadas. Escolha o repositório que melhor corresponde ao seu interesse para começar.

---

## ⚙️ 1. O Ponto de Entrada: Núcleo Librus (`librus-shell`)

- **Repositório:** [sergioSHKLR/librus-shell](https://github.com/sergioSHKLR/librus-shell)
- **O que é:** O motor de aplicação web fundamental e agnóstico. Ele gerencia a interface principal de leitura em página única (SPA), componentes de IU, navegação e otimização de desempenho utilizando HTML, CSS e JavaScript puros.
- **Para quem é:** Desenvolvedores frontend, contribuidores de IU/UX e entusiastas de performance que desejam aprimorar o motor principal.

## 📖 2. O Sabor Especializado: Doutrina (`doutrina` / `doutrina-content`)

- **Web:** [doutrina.org](https://doutrina.org)
- **Repositórios:**
  - [sergioSHKLR/doutrina-content](https://github.com/sergioSHKLR/doutrina-content) (Repositório de conteúdo em Markdown bruto)
  - [sergioSHKLR/librus-linker](https://github.com/sergioSHKLR/librus-linker) (Ferramenta automatizada de links cruzados)
  - [sergioSHKLR/doutrina](https://github.com/sergioSHKLR/doutrina) (Repositório principal do site)

- **O que é:** A principal implementação especializada construída sobre o Librus, focada na literatura espírita, transcrições de livros clássicos e repositórios de estudo estruturados. O conteúdo passa de `doutrina-content` pelo `librus-linker` antes de ser compilado pelo _shell_.
- **Para quem é:** Curadores de conteúdo, pesquisadores, revisores e editores de texto que gerenciam bibliotecas em Markdown e literatura histórica.

## 🏛️ 3. A Subvariante Hiperespecializada: Centro (`centro`)

- **Web:** [centro.doutrina.org](https://centro.doutrina.org)
- **Repositório:** [sergioSHKLR/centro](https://github.com/sergioSHKLR/centro)
- **O que é:** Um sub-sabor ainda mais especializado, derivado diretamente da Doutrina. Ele fornece layouts adaptados, módulos focados e ajustes de configuração projetados especificamente para aplicações voltadas a centros de estudo e referência operacional.
- **Para quem é:** Contribuidores focados em refinar camadas de apresentação especializadas, ferramentas de estudo específicas ou recursos direcionados.

---

## 🤝 Como Contribuir

1. **Escolha o Repositório:** Identifique a camada que deseja impactar (Motor Central, Pipeline de Conteúdo, Sabor Doutrina ou Sub-sabor Centro).
2. **Faça um Fork & Clone:** Configure seu ambiente de desenvolvimento local.
3. **Envie um PR:** Submeta suas melhorias, correções textuais ou alterações de código através de um _Pull Request_.
