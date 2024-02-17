import express from "express";
import { ObjectId } from "mongodb";
import databaseClient from "../services/database.mjs";

const userDataRouter = express.Router();  //เก็บค่าฟังก์ชั่น express router ใน userDataRouter

// รับค่าจาก database
userDataRouter.get("/:_id", async (req, res) => {
    //กำหนดตัวแปรในการรับค่าจาก database
    const customerInfo = await databaseClient
      .db()
      .collection("customerInfo")
      .findOne({ _id :new ObjectId(req.params._id) }, { projection: { login_password: 0 } })
    res.json(customerInfo);                               //ส่งค่าข้อมูลในรูปแบบของ JSON
});

export default userDataRouter;