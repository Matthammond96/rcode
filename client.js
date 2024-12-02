import EventSource from "eventsource";
import { execSync } from "child_process";

export default function main(remote, tunnel) {
  const eventSource = new EventSource(`${remote}/rcode/listen`);

  eventSource.addEventListener("open", async (event) => {
    if (event.type === "open" && event.data) {
      const { path } = JSON.parse(event.data);
      try {
        execSync(
          `code --folder-uri=vscode-remote://ssh-remote+${tunnel}${path}`
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
