const { request } = require("node:http");

const url = new URL("http://localhost/api/user?id=1&flags=2");
url.port = 8000;

console.log(`sending request to ${url}`);
console.log(`sending request to path ${url.pathname.slice(4)}`);

const options = {
  method: "GET",
};

let req = request(url, options, (res) => {
  res.on("data", (chunk) => {
    console.log(`BODY: ${chunk}`);
  });
  res.on("end", () =>
    console.log(`BODY: done
    STATUS: ${res.statusCode}
    STATUS MESSAGE: ${res.statusMessage}`)
  );
  res.on("error", (err) => console.error(err));
});

req.end();
