const express = require("express");
const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Test API Working!" });
});

app.get("/api/test", (req, res) => {
  res.json({ status: "OK", time: new Date() });
});

module.exports = app;
