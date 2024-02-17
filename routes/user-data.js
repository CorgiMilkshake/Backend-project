import express from "express";
import databaseClient from "../services/database.mjs";

const userDataRouter = express.Router();  //เก็บค่าฟังก์ชั่น express router ใน userDataRouter

// รับค่าจาก database
userDataRouter.get("/:_id", async (req, res) => {
    //กำหนดตัวแปรในการรับค่าจาก database
    const customerInfo = await databaseClient
      .db()
      .collection("customerInfo")
      .find({ _id :new ObjectId(req.params._id) }, { projection: { login_password: 0 } })
      .toArray();
    res.json(customerInfo);                               //ส่งค่าข้อมูลในรูปแบบของ JSON
});

export default userDataRouter;