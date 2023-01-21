const chalk = require("chalk");

class Logger {
  logs = [];

  constructor() {
    if (process.env.NODE_ENV !== "production") {
      console.log("");
    }
  }

  log(line) {
    if (process.env.NODE_ENV !== "production") {
      process.stdout.write(chalk.cyan(` [xBLOG] ${line}...`));
    }

    this.logs.push(line);
  }

  success(line) {
    if (process.env.NODE_ENV !== "production") {
      console.log(chalk.green(` [xBLOG] ${line}\n`));
    }

    this.logs.push(line);
  }

  error(line) {
    if (process.env.NODE_ENV !== "production") {
      console.log(chalk.red(` [xBLOG] ${line}\n`));
    }

    this.logs.push(line);
  }

  ok() {
    this.logs.push("OK!");

    if (process.env.NODE_ENV !== "production") {
      console.log(chalk.green("OK!"));
    }
  }

  get() {
    return this.logs;
  }
}

module.exports = Logger;
