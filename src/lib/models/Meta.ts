export type Auditor = {
  name: string;
  anschrift: string;
  ort: string;
  auditorname: string;
};

export class Meta {
  readonly id = "singleton" as const;
  pruefObjekt = "";
  namen = "";
  anschrift = "";
  ort = "";
  aktuellePruefung = "";
  auditor: Auditor = { name: "", anschrift: "", ort: "", auditorname: "" };

  constructor(data?: Partial<Omit<Meta, "id">>) {
    if (data) {
      Object.assign(this, data);
    }

    // Defensiv: sicherstellen, dass `auditor` immer ein vollständiges Objekt
    // ist, auch wenn `data` kein `auditor` enthält (Legacy-Datensätze aus
    // älteren Backups/IndexedDB-Einträgen) oder nur teilweise befüllt ist.
    this.auditor = {
      name: "",
      anschrift: "",
      ort: "",
      auditorname: "",
      ...(data?.auditor ?? {}),
    };
  }
}
