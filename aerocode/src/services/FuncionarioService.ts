import { Funcionario } from "../models/Funcionario";
import { NivelPermissao } from "../enums/NivelPermissao";
import * as fs from "fs";
import * as path from "path";

const ARQUIVO = path.join(__dirname, "../../data/funcionarios.json");

export class FuncionarioService {

  private funcionarios: Funcionario[] = [];
  private proximoId: number = 1;

  constructor() {
    this.carregar();

    // Cria o administrador padrão se não houver nenhum funcionário
    if (this.funcionarios.length === 0) {
      const admin = new Funcionario(
        this.proximoId++,
        "Administrador",
        "(12) 99999-0000",
        "Aerocode HQ, São José dos Campos",
        "admin",
        "admin123",
        NivelPermissao.ADMINISTRADOR
      );
      this.funcionarios.push(admin);
      this.salvar();
    }
  }

  /**
   * Cadastra um funcionário. Retorna false se o usuário já existir.
   */
  cadastrar(funcionario: Funcionario): boolean {
    if (this.funcionarios.some(f => f.usuario === funcionario.usuario)) {
      return false;
    }
    funcionario.id = this.proximoId++;
    this.funcionarios.push(funcionario);
    this.salvar();
    return true;
  }

  listar(): Funcionario[] {
    return this.funcionarios;
  }

  buscarPorId(id: number): Funcionario | undefined {
    return this.funcionarios.find(f => f.id === id);
  }

  autenticar(usuario: string, senha: string): Funcionario | undefined {
    return this.funcionarios.find(f => f.autenticar(usuario, senha));
  }

  salvar() {
    const dir = path.dirname(ARQUIVO);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(ARQUIVO, JSON.stringify(this.funcionarios, null, 2), "utf-8");
  }

  carregar() {
    if (!fs.existsSync(ARQUIVO)) return;

    try {
      const dados = JSON.parse(fs.readFileSync(ARQUIVO, "utf-8")) as any[];
      this.funcionarios = dados.map(d =>
        new Funcionario(
          d.id,
          d.nome,
          d.telefone,
          d.endereco,
          d.usuario,
          d.senha,
          d.nivelPermissao as NivelPermissao
        )
      );
      if (this.funcionarios.length > 0) {
        this.proximoId = Math.max(...this.funcionarios.map(f => f.id)) + 1;
      }
    } catch {
      console.warn("Aviso: não foi possível carregar funcionarios.json. Iniciando sem dados.");
      this.funcionarios = [];
    }
  }

}
