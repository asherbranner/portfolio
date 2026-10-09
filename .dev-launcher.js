const express = require("express");
const app = express();
const routes = require("./routes");
const middleware = require("./middleware");
middleware(app);
routes(app);
app.listen(3001, function () {
  console.log("DEV HTTP Server running on port 3001.");
});
