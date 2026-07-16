class TemplateEngine {
    static render(content, variables) {
        this.validate(content, variables);

        return content.replace(
            /{{\s*([A-Z0-9_]+)\s*}}/g,
            (_, key) => String(variables[key])
        );
    }

    static extract(content) {
        const placeholders = new Set();

        const regex = /{{\s*([A-Z0-9_]+)\s*}}/g;

        let match;

        while ((match = regex.exec(content)) !== null) {
            placeholders.add(match[1]);
        }

        return [...placeholders];
    }

    static validate(content, variables) {
        const placeholders = this.extract(content);

        const missing = placeholders.filter(
            placeholder => !(placeholder in variables)
        );

        if (missing.length > 0) {
            throw new Error(
                `Missing template variables: ${missing.join(", ")}`
            );
        }
    }
}

export default TemplateEngine;