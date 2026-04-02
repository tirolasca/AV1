import * as readline from "readline";
import * as path from "path";
import { Aeronave } from "./models/Aeronave";
import { Peca } from "./models/Peca";
import { Etapa } from "./models/Etapa";
import { Teste } from "./models/Teste";
import { Funcionario } from "./models/Funcionario";
import { Relatorio } from "./models/Relatorio";
import { TipoAeronave } from "./enums/TipoAeronave";
import { TipoPeca } from "./enums/TipoPeca";
import { StatusPeca } from "./enums/StatusPeca";
import { StatusEtapa } from "./enums/StatusEtapa";
import { NivelPermissao } from "./enums/NivelPermissao";
import { TipoTeste } from "./enums/TipoTeste";
import { ResultadoTeste } from "./enums/ResultadoTeste";
import { AeronaveService } from "./services/AeronaveService";
import { FuncionarioService } from "./services/FuncionarioService";

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (msg: string) => new Promise<string>(res => rl.question(msg, res));

const aeronaveService = new AeronaveService();
const funcionarioService = new FuncionarioService();
let usuarioLogado: Funcionario | null = null;

// ─── Helpers ────────────────────────────────────────────────────────────────

function opcoes<T extends string>(enumeracao: Record<string, T>): string {
  return Object.values(enumeracao).map((v, i) => `  ${i + 1} - ${v}`).join("\n");
}

function valorEnum<T extends string>(enumeracao: Record<string, T>, indice: number): T | undefined {
  const vals = Object.values(enumeracao);
  return vals[indice - 1];
}

// ─── Login ───────────────────────────────────────────────────────────────────

async function login(): Promise<void> {
  console.log("\n===== AEROCODE — LOGIN =====");
  console.log("(usuário padrão: admin / senha: admin123)\n");

  const usuario = await ask("Usuário: ");
  const senha   = await ask("Senha:   ");

  const func = funcionarioService.autenticar(usuario, senha);
  if (!func) {
    console.log("\nUsuário ou senha incorretos. Tente novamente.");
    return login();
  }

  usuarioLogado = func;
  console.log(`\nBem-vindo, ${func.nome} (${func.nivelPermissao})!`);
  return menu();
}

// ─── Menu principal ──────────────────────────────────────────────────────────

async function menu(): Promise<void> {
  const nivel = usuarioLogado!.nivelPermissao;

  console.log("\n===== SISTEMA AEROCODE =====");
  console.log("1 - Cadastrar Aeronave");
  console.log("2 - Listar Aeronaves");
  console.log("3 - Adicionar Peça");
  console.log("4 - Atualizar Status de Peça");
  console.log("5 - Gerenciar Etapas");
  console.log("6 - Registrar Teste");
  console.log("7 - Gerar Relatório");

  if (nivel === NivelPermissao.ADMINISTRADOR) {
    console.log("8 - Gerenciar Funcionários");
  }

  console.log("0 - Sair");

  const opcao = await ask("\nEscolha uma opção: ");

  switch (opcao.trim()) {
    case "1": return cadastrarAeronave();
    case "2": return listarAeronaves();
    case "3": return adicionarPeca();
    case "4": return atualizarStatusPeca();
    case "5": return menuEtapas();
    case "6": return registrarTeste();
    case "7": return gerarRelatorio();
    case "8":
      if (nivel === NivelPermissao.ADMINISTRADOR) return menuFuncionarios();
      console.log("Acesso negado.");
      return menu();
    case "0":
      console.log("\nAté logo!\n");
      return rl.close();
    case "42":
      return easterEgg();
    default:
      console.log("Opção inválida.");
      return menu();
  }
}

// ─── Aeronaves ───────────────────────────────────────────────────────────────

