import logger from "../logger/Logger.js";


class SystemService {

    getVersion() {

        logger.info("Consultando versao do sistema");

        const version = "1.0.0";

        logger.debug(`Versao retornada: ${version}`);

        return version;
    }

}


export default new SystemService();