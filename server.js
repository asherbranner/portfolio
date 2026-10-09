const express = require("express");
const app = express();
const routes = require("./routes");
const middleware = require("./middleware");

middleware(app);
routes(app);

app.listen(3000, function () {
  console.log("HTTP Server running on port 3000.");
});
