import { Aeronave } from "../models/Aeronave";
import { Peca } from "../models/Peca";
import { Etapa } from "../models/Etapa";
import { Teste } from "../models/Teste";
import { TipoAeronave } from "../enums/TipoAeronave";
import { TipoPeca } from "../enums/TipoPeca";
import { StatusPeca } from "../enums/StatusPeca";
import { StatusEtapa } from "../enums/StatusEtapa";
import { TipoTeste } from "../enums/TipoTeste";
import { ResultadoTeste } from "../enums/ResultadoTeste";
import * as fs from "fs";
import * as path from "path";

const ARQUIVO = path.join(__dirname, "../../data/aeronaves.json");

export class AeronaveService {

  private aeronaves: Aeronave[] = [];

  constructor() {
    this.carregar();
  }

  cadastrar(aeronave: Aeronave): boolean {
    if (this.buscar(aeronave.codigo)) {
      return false;
    }
    this.aeronaves.push(aeronave);
    this.salvar();
    return true;
  }

  listar(): Aeronave[] {
    return this.aeronaves;
  }

  buscar(codigo: string): Aeronave | undefined {
    return this.aeronaves.find(a => a.codigo === codigo);
  }

  salvar() {
    const dir = path.dirname(ARQUIVO);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(ARQUIVO, JSON.stringify(this.aeronaves, null, 2), "utf-8");
  }

  carregar() {
    if (!fs.existsSync(ARQUIVO)) return;

    try {
      const dados = JSON.parse(fs.readFileSync(ARQUIVO, "utf-8")) as any[];

      this.aeronaves = dados.map(d => {
        const aeronave = new Aeronave(
          d.codigo,
          d.modelo,
          d.tipo as TipoAeronave,
          d.capacidade,
          d.alcance
        );

        aeronave.pecas = (d.pecas || []).map((p: any) =>
          new Peca(p.nome, p.tipo as TipoPeca, p.fornecedor, p.status as StatusPeca)
        );

        aeronave.etapas = (d.etapas || []).map((e: any) => {
          const etapa = new Etapa(e.nome, e.prazo, e.status as StatusEtapa);
          etapa.funcionarios = e.funcionarios || [];
          return etapa;
        });

        aeronave.testes = (d.testes || []).map((t: any) =>
          new Teste(t.tipo as TipoTeste, t.resultado as ResultadoTeste)
        );

        return aeronave;
      });

    } catch {
      console.warn("Aviso: não foi possível carregar aeronaves.json. Iniciando sem dados.");
      this.aeronaves = [];
    }
  }

}
