const { TuyaContext } = require("@tuya/tuya-connector-nodejs");
const { Router } = require("express");
const {
  TUYA_ACCESS_KEY,
  TUYA_SECRET_KEY,
  TUYA_DEVICE_ID,
} = require("./config");
const { default: axios } = require("axios");

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

tuyaRouter.get("/device", async (req, res) => {
  if (!tuya) return res.send("What?");

  const device = await tuya.request({
    method: "GET",
    path: `/v1.0/devices/${TUYA_DEVICE_ID}`,
  });

  res.json(device);
});

tuyaRouter.get("/logs", async (req, res) => {
  if (!tuya) return res.send("What?");

  const now = new Date().getTime();

  const {
    start_time = 0,
    end_time = now,
    start_row_key,
    size = 100,
  } = req.query;

  const query = {
    device_id: TUYA_DEVICE_ID,
    type: "7",
    codes: "cur_current,cur_power,cur_voltage",
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

tuyaRouter.get("/functions", async (req, res) => {
  if (!tuya) return res.send("What?");

  const functions = await tuya.request({
    method: "GET",
    path: `/v1.0/devices/${TUYA_DEVICE_ID}/functions`,
    body: {},
  });

  res.json(functions);
});

tuyaRouter.get("/turn/:status", async (req, res) => {
  if (!tuya) return res.send("What?");

  const { status } = req.params;
  const switch_value = status === "on" ? true : false; 

  const resp = await tuya.request({
    method: "POST",
    path: `/v1.0/devices/${TUYA_DEVICE_ID}/commands`,
    body: {
      commands: [
        // {
        //   code: "light_mode",
        //   value: "relay", // "relay","pos","none"
        // },
        {
          code: "switch_1",
          value: switch_value,
        },
      ],
    },
  });

  res.json(resp);
});

module.exports = { initiateTuya, tuyaRouter };
