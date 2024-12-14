import { createServer } from "node:http";
import { requestListener } from "./requests.mjs";

const PORT = process.env.PORT || 8000;
const HOST = process.env.HOST || "localhost";

const server = createServer();

server.on("request", requestListener);
server.listen(PORT, HOST, serverStartup);

function serverStartup(...args) {
  console.log(`Server is running on http://${HOST}:${PORT}`);

  // pseudo-cli
  process.stdin.on("data", (data) => {
    if (data.toString().includes("q")) {
      console.log("Shutting down...");
      process.exit();
    }
  });
}
