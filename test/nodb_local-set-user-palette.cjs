const { request } = require("node:http");

const url = new URL("http://localhost/api/user");
url.port = 3000;

console.log(`sending request to ${url}`);

const postData = JSON.stringify({
  flags: 3,
  name: "testmod",
  email: "testing3@example.com",
  age: 25,

  user_id: 5,
  palette_name: "foobar",
  palette_data: [1, 2, 3, 4, 5, 6, 7],
});

const options = {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(postData),
  },
};

let req = request(url, options, (res) => {
  console.log(`running callback on request to ${url}`);
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

req.write(postData);
req.end();
