import BasePlatform from "./BasePlatform.js";
import CommandRunner from "../commands/CommandRunner.js";


class WindowsPlatform extends BasePlatform {


    openFolder(path) {
        return CommandRunner.run(`start "" "${path}"`);
    }


    openTerminal(path) {
        return CommandRunner.run(`start cmd /K cd /d "${path}"`);
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


export default WindowsPlatform;