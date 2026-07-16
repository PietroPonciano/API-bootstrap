import path from "node:path";

import FileSystemService from "../filesystem/FileSystemService.js";

class TemplateValidator {

    static requiredMetadata = [
        "id",
        "name",
        "version",
        "engine",
        "language",
        "variables"
    ];

    static requiredFiles = [
        "template.json",
        "package.json"
    ];

    static async validate(template) {

        this.validateMetadata(template);

        await this.validateStructure(template);

    }

    static validateMetadata(template) {

        for (const field of this.requiredMetadata) {

            if (!(field in template.metadata)) {

                throw new Error(
                    `Missing required field "${field}" in template.json`
                );

            }

        }

        if (!Array.isArray(template.variables)) {

            throw new Error(
                '"variables" must be an array.'
            );

        }

    }

    static async validateStructure(template) {

        for (const file of this.requiredFiles) {

            const filePath = path.join(
                template.path,
                file
            );

            if (!(await FileSystemService.exists(filePath))) {

                throw new Error(
                    `Required file "${file}" not found.`
                );

            }

        }

    }

}

export default TemplateValidator;