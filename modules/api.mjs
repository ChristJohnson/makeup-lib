import { appendFile } from "node:fs/promises";

export const name = "makeup-api";

const pred_contactme = (email, message) => `====FROM: ${email}====
DATE: ${new Date()}
${message}
`;

/**
 * This file implements elements of CRUD for endpoints:
 * - C (POST) /contactme
 * - CRU (POST, GET, PUT) /user
 */

/**
 * Accepted Methods: POST
 *
 * Parses the request's body to update the contactme file.
 * @param {Request} request standard
 * @param {Response} response standard
 */
export async function epUser(request, response) {
  // TODO(chris): demultiplex request handling on method
  // NOTE(chris): assuming SET -- create
  const body = JSON.parse(await getBody(request));
  const bodyProperties = objectHasOwnProperties(body, "name", "email", "age");

  if (!bodyProperties.allPresent) {
    respondRequestBodyInvalid(bodyProperties, response);
    return;
  }

  pingpongRequestBody(body, response);
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
    respondRequestBodyInvalid(bodyProperties, response);
    return;
  }

  appendFile("./contactme.txt", pred_contactme(body.email, body.message));

  pingpongRequestBody(body, response);
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
function respondRequestBodyInvalid(properties, response) {
  response.statusCode = 400;
  response.statusMessage = `Invalid request body: no ${properties.absent
    .join(", ")
    .replace(/, (?!.*, )/, ", or ")} property`;
  response.end();
}

/**
 * WARNING: CONSUMES `response`
 * @param {*} properties
 * @param {*} response
 */
function pingpongRequestBody(body, response) {
  if (typeof body != "string") {
    body = JSON.stringify(body);
  }
  response.statusCode = 200;
  response.setHeader("Content-Type", "application/json");
  response.setHeader("Content-Length", Buffer.byteLength(body));
  response.end(body);
}
