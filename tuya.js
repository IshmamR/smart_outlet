const { TuyaContext } = require("@tuya/tuya-connector-nodejs");
const { Router } = require("express");
const {
  TUYA_ACCESS_KEY,
  TUYA_SECRET_KEY,
  TUYA_DEVICE_ID,
} = require("./config");
const { default: axios } = require("axios");
const dayjs = require("dayjs");

const tuyaRouter = Router();

/**
 * @type {TuyaContext|null}
 */
let tuya = null;

const initiateTuya = () => {
  tuya = new TuyaContext({
    baseUrl: "https://openapi.tuyaeu.com",
    accessKey: TUYA_ACCESS_KEY,
    secretKey: TUYA_SECRET_KEY,
    rpc: axios,
  });
};

const isTuya = (req, res, next) => {
  if (!tuya) return res.send("What?");
  next();
};

tuyaRouter.get("/device", isTuya, async (_req, res) => {
  const device = await tuya.request({
    method: "GET",
    path: `/v1.0/devices/${TUYA_DEVICE_ID}`,
  });

  res.json(device);
});

tuyaRouter.get("/logs", isTuya, async (req, res) => {
  const now = new Date().getTime();

  const {
    start_time = 0,
    end_time = now,
    start_row_key,
    size = 100,
    codes = "cur_current,cur_power,cur_voltage",
  } = req.query;

  const query = {
    device_id: TUYA_DEVICE_ID,
    type: "7",
    codes,
    start_time,
    end_time,
    start_row_key,
    size,
    query_type: 1,
  };

  const logs = await tuya.request({
    method: "GET",
    path: `/v1.0/devices/${TUYA_DEVICE_ID}/logs`,
    query,
    body: {},
  });

  res.json(logs);
});

tuyaRouter.get("/power-consumption", isTuya, async (req, res) => {
  const { dateStart, dateEnd } = req.query;

  if (dateStart && dateEnd && (isNaN(dateStart) || isNaN(dateEnd))) {
    return res.status(400).json({ message: "Nope" });
  }

  const now = new Date().getTime();

  let hasNext = true;
  let start_row_key = undefined;

  const query = {
    device_id: TUYA_DEVICE_ID,
    type: "7",
    codes: "cur_power",
    start_time: dateStart || 0,
    end_time: dateEnd || now,
    size: 100,
    query_type: 1,
  };

  let totalPower = 0;
  let count = 0;
  while (hasNext) {
    const power = await tuya.request({
      method: "GET",
      path: `/v1.0/devices/${TUYA_DEVICE_ID}/logs`,
      query: { ...query, start_row_key },
      body: {},
    });

    let total = 0;
    power.result.logs.forEach((log) => {
      total += parseInt(log.value);
      count++;
    });

    totalPower += total;

    hasNext = power.result.has_next;
    start_row_key = power.result.next_row_key;
  }

  res.json({ total: totalPower, count });
});

tuyaRouter.get("/functions", isTuya, async (_req, res) => {
  const functions = await tuya.request({
    method: "GET",
    path: `/v1.0/devices/${TUYA_DEVICE_ID}/functions`,
  });

  res.json(functions);
});

tuyaRouter.get("/turn-switch/:status", isTuya, async (req, res) => {
  const { status } = req.params;
  const switch_value = status === "on" ? true : false;

  const resp = await tuya.request({
    method: "POST",
    path: `/v1.0/devices/${TUYA_DEVICE_ID}/commands`,
    body: {
      commands: [{ code: "switch_1", value: switch_value }],
    },
  });

  res.json(resp);
});

tuyaRouter.get("/light_mode/:status", isTuya, async (req, res) => {
  /**
   * @type {"relay"|"pos"|"none"}
   */
  const status = req.params.status;

  const resp = await tuya.request({
    method: "POST",
    path: `/v1.0/devices/${TUYA_DEVICE_ID}/commands`,
    body: {
      commands: [{ code: "light_mode", value: status }],
    },
  });

  res.json(resp);
});

module.exports = { initiateTuya, tuyaRouter };
