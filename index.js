require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { tuyaRouter, initiateTuya } = require("./tuya");
const espRouter = require("./esp32");
const { CORS_ORIGIN } = require("./config");

initiateTuya();

const app = express();

app.use(cors({ origin: CORS_ORIGIN }));

app.get("/ping", (_, res) => {
  res.send("PONG");
});

app.use("/tuya", tuyaRouter);
app.use("/esp", espRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
