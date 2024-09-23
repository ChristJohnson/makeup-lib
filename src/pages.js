import { readFileSync } from "node:fs";

const PAGE = (path) => "./frontend/src/" + path;
const DIST = (path) => "./frontend/dist/" + path;

export const p_index = () => {
  let index = readFileSync(PAGE("index.html"), "utf8");
  return index;
};

export const p_not_found = `Oops, page not found!`;

// TODO (chris): implement
export function getPage(path) {
  return p_not_found;
}
