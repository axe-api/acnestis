require("dotenv").config();
const mq = require("./mq/shared");

mq.listen();
