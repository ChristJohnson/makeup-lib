import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://axlkpyetnmbcnzncpwvp.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bGtweWV0bm1iY256bmNwd3ZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQwNjAzMDgsImV4cCI6MjA0OTYzNjMwOH0.hKKyYuNkQ7NyRJif0sZZfps_5Fr8T-4LgYN6s-UGHtY"
);

// combine with bitwise OR  (|)
// compare with bitwise AND (&)
const USERDATA = 1;
const PALETTE = 2;

/**
 * Accepted Methods: POST, GET
 *
 * Parses the request's body to update supabase with given information.
 * @param {Request} request standard
 * @param {Response} response standard
 * @returns nothing; writes body back to response
 */
export default async function (request, response) {
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

      body["id"] = await addUser(body.name, body.email, body.age);
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

      body["palette_id"] = await addPalette(
        body.user_id,
        body.palette_name,
        body.palette_data
      );
    }

    replyGood(body, response);
  }

  /**
   * If the combination exists, returns the associated user_id.
   * Otherwise, adds an entry to the users table.
   * HINT: this one will need at least 2 queries
   * @return the associated user_id
   */
  async function addUser(name, email, age) {
    const { data: existingUser, error: selectError } = await supabase
      .from("users")
      .select("user_id")
      .eq("email", email);

    // if (selectError) throw selectError;

    if (existingUser.length > 0) {
      return existingUser[0].user_id;
    }

    const { data: newUser, error: insertError } = await supabase
      .from("users")
      .insert({ name, email, age })
      .select("user_id");

    // if (insertError) throw insertError;

    console.log(`setting new user_id ${JSON.stringify(newUser)}`);
    return newUser[0].user_id;
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

  // /api/user?id=[ID]&flags=[FLAGS]
  if ("GET" == method) {
    let flagString = url.searchParams.get("flags");
    const flags = parseInt(flagString);
    const user_id = url.searchParams.get("id");
    if ("" == flagString) flagString = "0";

    const body = {};

    if ((USERDATA & flags) > 0) {
      const data = await getUser(user_id);

      console.log(
        `using query result ${JSON.stringify(data)}\nwith type ${typeof data}`
      );
      for (const key in data) {
        body[key] = data[key];
      }
    }

    if ((PALETTE & flags) > 0) {
      let palettes = await getPalettesByUser(user_id);
      body["palettes"] = [];
      for (const key in palettes) {
        body["palettes"].push(palettes[key]);
      }
    }
    response.statusCode = 200;
    response.end(JSON.stringify(body));
    return response;
  }

  return response;
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

/**
 * Adds an entry to the palettes table and relates it to a user in the
 * user_palettes table
 * @returns the associated palette_id
 */
export async function addPalette(user_id, palette_name, palette_data) {
  const { data: palette, error: insertPaletteError } = await supabase
    .from("palettes")
    .insert({ palette_name, palette_data })
    .select("palette_id");

  console.log(`have palette data: ${JSON.stringify(palette)}`);

  if (insertPaletteError) throw insertPaletteError;

  const palette_id = palette[0].palette_id;

  const { error: linkError } = await supabase
    .from("user_palettes")
    .insert({ user_id, palette_id });

  if (linkError) throw linkError;

  return palette_id;
}

/**
 * @return user data based on user_id
 */
async function getUser(user_id) {
  const { data, error } = await supabase
    .from("users")
    .select("name, email, age")
    .eq("user_id", user_id)
    .single();

  if (error) {
    console.error(
      `there was an error querying the data, using false data instead`
    );
    return {
      name: "Fake",
      email: "failedQuery@example.com",
      age: 21,
    };
  }

  return data;
}

/**
 * @return all palettes related to a user_id (array)
 */
async function getPalettesByUser(user_id) {
  user_id = parseInt(user_id);
  console.log("typeof user_id:", typeof user_id);

  const { data, error } = await supabase
    .from("user_palettes")
    .select()
    .eq("user_id", user_id);
  console.log("queried data", data);

  if (error) throw error;

  if (!data) {
    console.log("no data!");
    return [];
  }

  return data;
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
