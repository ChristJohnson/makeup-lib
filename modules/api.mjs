import { appendFile } from "node:fs/promises";

export const name = "makeup-api";

const pred_contactme = (email, message) => `====FROM: ${email}====
DATE: ${new Date()}
${message}
`;

// combine with bitwise OR  (|)
// compare with bitwise AND (&)
const USERDATA = 1;
const PALETTE = 2;
const PREFERENCES = 4;

/**
 * This file implements elements of CRUD for endpoints:
 * - C (POST) /contactme
 * - CRU (POST, GET, PUT) /user
 */

/**
 * Accepted Methods: POST, GET
 *
 * Parses the request's body to update supabase with given information.
 * @param {Request} request standard
 * @param {Response} response standard
 * @returns nothing; writes body back to response
 */
export async function epUser(request, response) {
  const method = request.method;
  const url = new URL(
    `http://${process.env.HOST ?? "localhost"}${request.url}`
  );
  // console.log(url);

  if ("POST" == method) {
    const body = JSON.parse(await getBody(request));
    let bodyProperties = objectHasOwnProperties(body, "flags");

    if (!bodyProperties.allPresent || "0" == body["flags"]) {
      // there are no flags, I don't know what to do!!!
      respondBodyInvalid(bodyProperties, response);
      return;
    }

    const flags = parseInt(body["flags"]);

    if ((USERDATA & flags) > 0) {
      bodyProperties = objectHasOwnProperties(body, "name", "email", "age");

      if (!bodyProperties.allPresent) {
        respondBodyInvalid(bodyProperties, response);
        return;
      }

      // TODO: set information in supabase
      // TODO: get & append proper UUID for entry to object
      body[id] = 1;
    }

    if ((PALETTE & flags) > 0) {
      // TODO: implement (need structure)
    }

    if ((PREFERENCES & flags) > 0) {
      // TODO: implement (need structure)
    }

    replyGood(body, response);
  }

  // /api/user?id=[ID]&flags=[FLAGS]
  // /api/user?email=[EMAIL] -> [ID]
  if ("GET" == method) {
    let flags = url.searchParams.get("flags");
    if ("" == flags) flags = "0";
    flags = parseInt(flags);

    const body = {};
    // TODO(database team): populate from supabase
    // TODO(database team): remove dummy data

    if ((USERDATA & flags) > 0) {
      // TODO: remove these lines
      body["name"] = "Chris Johnson";
      body["email"] = "test@example.com";
      body["age"] = 22;
    }

    if ((PALETTE & flags) > 0) {
      // TODO: implement (need structure)
      body["palettes"] = [];
    }

    if ((PREFERENCES & flags) > 0) {
      // TODO: implement (need structure)
      body["preferences"] = {};
    }

    replyGood(body, response);
  }
}

/**
 * Accepted Methods: POST
 *
 * Parses the request's body to update the contactme file.
 * @param {Request} request standard
 * @param {Response} response standard
 */
export async function epContactme(request, response) {
  const body = JSON.parse(await getBody(request));
  const bodyProperties = objectHasOwnProperties(body, "email", "message");

  if (!bodyProperties.allPresent) {
    respondBodyInvalid(bodyProperties, response);
    return;
  }

  appendFile("./contactme.txt", pred_contactme(body.email, body.message));

  replyGood(body, response);
}

/**
 * Returns the literal data from the body of a request.
 * @param {Request} req standard HTTP incoming Request object
 * @returns the enitre request in string form
 */
async function getBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];

    req.on("data", (chunk) => {
      chunks.push(chunk);
    });

    req.on("end", () => {
      resolve(Buffer.concat(chunks));
    });

    req.on("error", (err) => {
      reject(err);
    });
  });
}

function objectHasOwnProperties(obj, ...properties) {
  const status = {
    allPresent: true,
    absent: [],
  };

  for (const key of properties) {
    if (!Object.hasOwn(obj, key)) {
      status.allPresent = false;
      status.absent.push(key);
    }
  }

  return status;
}

/**
 * WARNING: CONSUMES `response`
 * @param {*} properties
 * @param {*} response
 */
function respondBodyInvalid(properties, response) {
  response.statusCode = 400;
  response.statusMessage = `Invalid request body: no valid value for property(ies) ${properties.absent
    .join(", ")
    .replace(/, (?!.*, )/, ", or ")}`;
  response.end();
}

/**
 * WARNING: CONSUMES `response`
 * @param {*} properties
 * @param {*} response
 */
function replyGood(body, response) {
  response.statusCode = 200;
  if (body != null && typeof body != "string") {
    body = JSON.stringify(body);
    response.setHeader("Content-Type", "application/json");
    response.setHeader("Content-Length", Buffer.byteLength(body));
  }
  response.end(body);
}
