import { readFile, readFileSync, readdirSync } from "node:fs";

import { DEBUG } from "./constants.js";

const TEMPLATE_REGEX = /\$(?<=\}?.*)\{[^\$]*(?=.*\$?)\}/g;
const TEMPLATE_CACHE = {};

export function loadTemplates() {
  let templates = readdirSync("./frontend/src")
    .filter(file => file.includes("tpl_"))
    .map(file => {
      let templateObject = {};
      templateObject.name = file,
      templateObject.path = `./frontend/src/${file}`
      return templateObject;
  });

  templates.forEach(template => {
    readFile(template.path, "utf8", (err, data) => {
      TEMPLATE_CACHE[template.name] = { string: data, raw: data.split(TEMPLATE_REGEX) };
    });
  });
}


export function getTemplate(name) {
  name = `tpl_${name}.html`;

  // hot-reloading
  if (DEBUG) {
    loadTemplates();
  }

  if (TEMPLATE_CACHE[name]) {
    return TEMPLATE_CACHE[name];
  }

  return undefined;

}

