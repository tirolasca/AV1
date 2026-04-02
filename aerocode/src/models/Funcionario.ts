import { NivelPermissao } from "../enums/NivelPermissao";

export class Funcionario {

  constructor(
    public id: number,
    public nome: string,
    public telefone: string,
    public endereco: string,
    public usuario: string,
    public senha: string,
    public nivelPermissao: NivelPermissao
  ) {}

  autenticar(usuario: string, senha: string): boolean {
    return this.usuario === usuario && this.senha === senha;
  }

}
