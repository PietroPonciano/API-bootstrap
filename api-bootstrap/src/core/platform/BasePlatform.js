class BasePlatform {

    openFolder(path) {
        throw new Error("openFolder() not implemented");
    }


    openTerminal(path) {
        throw new Error("openTerminal() not implemented");
    }


    async checkNode() {
        throw new Error("checkNode() not implemented");
    }


    async checkNpm() {
        throw new Error("checkNpm() not implemented");
    }


    async checkGit() {
        throw new Error("checkGit() not implemented");
    }

}

export default BasePlatform;