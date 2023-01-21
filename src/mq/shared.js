const amqp = require("amqplib/callback_api");
const build = require("./build");

const LISTEN_OPTIONS = {
  noAck: true,
};

const listen = () => {
  amqp.connect("amqp://127.0.0.1", function (error0, connection) {
    if (error0) {
      throw error0;
    }

    console.log("RabbitMQ is ready!");

    connection.createChannel(function (error1, channel) {
      if (error1) {
        throw error1;
      }

      channel.consume("build", build, LISTEN_OPTIONS);
    });
  });
};

module.exports = {
  listen,
};
