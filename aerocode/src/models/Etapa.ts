import { Funcionario } from "./Funcionario";
import { StatusEtapa } from "../enums/StatusEtapa";

export class Etapa {

  funcionarios: Funcionario[] = [];

  constructor(
    public nome: string,
    public prazo: string,
    public status: StatusEtapa = StatusEtapa.PENDENTE
  ) {}

  iniciar(): boolean {
    if (this.status !== StatusEtapa.PENDENTE) return false;
    this.status = StatusEtapa.ANDAMENTO;
    return true;
  }

  finalizar(): boolean {
    if (this.status !== StatusEtapa.ANDAMENTO) return false;
    this.status = StatusEtapa.CONCLUIDA;
    return true;
  }

  associarFuncionario(func: Funcionario): boolean {
    const jaAssociado = this.funcionarios.some(f => f.id === func.id);
    if (jaAssociado) return false;
    this.funcionarios.push(func);
    return true;
  }

  listarFuncionarios(): Funcionario[] {
    return this.funcionarios;
  }

}
