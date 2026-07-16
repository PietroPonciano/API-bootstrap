import path from "node:path";

import FileSystemService from "../filesystem/FileSystemService.js";
import Template from "./Template.js";

class TemplateLoader {

    static templatesDirectory = path.resolve(
        process.cwd(),
        "templates"
    );

    static async list() {

        const entries =
            await FileSystemService.readDirectory(
                this.templatesDirectory
            );

        const templates = [];

        for (const entry of entries) {

            if (!entry.isDirectory()) {
                continue;
            }

            templates.push(
                await this.load(entry.name)
            );

        }

        return templates;

    }

    static async load(templateId) {

        const templatePath = path.join(
            this.templatesDirectory,
            templateId
        );

        const metadataPath = path.join(
            templatePath,
            "template.json"
        );

        if (!(await FileSystemService.exists(metadataPath))) {

            throw new Error(
                `Template "${templateId}" not found.`
            );

        }

        const metadata = JSON.parse(
            await FileSystemService.readFile(
                metadataPath
            )
        );

        return new Template(
            templatePath,
            metadata
        );

    }

}

export default TemplateLoader;