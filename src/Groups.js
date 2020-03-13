class Groups {
    static schema = {
        name: "Groups",
        primaryKey: "uuid",
        properties: {
            uuid: 'string',
            name: "string"
        }
    };

    static fromResource(resource) {
        let groups = new Groups();
        groups.uuid = resource.uuid;
        groups.name = resource.name;
        return groups;
    }
}

export default Groups;
