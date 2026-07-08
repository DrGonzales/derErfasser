export class Meta {
  readonly id = "singleton" as const;
  pruefObjekt = "";
  namen = "";
  anschrift = "";
  ort = "";
  aktuellePruefung = "";

  constructor(data?: Partial<Omit<Meta, "id">>) {
    if (data) {
      Object.assign(this, data);
    }
  }
}
