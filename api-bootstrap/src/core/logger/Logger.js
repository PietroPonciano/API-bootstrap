import fs from "fs";
import path from "path";


class Logger {

    constructor() {

        this.logDir = path.join(
            process.cwd(),
            "logs"
        );

        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir);
        }

        this.logFile = path.join(
            this.logDir,
            "app.log"
        );
    }


    write(level, message) {

        const timestamp = new Date()
            .toISOString();

        const log = `[${timestamp}] [${level}] ${message}`;

        console.log(log);

        fs.appendFileSync(
            this.logFile,
            log + "\n"
        );
    }


    info(message) {
        this.write("INFO", message);
    }


    error(message) {
        this.write("ERROR", message);
    }


    warn(message) {
        this.write("WARN", message);
    }


    debug(message) {
        this.write("DEBUG", message);
    }

}


export default new Logger();