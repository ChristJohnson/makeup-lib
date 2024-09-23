import { readFileSync } from "node:fs";

export function getResource(rsc) {
  rsc = `./frontend/${rsc}`;
  let resource;

  try {
    resource = readFileSync(rsc, "utf8");
    // console.log(`resource found at ${rsc}`);
  } catch (err) {
    console.error(`resource file not found: ${rsc}`);
  }

  return resource;
}
