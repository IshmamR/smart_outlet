const dayjs = require("dayjs");
const { Router } = require("express");

const espRouter = Router();

espRouter.get("/", (req, res) => {
  console.log(req.query);
  res.status(200).send("HELLO");
});

espRouter.get("/logs", (req, res) => {
  const lastDate = dayjs("2023-12-08T08:04:52.652Z");
  const logs = [
    {
      current: 120,
      voltage: 239.2,
      power: 162,
      time: +lastDate.subtract(4, "minute"),
    },
    {
      current: 177,
      voltage: 241,
      power: 272,
      time: +lastDate.subtract(3, "minute"),
    },
    {
      current: 134,
      voltage: 240.69,
      power: 187,
      time: +lastDate.subtract(2, "minute"),
    },
    {
      current: 192,
      voltage: 238.9,
      power: 347,
      time: +lastDate.subtract(1, "minute"),
    },
    {
      current: 0,
      voltage: 239.85,
      power: 0,
      time: +lastDate,
    },
  ];

  res.json(logs);
});

espRouter.get("/power-consumption", (req, res) => {
  res.json({ total: 0.98 });
});

module.exports = espRouter;