async function cadastrarAeronave(): Promise<void> {
  console.log("\n--- Cadastrar Aeronave ---");
  const codigo    = await ask("Código:     ");
  const modelo    = await ask("Modelo:     ");

  console.log(`Tipo:\n${opcoes(TipoAeronave)}`);
  const tipoIdx   = Number(await ask("Escolha o tipo: "));
  const tipo      = valorEnum(TipoAeronave, tipoIdx);
  if (!tipo) { console.log("Tipo inválido."); return menu(); }

  const capacidade = Number(await ask("Capacidade: "));
  const alcance    = Number(await ask("Alcance (km): "));

  const aeronave = new Aeronave(codigo, modelo, tipo, capacidade, alcance);
  const ok = aeronaveService.cadastrar(aeronave);

  console.log(ok ? "Aeronave cadastrada com sucesso!" : `Erro: já existe uma aeronave com o código "${codigo}".`);
  return menu();
}

async function listarAeronaves(): Promise<void> {
  const lista = aeronaveService.listar();
  if (lista.length === 0) {
    console.log("\nNenhuma aeronave cadastrada.");
  } else {
    lista.forEach(a => console.log(a.exibirDetalhes()));
  }
  return menu();
}

// ─── Peças ───────────────────────────────────────────────────────────────────

async function adicionarPeca(): Promise<void> {
  console.log("\n--- Adicionar Peça ---");
  const codigo = await ask("Código da aeronave: ");
  const aeronave = aeronaveService.buscar(codigo);
  if (!aeronave) { console.log("Aeronave não encontrada."); return menu(); }

  const nome      = await ask("Nome da peça: ");
  const fornecedor = await ask("Fornecedor:   ");

  console.log(`Tipo da peça:\n${opcoes(TipoPeca)}`);
  const tipoIdx = Number(await ask("Escolha: "));
  const tipo = valorEnum(TipoPeca, tipoIdx);
  if (!tipo) { console.log("Tipo inválido."); return menu(); }

  const peca = new Peca(nome, tipo, fornecedor, StatusPeca.EM_PRODUCAO);
  aeronave.adicionarPeca(peca);
  aeronaveService.salvar();

  console.log(`Peça "${nome}" adicionada (status inicial: Em produção).`);
  return menu();
}

async function atualizarStatusPeca(): Promise<void> {
  console.log("\n--- Atualizar Status de Peça ---");
  const codigo = await ask("Código da aeronave: ");
  const aeronave = aeronaveService.buscar(codigo);
  if (!aeronave) { console.log("Aeronave não encontrada."); return menu(); }
  if (aeronave.pecas.length === 0) { console.log("Esta aeronave não tem peças."); return menu(); }

  aeronave.pecas.forEach((p, i) => console.log(`  ${i + 1} - ${p.nome} | atual: ${p.status}`));
  const pecaIdx = Number(await ask("Escolha a peça: ")) - 1;
  const peca = aeronave.pecas[pecaIdx];
  if (!peca) { console.log("Peça inválida."); return menu(); }

  console.log(`Novo status:\n${opcoes(StatusPeca)}`);
  const statusIdx = Number(await ask("Escolha: "));
  const novoStatus = valorEnum(StatusPeca, statusIdx);
  if (!novoStatus) { console.log("Status inválido."); return menu(); }

  peca.atualizarStatus(novoStatus);
  aeronaveService.salvar();
  console.log(`Status de "${peca.nome}" atualizado para "${novoStatus}".`);
  return menu();
}

// ─── Etapas ──────────────────────────────────────────────────────────────────

async function menuEtapas(): Promise<void> {
  console.log("\n--- Gerenciar Etapas ---");
  console.log("1 - Adicionar Etapa");
  console.log("2 - Iniciar Etapa");
  console.log("3 - Finalizar Etapa");
  console.log("4 - Associar Funcionário à Etapa");
  console.log("0 - Voltar");

  const opcao = await ask("Escolha: ");
  switch (opcao.trim()) {
    case "1": return adicionarEtapa();
    case "2": return iniciarEtapa();
    case "3": return finalizarEtapa();
    case "4": return associarFuncionarioEtapa();
    case "0": return menu();
    default:  console.log("Opção inválida."); return menuEtapas();
  }
}

