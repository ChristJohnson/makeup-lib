import { p_index } from "./pages.js";
import { getResource } from "./resources.js";
import { getTemplate } from "./templates.js";

export const rootRequestListener = function(request, response) {

  let url = request.url.slice(1);

  // BUG(chris): favicon is sent, but not loaded
  // favicon source: https://icon-icons.com/icon/Makeup/116527
  if (url === "favicon.ico") {
    let icon = getResource(url);

    if (!icon) {
      response.writeHead(500);
      response.end("Internal Server Error");
      return; // EARLY RETURN
    }

    response.setHeader("Content-Type", "image/x-icon");
    response.writeHead(200);
    response.end(icon);

    return; // EARLY RETURN
  }
  
  
  let handler = getHandler(url);


  handler(request, response);

}


function getHandler(url) {
  let handler = htmlRequestHandler;
  let urlParts = url.split("/");

  switch(urlParts[0]) {
    case ("api"):
      handler = jsonRequestHandler;
      break;
    case ("cdn"):
      handler = distributionHandler;
      break;
    case ("tpl"):
      handler = basicTemplateHandler;
      break;
    default:
      handler = htmlRequestHandler;
      break;
  }

  return handler;
}


const jsonRequestHandler = function(req, res) {
  res.setHeader("Content-Type", "application/json");

  // TODO(chris): req.url for endpoint /api/endpoint?var1=val1&var2=val2...

  res.writeHead(200);
  res.end(`{"type": "lipstick", "name": "Ruby Red", "details": "foobar"}`);
};

const htmlRequestHandler = function(req, res) {
  res.setHeader("Content-Type", "text/html");
  res.writeHead(200);
  res.end(p_index());
};

const distributionHandler = function(req, res) {
  // NOTE(chris): BUG: if we change CDN endpoint this breaks!
  let fileName = req.url.slice(1);
  let fileExtension = fileName.split(".");
  fileExtension = fileExtension[fileExtension.length - 1];

// console.log(`looking for ${fileExtension}`);
  switch (fileExtension) {
    case ("css"):
      // console.log(`found css`)
      res.setHeader("Content-Type", "text/css");
      break;
    default: // case ("js"):
      res.setHeader("Content-Type", "text/javascript");
      break;
  }
  
  // console.log(`looking for cdn file: ${fileName}`);

  let data = getResource(fileName);
  // console.log(`found data for ${fileName}:\n${data}`);

  if (!data) {
    res.writeHead(404);
    res.end("File Not Found");
    return; // EARLY RETURN
  }

  res.writeHead(200);
  res.end(data);
}

const basicTemplateHandler = function(req, res) {
  res.setHeader("Content-Type", "text/html");

  let templateName = req.url.slice(1).split("/");
  templateName = templateName[templateName.length - 1];
  
  // TODO(chris): parse req url
  let template = getTemplate(templateName).string;
  
  if (!template) {
    res.writeHead(404);
    res.end("File Not Found");
    return; // EARLY RETURN
  }

  res.writeHead(200);
  res.end(template);
}
