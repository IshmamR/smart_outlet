require('dotenv').config();
const express = require("express");
const cors = require("cors");
const { tuyaRouter, initiateTuya } = require("./tuya");

initiateTuya();

const app = express();

app.use(cors({ origin: "*" }));

app.get("/ping", (_, res) => {
  res.send("PONG");
});

app.use("/tuya", tuyaRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
