import express from "express";
import { checkMissingField } from "../utils/requestUtils.js";
import databaseClient from "../services/database.mjs";

const addActitvityRouter = express.Router();                                                                //เก็บค่าฟังก์ชั่น express router ใน addActitvityRouter
const ACT_DATA_KEYS = ["activityName","activityDes","activityType","hours","minutes","date","actImage"];    //data array key ของ activities

// รับค่าจาก database
addActitvityRouter.get("/:_id", async (req, res) => {
    //กำหนดตัวแปรในการรับค่าจาก database
    const customerActivities = await databaseClient
      .db()
      .collection("customerActivities")
      .find({ user_id: req.params._id })
      .toArray();
    res.json(customerActivities);                               //ส่งค่าข้อมูลในรูปแบบของ JSON
});

// เพิ่มข้อมูลลงใน database
addActitvityRouter.post("/", async (req, res) => {
    let body = req.body;                                        //รับค่าที่ส่งมาจาก client
    // check ว่ามี field ไหนที่ยังไม่ได้กรอกข้อมูล
    const [isBodyChecked, missingFields] = checkMissingField(
        ACT_DATA_KEYS,
        body
    );
    // ถ้าไม่ได้กรอกครบทุก field จะมี error message
    if (!isBodyChecked) {
        res.send(`Missing Fields: ${"".concat(missingFields)}`);
        return;
    }

    // เพิ่มข้อมูลลงใน database
    await databaseClient.db().collection("customerActivities").insertOne(body);
    res.json(body);
});

export default addActitvityRouter;