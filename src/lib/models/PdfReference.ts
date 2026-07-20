export class PdfReference {
    id = "";
    name = "";

    constructor(data?: Partial<PdfReference>) {
        Object.assign(this, data);
    }
}
