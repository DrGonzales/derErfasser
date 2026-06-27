export class Metadata {

  inspector = "";

  constructor(data: Partial<Metadata>) {

    Object.assign(this, data);
  }

}