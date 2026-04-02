import { Aeronave } from "./Aeronave";
import * as fs from "fs";

export class Relatorio {

  gerar(aeronave: Aeronave, cliente: string, dataEntrega: string): string {
    const sep = "=".repeat(46);
    const lin = "-".repeat(46);

    const pecasInfo = aeronave.pecas.length
      ? aeronave.pecas.map(p =>
          `  - ${p.nome}\n    Tipo: ${p.tipo} | Fornecedor: ${p.fornecedor} | Status: ${p.status}`
        ).join("\n")
      : "  Nenhuma peça registrada";

    const etapasInfo = aeronave.etapas.length
      ? aeronave.etapas.map((e, i) => {
          const funcs = e.funcionarios.length
            ? e.funcionarios.map(f => `    * ${f.nome} (${f.nivelPermissao})`).join("\n")
            : "    * Sem funcionários designados";
          return `  ${i + 1}. ${e.nome}\n     Prazo: ${e.prazo} | Status: ${e.status}\n     Funcionários:\n${funcs}`;
        }).join("\n")
      : "  Nenhuma etapa registrada";

    const testesInfo = aeronave.testes.length
      ? aeronave.testes.map(t => `  - ${t.tipo}: ${t.resultado}`).join("\n")
      : "  Nenhum teste registrado";

    const aprovados  = aeronave.testes.filter(t => t.resultado === "Aprovado").length;
    const reprovados = aeronave.testes.length - aprovados;

    return `
${sep}
       RELATÓRIO FINAL DE AERONAVE
${sep}

DADOS DA AERONAVE
${lin}
Código:     ${aeronave.codigo}
Modelo:     ${aeronave.modelo}
Tipo:       ${aeronave.tipo}
Capacidade: ${aeronave.capacidade} passageiros
Alcance:    ${aeronave.alcance} km

DADOS DE ENTREGA
${lin}
Cliente:      ${cliente}
Data entrega: ${dataEntrega}

PEÇAS UTILIZADAS (${aeronave.pecas.length})
${lin}
${pecasInfo}

ETAPAS REALIZADAS (${aeronave.etapas.length})
${lin}
${etapasInfo}

RESULTADOS DOS TESTES (${aeronave.testes.length})
${lin}
${testesInfo}

Aprovados:  ${aprovados}
Reprovados: ${reprovados}

${sep}
Relatório gerado em: ${new Date().toLocaleString("pt-BR")}
${sep}
`;
  }

  salvar(relatorio: string, arquivo: string) {
    fs.writeFileSync(arquivo, relatorio, "utf-8");
    console.log(`Relatório salvo em: ${arquivo}`);
  }

}