async function adicionarEtapa(): Promise<void> {
  const codigo = await ask("Código da aeronave: ");
  const aeronave = aeronaveService.buscar(codigo);
  if (!aeronave) { console.log("Aeronave não encontrada."); return menuEtapas(); }

  const nome  = await ask("Nome da etapa: ");
  const prazo = await ask("Prazo (ex: 30/06/2025): ");

  aeronave.adicionarEtapa(new Etapa(nome, prazo));
  aeronaveService.salvar();
  console.log(`Etapa "${nome}" adicionada com status Pendente.`);
  return menuEtapas();
}

async function iniciarEtapa(): Promise<void> {
  const aeronave = await selecionarAeronaveComEtapas();
  if (!aeronave) return menuEtapas();

  const etapaIdx = await selecionarEtapa(aeronave);
  if (etapaIdx < 0) return menuEtapas();

  const ok = aeronave.etapas[etapaIdx].iniciar();
  if (ok) {
    aeronaveService.salvar();
    console.log("Etapa iniciada (Em andamento).");
  } else {
    console.log("Esta etapa não pode ser iniciada (já está em andamento ou concluída).");
  }
  return menuEtapas();
}

async function finalizarEtapa(): Promise<void> {
  const aeronave = await selecionarAeronaveComEtapas();
  if (!aeronave) return menuEtapas();

  const etapaIdx = await selecionarEtapa(aeronave);
  if (etapaIdx < 0) return menuEtapas();

  if (!aeronave.podeFinalizarEtapa(etapaIdx)) {
    console.log("Erro: a etapa anterior ainda não foi concluída.");
    return menuEtapas();
  }

  const ok = aeronave.etapas[etapaIdx].finalizar();
  if (ok) {
    aeronaveService.salvar();
    console.log("Etapa finalizada (Concluída).");
  } else {
    console.log("Esta etapa não está Em andamento e não pode ser finalizada.");
  }
  return menuEtapas();
}

async function associarFuncionarioEtapa(): Promise<void> {
  const aeronave = await selecionarAeronaveComEtapas();
  if (!aeronave) return menuEtapas();

  const etapaIdx = await selecionarEtapa(aeronave);
  if (etapaIdx < 0) return menuEtapas();

  const funcs = funcionarioService.listar();
  if (funcs.length === 0) { console.log("Nenhum funcionário cadastrado."); return menuEtapas(); }

  funcs.forEach(f => console.log(`  ${f.id} - ${f.nome} (${f.nivelPermissao})`));
  const funcId = Number(await ask("ID do funcionário: "));
  const func = funcionarioService.buscarPorId(funcId);
  if (!func) { console.log("Funcionário não encontrado."); return menuEtapas(); }

  const ok = aeronave.etapas[etapaIdx].associarFuncionario(func);
  if (ok) {
    aeronaveService.salvar();
    console.log(`${func.nome} associado à etapa.`);
  } else {
    console.log("Este funcionário já está associado a esta etapa.");
  }
  return menuEtapas();
}

// ─── Testes ──────────────────────────────────────────────────────────────────

async function registrarTeste(): Promise<void> {
  console.log("\n--- Registrar Teste ---");
  const codigo = await ask("Código da aeronave: ");
  const aeronave = aeronaveService.buscar(codigo);
  if (!aeronave) { console.log("Aeronave não encontrada."); return menu(); }

  console.log(`Tipo de teste:\n${opcoes(TipoTeste)}`);
  const tipoIdx = Number(await ask("Escolha: "));
  const tipo = valorEnum(TipoTeste, tipoIdx);
  if (!tipo) { console.log("Tipo inválido."); return menu(); }

  console.log(`Resultado:\n${opcoes(ResultadoTeste)}`);
  const resIdx = Number(await ask("Escolha: "));
  const resultado = valorEnum(ResultadoTeste, resIdx);
  if (!resultado) { console.log("Resultado inválido."); return menu(); }

  aeronave.adicionarTeste(new Teste(tipo, resultado));
  aeronaveService.salvar();
  console.log(`Teste ${tipo} registrado: ${resultado}.`);
  return menu();
}

// ─── Relatório ───────────────────────────────────────────────────────────────

