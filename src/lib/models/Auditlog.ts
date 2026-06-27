export class Auditlog {

    timestamp = Date.now();
    field = "";
    old_value = "";
    new_value = "";

    constructor(data?: Partial<Auditlog>) {
        if (data) {
            Object.assign(this, data);
        }
    }
}
