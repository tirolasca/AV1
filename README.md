# ✈️ Aerocode

Sistema de gestão da produção de aeronaves desenvolvido em **TypeScript**. Permite controlar todo o ciclo produtivo de uma aeronave — do cadastro inicial até a entrega ao cliente — via interface de linha de comando (CLI).

---

## 📋 Funcionalidades

- **Autenticação** com controle de acesso por nível de permissão (Administrador, Engenheiro, Operador)
- **Aeronaves** — cadastro com código único, modelo, tipo (Comercial/Militar), capacidade e alcance
- **Peças** — registro com tipo (Nacional/Importada), fornecedor e rastreamento de status (Em produção → Em transporte → Pronta)
- **Etapas de produção** — com lógica de ordem sequencial (uma etapa só pode ser concluída após a anterior)
- **Funcionários** — cadastro e associação a etapas, sem duplicidade
- **Testes** — registro de testes Elétrico, Hidráulico e Aerodinâmico com resultado Aprovado/Reprovado
- **Relatório final** — gerado em tela e salvo em `.txt`, contendo todos os dados da aeronave, cliente, etapas, peças e testes
- **Persistência** — todos os dados são salvos automaticamente em arquivos JSON na pasta `data/`

---

## 🗂️ Estrutura do projeto

```
aerocode/
├── src/
│   ├── enums/
│   │   ├── NivelPermissao.ts
│   │   ├── ResultadoTeste.ts
│   │   ├── StatusEtapa.ts
│   │   ├── StatusPeca.ts
│   │   ├── TipoAeronave.ts
│   │   ├── TipoPeca.ts
│   │   └── TipoTeste.ts
│   ├── models/
│   │   ├── Aeronave.ts
│   │   ├── Etapa.ts
│   │   ├── Funcionario.ts
│   │   ├── Peca.ts
│   │   ├── Relatorio.ts
│   │   └── Teste.ts
│   ├── services/
│   │   ├── AeronaveService.ts
│   │   └── FuncionarioService.ts
│   └── main.ts
├── data/                 
│   └── funcionarios.json
├── package.json
└── tsconfig.json
```

---

## 🚀 Como executar

### Pré-requisitos

- [Node.js](https://nodejs.org/) v18 ou superior
- npm v9 ou superior

### Instalação

```bash
# Clone o repositório
git clone https://github.com/tirolasca/AV1.git
cd aerocode

# Instale as dependências
npm install

# Compile o TypeScript
npm run build

# Execute o sistema
npm start
```
---

## 🔐 Acesso inicial

Na primeira execução, um usuário administrador padrão é criado automaticamente:

| Campo   | Valor      |
|---------|------------|
| Usuário | `admin`    |
| Senha   | `admin123` |

> **Recomendado:** cadastre um novo administrador e altere as credenciais padrão antes de usar em produção.

---

## 🧭 Menu do sistema

```
===== SISTEMA AEROCODE =====
1 - Cadastrar Aeronave
2 - Listar Aeronaves
3 - Adicionar Peça
4 - Atualizar Status de Peça
5 - Gerenciar Etapas
6 - Registrar Teste
7 - Gerar Relatório
8 - Gerenciar Funcionários  ← apenas Administrador
0 - Sair
```

---

## 🏗️ Diagrama de classes (resumo)

```
Aeronave ─────┬──── Peca      (TipoPeca, StatusPeca)
              ├──── Etapa     (StatusEtapa)
              │       └────── Funcionario (NivelPermissao)
              └──── Teste     (TipoTeste, ResultadoTeste)
                       │
                   Relatorio
```

---

## 💾 Persistência

Os dados são salvos automaticamente em `data/` toda vez que uma operação de escrita é realizada. Ao reiniciar o sistema, as informações são recarregadas dos arquivos JSON. Nenhum dado é perdido ao encerrar.

```
data/
├── aeronaves.json      # aeronaves, peças, etapas e testes
├── funcionarios.json   # funcionários e credenciais
└── relatorio_XXX.txt   # relatórios gerados (um por aeronave)
```

---

## 🛠️ Tecnologias

- **TypeScript 5** — tipagem estática, enums, classes
- **Node.js** — runtime e módulos `fs`, `path`, `readline`
- **CommonJS** — módulos compilados para execução direta com `node`
