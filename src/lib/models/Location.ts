export class Location {
        locationName = "";
        building = "";
        room = "";

        constructor(data: Partial<Location>) {
                Object.assign(this, data);
        }
}