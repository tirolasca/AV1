import { Peca } from "./Peca";
import { Etapa } from "./Etapa";
import { Teste } from "./Teste";
import { TipoAeronave } from "../enums/TipoAeronave";
import { StatusEtapa } from "../enums/StatusEtapa";

export class Aeronave {

  pecas: Peca[] = [];
  etapas: Etapa[] = [];
  testes: Teste[] = [];

  constructor(
    public codigo: string,
    public modelo: string,
    public tipo: TipoAeronave,
    public capacidade: number,
    public alcance: number
  ) {}

  adicionarPeca(peca: Peca) {
    this.pecas.push(peca);
  }

  adicionarEtapa(etapa: Etapa) {
    this.etapas.push(etapa);
  }

  adicionarTeste(teste: Teste) {
    this.testes.push(teste);
  }

  /**
   * Verifica se a etapa no índice dado pode ser finalizada.
   * Regra: a etapa anterior deve estar CONCLUIDA.
   */
  podeFinalizarEtapa(indice: number): boolean {
    if (indice === 0) return true;
    return this.etapas[indice - 1]?.status === StatusEtapa.CONCLUIDA;
  }

  exibirDetalhes(): string {
    const sep = "-".repeat(38);

    const pecasInfo = this.pecas.length
      ? this.pecas.map(p => `  - ${p.nome} | ${p.tipo} | ${p.fornecedor} | ${p.status}`).join("\n")
      : "  Nenhuma peça registrada";

    const etapasInfo = this.etapas.length
      ? this.etapas.map((e, i) => {
          const funcs = e.funcionarios.length
            ? e.funcionarios.map(f => `      * ${f.nome}`).join("\n")
            : "      * Sem funcionários";
          return `  ${i + 1}. ${e.nome} | Prazo: ${e.prazo} | ${e.status}\n${funcs}`;
        }).join("\n")
      : "  Nenhuma etapa registrada";

    const testesInfo = this.testes.length
      ? this.testes.map(t => `  - ${t.tipo}: ${t.resultado}`).join("\n")
      : "  Nenhum teste registrado";

    return `
===== DETALHES DA AERONAVE =====
Código:     ${this.codigo}
Modelo:     ${this.modelo}
Tipo:       ${this.tipo}
Capacidade: ${this.capacidade} passageiros
Alcance:    ${this.alcance} km
${sep}
Peças (${this.pecas.length}):
${pecasInfo}
${sep}
Etapas (${this.etapas.length}):
${etapasInfo}
${sep}
Testes (${this.testes.length}):
${testesInfo}
`;
  }

}
