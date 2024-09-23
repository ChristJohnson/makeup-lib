import { createServer } from "node:http";

import { DEBUG } from "./constants.js";
import { rootRequestListener } from "./requests.js";
import { loadTemplates } from "./templates.js";

const HOST = 'localhost';
const PORT = 80;

loadTemplates();
// TODO(chris): do HTTPS?
/*
import { createServer } from "node:https";
const SERVER_OPTIONS = {
  key: readFileSync(private-key.pem),
  cert: readFileSync(certificate.pem),
};
const server = createServer(SERVER_OPTIONS);
*/
const server = createServer();

server.on("request", rootRequestListener);

// NOTE(chris): for quick, graceful testing/auto-shutoff
if (DEBUG && false) {
  server.on("connection", () => {
    setTimeout(() => {
      server.close();
    }, 5000);
  });
}

server.listen(PORT, HOST, () =>  {
  console.log(`Server is running on http://${HOST}:${PORT}`);
});
