#!/usr/bin/env -S node --no-warnings
const { dirname } = require("path");
const { Command } = require("commander");

const client = require("./client.js");
const server = require("./server.js");

const program = new Command();
program
  .name("rcode")
  .description("Remotely code command")
  .version("0.0.0")
  .argument("<string>", "path")
  .action(async (path) => {
    const __dirname = dirname(
      require("url").pathToFileURL(__filename).toString().replace("file://", "")
    );

    try {
      await fetch(`http://localhost:3010/rcode?path=${__dirname}/${path}`, {
        method: "GET",
      });
    } catch {
      const error = new Error(
        "RCode service is not online, please run rcode serve to start the service"
      );

      error.stack = "";
      throw error;
    }
  });

program
  .command("serve")
  .description("Creating local listening server")
  .option("-p, --port <port>", "Define port for service", "3010")
  .action(({ port: portOption }) => {
    const port = parseInt(portOption);
    server(port);
  });

program
  .command("listen")
  .description("listen to rcode service")
  .argument("<string>", "remote client address")
  .option("-p, --port <port>", "Define port for service", "3010")
  .action((str, { port: portOption }) => {
    const port = parseInt(portOption);
    client(str, port);
  });

program.parse();
