import { exec, execSync, spawn } from "node:child_process";

class CommandRunner {
  /**
   * Executa um comando de forma assíncrona.
   */
  static run(command, options = {}) {
    return new Promise((resolve, reject) => {
      exec(command, options, (error, stdout, stderr) => {
        if (error) {
          return reject({
            stdout,
            stderr,
            code: error.code,
            error
          });
        }

        resolve({
          stdout,
          stderr,
          code: 0
        });
      });
    });
  }

  /**
   * Executa um comando de forma síncrona.
   */
  static runSync(command, options = {}) {
    try {
      const stdout = execSync(command, {
        ...options,
        encoding: "utf8"
      });

      return {
        stdout,
        stderr: "",
        code: 0
      };
    } catch (error) {
      return {
        stdout: error.stdout?.toString() ?? "",
        stderr: error.stderr?.toString() ?? "",
        code: error.status ?? 1
      };
    }
  }

  /**
   * Executa um comando exibindo os logs em tempo real.
   */
  static runStreaming(command, onLog = () => {}, options = {}) {
    return new Promise((resolve, reject) => {
      const child = spawn(command, {
        shell: true,
        ...options
      });

      let stdout = "";
      let stderr = "";

      child.stdout.on("data", (data) => {
        const text = data.toString();

        stdout += text;
        onLog(text);
      });

      child.stderr.on("data", (data) => {
        const text = data.toString();

        stderr += text;
        onLog(text);
      });

      child.on("close", (code) => {
        resolve({
          stdout,
          stderr,
          code
        });
      });

      child.on("error", (error) => {
        reject(error);
      });
    });
  }
}

export default CommandRunner;