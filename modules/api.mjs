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
 * Parses the request's body to update the contactme file.
 * @param {Request} request standard
 * @param {Response} response standard
 */
export async function epContactme(request, response) {
  const rawBody = await getBody(request);
  const body = JSON.parse(rawBody);
  console.log(body);

  const hasEmail = body.hasOwnProperty("email");
  const hasMessage = body.hasOwnProperty("message");

  if (!hasEmail || !hasMessage) {
    response.statusCode = 400;
    response.statusMessage = `Invalid object: no ${hasEmail ? "" : "email"}${
      !hasEmail && !hasMessage ? " or " : ""
    }${hasMessage ? "" : "message"} property!`;
    response.end();
    return;
  }

  appendFile("./contactme.txt", pred_contactme(body.email, body.message));

  response.statusCode = 200;
  response.setHeader("Content-Type", "application/json");
  response.setHeader("Content-Length", Buffer.byteLength(rawBody));
  response.end(rawBody);
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
