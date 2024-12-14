import { readFileSync } from "node:fs";
import { epContactme } from "./api.mjs";

export const name = "requests";

const ep_contact = "/contactme";
const ep_user = "/user";
const ep_id = (id) => `/user/${id}`;

const methods = new Map();
methods.set(ep_contact, ["POST"]);
methods.set(ep_user, ["POST", "GET", "PUT"]); // use for /user/id

// splits url paths like
const RE_PATH_SPLIT = /(?<=.)(?=\/)+/;

export function requestListener(request, response) {
  const [service, ...url] = request.url.split(RE_PATH_SPLIT);

  if ("/api" == service) {
    handleApi(request, response);
  } else {
    url.push(service);
    handleWebsite(url, response);
  }
}

/**
 * Handles all endpoints in /api in a RESTful manner.
 *
 * Queries:
 * - POST /contactme  -- create new contactme data
 * - POST /user       -- create new user information (body contains flags)
 * - GET  /user/[ID]  -- read user information (body contains flats)
 * - PUT  /user/[ID]  -- update user information (body contains flags)
 *
 * Flags:
 * - UserData:           body contains account data
 * - Palette:            body contains palette data
 * - Preferences:        body contains preference data
 *
 * @param {Request} req standard HTTP Request object
 * @param {Response} res standard HTTP Response object
 */
function handleApi(req, res) {
  console.log(req.method, "sent to", req.url);
  let path = req.url.slice(4);

  if (!methods.has(path)) {
    res.writeHead(501); //
    res.end();
    return;
  }

  if (!methods.get(path).includes(req.method)) {
    res.writeHead(405); // Method not allowed!
    res.end();
    return;
  }

  switch (path) {
    case ep_contact:
      epContactme(req, res);
      break;

    default:
      res.writeHead(501); // Not implemented by exhaustion
      res.end();
      break;
  }
}

/**
 * Basic HMTL fileserver.
 * @param {Array} url array of path -- should be length 1
 * @param {Response} res standard HTTP Response object
 */
function handleWebsite(url, res) {
  let filename = undefined;
  let contentType = "text/html";

  if (url.length != 0) {
    filename = url.pop();

    switch (filename.split(".")[1]) {
      case "html":
        break;
      case "js":
        contentType = "text/javascript";
        break;
      case "css":
        contentType = "text/css";
        break;
      default:
        filename = "/index.html";
        contentType = "text/html";
        break;
    }
  }

  // console.log(
  //   `Fetching ./frontend${filename} with Content-Type: ${contentType}, according to url: ${[
  //     filename,
  //     url,
  //   ].join()}`
  // );

  try {
    // throws if unable to read file
    let file = readFileSync(`./frontend${filename}`);

    res.setHeader("Content-Type", contentType);
    res.writeHead(200);

    res.end(file);
  } catch (err) {
    console.error(`Unable to find file ./frontend${filename}`);
    res.writeHead(501);
    res.end();
  }
}
