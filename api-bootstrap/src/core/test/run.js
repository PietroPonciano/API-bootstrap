import CommandRunner from "../commands/CommandRunner.js";

console.log("================================");
console.log("Teste run()");
console.log("================================");

const result = await CommandRunner.run("node --version");

console.log(result);

console.log("\n================================");
console.log("Teste runSync()");
console.log("================================");

const resultSync = CommandRunner.runSync("npm --version");

console.log(resultSync);

console.log("\n================================");
console.log("Teste runStreaming()");
console.log("================================");

const resultStreaming = await CommandRunner.runStreaming(
  "npm --version",
  (log) => {
    process.stdout.write(log);
  }
);

console.log("\nResultado final:");

console.log(resultStreaming);