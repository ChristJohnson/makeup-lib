import { appendFile } from "node:fs/promises";
import {} from "node:http";

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
async function endpointContactme(request, response) {
  const rawBody = await getBody(request);
  console.log(rawBody);
  const body = JSON.parse(rawBody);

  appendFile("../contactme.txt", _);
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
