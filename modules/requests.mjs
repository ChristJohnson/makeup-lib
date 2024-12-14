import { readFileSync } from "node:fs";

export const name = "requests";

// splits url paths like
const RE_PATH_SPLIT = /(?<=.)(?=\/)+/;

export function requestListener(request, response) {
  const [service, ...url] = request.url.split(RE_PATH_SPLIT);

  if ("/api" == service) {
    handleApi(req, resp);
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
 * - PUT  /user/[ID]  -- update user information (body contains flags)
 * - GET  /user/[ID]  -- read user information (body contains flats)
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
  console.log(req.url);
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

  console.log(
    `Fetching ./frontend${filename} with Content-Type: ${contentType}, according to url: ${[
      filename,
      url,
    ].join()}`
  );

  try {
    // throws if unable to read file
    let file = readFileSync(`./frontend${filename}`);

    res.setHeader("Content-Type", contentType);
    res.writeHead(200);

    res.end(file);
  } catch (err) {
    console.error(err);
    res.writeHead(501);
    res.end();
  }
}
