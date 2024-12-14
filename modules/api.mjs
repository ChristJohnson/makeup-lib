import { appendFile } from "node:fs/promises";
import { getPalettesByUser, getUser } from "./supabase.mjs";
import { addUser, addPalette } from "./supabase.mjs";

export const name = "makeup-api";

const pred_contactme = (email, message) => `====FROM: ${email}====
DATE: ${new Date()}
${message}
`;

// combine with bitwise OR  (|)
// compare with bitwise AND (&)
const USERDATA = 1;
const PALETTE = 2;

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

      body["id"] = addUser(body.name, body.email, body.age);
    }

    if ((PALETTE & flags) > 0) {
      bodyProperties = objectHasOwnProperties(
        body,
        "user_id",
        "palette_name",
        "palette_data"
      );
      if (!bodyProperties.allPresent) {
        respondBodyInvalid(bodyProperties, response);
        return;
      }

      body["palette_id"] = addPalette(
        body.user_id,
        body.palette_name,
        body.palette_data
      );
    }

    replyGood(body, response);
  }

  // /api/user?id=[ID]&flags=[FLAGS]
  if ("GET" == method) {
    let flagString = url.searchParams.get("flags");
    const flags = parseInt(flagString);
    const user_id = url.searchParams.get("id");
    if ("" == flagString) flagString = "0";

    const body = {};

    if ((USERDATA & flags) > 0) {
      const data = getUser(user_id);
      for (const key of data) {
        body[key] = data[key];
      }
    }

    if ((PALETTE & flags) > 0) {
      let palettes = getPalettesByUser(user_id);
      body["palettes"] = [];
      for (const key in palettes) {
        body["palettes"].push(palettes[key]);
      }
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