async function gerarRelatorio(): Promise<void> {
  console.log("\n--- Gerar Relatório ---");
  const codigo = await ask("Código da aeronave: ");
  const aeronave = aeronaveService.buscar(codigo);
  if (!aeronave) { console.log("Aeronave não encontrada."); return menu(); }

  const cliente     = await ask("Nome do cliente:  ");
  const dataEntrega = await ask("Data de entrega:  ");

  const relatorio = new Relatorio();
  const texto = relatorio.gerar(aeronave, cliente, dataEntrega);

  console.log(texto);

  const salvar = await ask("Salvar relatório em arquivo? (s/n): ");
  if (salvar.toLowerCase() === "s") {
    const arquivo = path.join(__dirname, `../data/relatorio_${aeronave.codigo}.txt`);
    relatorio.salvar(texto, arquivo);
  }

  return menu();
}

// ─── Funcionários ─────────────────────────────────────────────────────────────

async function menuFuncionarios(): Promise<void> {
  console.log("\n--- Gerenciar Funcionários ---");
  console.log("1 - Cadastrar Funcionário");
  console.log("2 - Listar Funcionários");
  console.log("0 - Voltar");

  const opcao = await ask("Escolha: ");
  switch (opcao.trim()) {
    case "1": return cadastrarFuncionario();
    case "2": return listarFuncionarios();
    case "0": return menu();
    default:  console.log("Opção inválida."); return menuFuncionarios();
  }
}

async function cadastrarFuncionario(): Promise<void> {
  console.log("\n--- Cadastrar Funcionário ---");
  const nome     = await ask("Nome:     ");
  const telefone = await ask("Telefone: ");
  const endereco = await ask("Endereço: ");
  const usuario  = await ask("Usuário:  ");
  const senha    = await ask("Senha:    ");

  console.log(`Nível de permissão:\n${opcoes(NivelPermissao)}`);
  const nivelIdx = Number(await ask("Escolha: "));
  const nivel = valorEnum(NivelPermissao, nivelIdx);
  if (!nivel) { console.log("Nível inválido."); return menuFuncionarios(); }

  const func = new Funcionario(0, nome, telefone, endereco, usuario, senha, nivel);
  const ok = funcionarioService.cadastrar(func);
  console.log(ok ? `Funcionário "${nome}" cadastrado!` : `Erro: o usuário "${usuario}" já existe.`);
  return menuFuncionarios();
}

async function listarFuncionarios(): Promise<void> {
  const lista = funcionarioService.listar();
  console.log("\n=== FUNCIONÁRIOS ===");
  lista.forEach(f => {
    console.log(`
ID:         ${f.id}
Nome:       ${f.nome}
Telefone:   ${f.telefone}
Endereço:   ${f.endereco}
Usuário:    ${f.usuario}
Permissão:  ${f.nivelPermissao}
`);
  });
  return menuFuncionarios();
}

// ─── Utilidades ──────────────────────────────────────────────────────────────

async function selecionarAeronaveComEtapas(): Promise<Aeronave | null> {
  const codigo = await ask("Código da aeronave: ");
  const aeronave = aeronaveService.buscar(codigo);
  if (!aeronave) { console.log("Aeronave não encontrada."); return null; }
  if (aeronave.etapas.length === 0) { console.log("Esta aeronave não tem etapas."); return null; }
  return aeronave;
}

async function selecionarEtapa(aeronave: Aeronave): Promise<number> {
  aeronave.etapas.forEach((e, i) =>
    console.log(`  ${i + 1} - ${e.nome} | ${e.status}`)
  );
  const idx = Number(await ask("Número da etapa: ")) - 1;
  if (idx < 0 || idx >= aeronave.etapas.length) {
    console.log("Etapa inválida.");
    return -1;
  }
  return idx;
}

// ─── Easter Egg ───────────────────────────────────────────────────────────────

async function easterEgg(): Promise<void> {
  console.log(`
✈️  ===================================
        EASTER EGG DESCOBERTO
   ===================================

Bem-vindo ao hangar secreto da Aerocode 👨‍✈️

Mensagem do sistema:
"Grandes aeronaves começam com
grandes linhas de código."

Desenvolvido por Lucas Santos 🚀

   ===================================
`);
  return menu();
}

// ─── Inicialização ────────────────────────────────────────────────────────────

login();
