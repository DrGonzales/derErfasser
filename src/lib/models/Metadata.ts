export class Metadata {

  inspector = "";
  // Timestamp (ms since epoch) of the last backup
  lastback: number | undefined = undefined;

  constructor(data?: Partial<Metadata>) {
    if (data) {
      // coerce lastback to number when provided
      if ((data as any).lastback != null) {
        this.lastback = Number((data as any).lastback);
      }

      Object.assign(this, data);
    }
  }

}