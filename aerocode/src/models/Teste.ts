import { TipoTeste } from "../enums/TipoTeste";
import { ResultadoTeste } from "../enums/ResultadoTeste";

export class Teste {

  constructor(
    public tipo: TipoTeste,
    public resultado: ResultadoTeste
  ) {}

}
