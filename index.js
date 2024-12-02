import { dirname } from "path";
import { fileURLToPath } from "url";
import { Command, Option } from "commander";

import client from "./client.js";
import server from "./server.js";

const program = new Command();
program
  .name("rcode")
  .description("Remotely code command")
  .version("0.0.0")
  .argument("<string>", "path")
  .action(async (path) => {
    console.log(path);

    const __dirname = dirname(fileURLToPath(import.meta.url));
    console.log(__dirname);

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
  .addOption(
    new Option(
      "-t, --tunnel <tunnel>",
      "vcode tunnel address"
    ).makeOptionMandatory()
  )
  .action((str, { tunnel }) => {
    client(str, tunnel);
  });

program.parse();
