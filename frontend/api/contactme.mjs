import { appendFile } from "node:fs/promises";

const pred_contactme = (email, message) => `====FROM: ${email}====
DATE: ${new Date()}
${message}
`;

export default async function POST(request, response) {
  const bodyBuffer = await getBody(request);
  const body = JSON.parse(bodyBuffer);
  const bodyProperties = objectHasOwnProperties(body, "email", "message");

  if (!bodyProperties.allPresent) {
    console.error("oops, there was a problem handling the request");
    response.statusCode = 400;
    response.statusMessage = `Invalid request body: no valid value for property(ies) ${properties.absent
      .join(", ")
      .replace(/, (?!.*, )/, ", or ")}`;
    response.end();

    return response;
  }

  appendFile("../contactme.txt", pred_contactme(body.email, body.message));

  response.statusCode = 201;
  response.end();

  return response;
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
