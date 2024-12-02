const express = require("express");
const EventEmitter = require("events");

const app = express();
const emitter = new EventEmitter();

function createEventSourceEvent(value) {
  let type,
    msg = value;
  if (typeof msg === "object") {
    // @ts-ignore
    type = value.event;
    msg = JSON.stringify({ ...msg, time_stamp: new Date().toString() });
  }
  return `data: ${msg}\n${type ? `event: ${type}\n` : ""}\n`;
}

function main(port) {
  app.get("/rcode", (req, res) => {
    console.log(req.query);
    emitter.emit("open", req.query.path);
    res.status(200).send();
  });

  app.get("/rcode/listen", (req, res) => {
    res.writeHead(200, {
      Connection: "keep-alive",
      "Cache-Control": "no-cache",
      "Content-Type": "text/event-stream",
    });

    res.write(createEventSourceEvent({ event: "connection_init" }));

    emitter.addListener("open", (path) => {
      res.write(createEventSourceEvent({ path, event: "open" }));
    });

    res.on("close", () => {
      res.end();
    });
  });

  app.listen(port);
}

module.exports = main;
