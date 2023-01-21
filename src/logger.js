const chalk = require("chalk");

class Logger {
  logs = [];

  log(line) {
    this.logs.push(line);
    if (process.env.NODE_ENV !== "production") {
      console.log(chalk.yellow(` [xBLOG] ${line}`));
    }
  }

  get() {
    return this.logs;
  }
}

module.exports = Logger;
