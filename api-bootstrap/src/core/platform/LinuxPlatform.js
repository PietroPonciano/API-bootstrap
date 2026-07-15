import BasePlatform from "./BasePlatform.js";
import CommandRunner from "../commands/CommandRunner.js";


class LinuxPlatform extends BasePlatform {


    openFolder(path) {
        return CommandRunner.run(`xdg-open "${path}"`);
    }


    openTerminal(path) {
        return CommandRunner.run(`x-terminal-emulator --working-directory="${path}"`);
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


export default LinuxPlatform;