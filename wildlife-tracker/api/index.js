const path = require("path");
const app = require("../server");

// Serve static files from public
app.use(require("express").static(path.join(__dirname, "..", "public")));

// Fallback to index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

module.exports = app;
