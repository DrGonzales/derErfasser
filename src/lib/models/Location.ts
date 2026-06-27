export class Location {
        locationName = "";
        building = "";
        room = "";

        constructor(data?: Partial<Location>) {
                if (data) {
                        Object.assign(this, data);
                }
        }
}