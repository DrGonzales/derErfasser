export class ImageReference {
    id = "";

    constructor(data?: Partial<ImageReference>) {
        Object.assign(this, data);
    }
}