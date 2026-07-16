class Template {
    constructor(path, metadata) {
        this.path = path;
        this.metadata = metadata;
    }

    get id() {
        return this.metadata.id;
    }

    get name() {
        return this.metadata.name;
    }

    get version() {
        return this.metadata.version;
    }

    get description() {
        return this.metadata.description;
    }

    get variables() {
        return this.metadata.variables;
    }

    get engine() {
        return this.metadata.engine;
    }

    get language() {
        return this.metadata.language;
    }
}

export default Template;