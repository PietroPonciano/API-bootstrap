import BasePlatform from "./BasePlatform.js";
import CommandRunner from "../commands/CommandRunner.js";


class MacOSPlatform extends BasePlatform {


    openFolder(path) {
        return CommandRunner.run(`open "${path}"`);
    }


    openTerminal(path) {
        return CommandRunner.run(`open -a Terminal "${path}"`);
    }


    async checkNode() {
        return CommandRunner.run("node --version");
    }


    async checkNpm() {
        return CommandRunner.run("npm --version");
    }


    async checkGit() {
        return CommandRunner.run("git --version");
    }

}


export default MacOSPlatform;