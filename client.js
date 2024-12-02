const EventSource = require("eventsource");
const { execSync } = require("child_process");

function main(remote, port) {
  const client = execSync("ssh -G nosana.dev | grep ^hostname")
    .toString()
    .replace("hostname ", "")
    .trim();
  const eventSource = new EventSource(`${client}:${port}/rcode/listen`);

  eventSource.addEventListener("open", async (event) => {
    if (event.type === "open" && event.data) {
      const { path } = JSON.parse(event.data);
      try {
        execSync(
          `code --folder-uri=vscode-remote://ssh-remote+${remote}${path}`
        );
      } catch (err) {
        console.error(err);
      }
    }
  });

  eventSource.addEventListener("connection_init", (event) => {
    if (event.type === "connection_init" && event.data) {
      console.log("Successfully connection to remote listener");
    }
  });

  eventSource.onerror = () => {
    const error = new Error("Cannot connect to remote rcode service");
    error.stack = undefined;
    throw error;
  };
}

module.exports = main;
