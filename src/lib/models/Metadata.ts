export class Metadata {

  inspector = "";

  constructor(data?: Partial<Metadata>) {
    if (data) {
      Object.assign(this, data);
    }
  }

}