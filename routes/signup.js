import express from "express";
import { checkMissingField } from "../utils/requestUtils.js";
import databaseClient from "../services/database.mjs";
import bcrypt from "bcrypt";

const signupRouter = express.Router();                                    //เก็บค่าฟังก์ชั่น express router ใน loginRouter
const CUSTOMER_DATA_KEYS = ["signup_photo", "login_email", "login_password",  "signup_firstname", "signup_lastname", "signup_date", "signup_height", "signup_weight", "signup_gender", "signup_phone"];       //data array key ของ customer data
const SALT = 10;

// รับข้อมูลจาก database เพื่อส่งต่อไปยัง frontend
signupRouter.get("/", async (req, res) => {
    const customerInfo = await databaseClient
      .db()
      .collection("customerInfo")
      .find({})
      .toArray();
    res.json(customerInfo);
  });
  
// เพิ่มข้อมูล user data ลงใน database 
signupRouter.post("/", async (req, res) => {
    const body = req.body;                                      // กำหนดตัวแปรับค่า จาก client
    const emailLogin = body.login_email;

    // ตรวจสอบ field ที่ต้องทำการกรอกให้ครบถ้วน
    const [isBodyChecked, missingFields] = checkMissingField(
      CUSTOMER_DATA_KEYS,
      body
    );

    //  หากกรอกไม่ครบถ้วน ส่งค่า back ไปยัง client พร้อมตัวแปร errorMessage
    if (!isBodyChecked) {
      res.send(`Missing Fields: ${"".concat(missingFields)}`);
      return;
    }
  
     // Check if login_email is duplicate
     const existingUser = await databaseClient
      .db()
      .collection("customerInfo")
      .findOne({ emailLogin });

      if (!existingUser) {
        res.send("This email has been used.");
        return;
      }
    
    // เข้ารหัส password โดยใช้ bcrypt
    const saltRound = await bcrypt.genSalt(SALT);
    body["login_password"] = await bcrypt.hash(body["login_password"], saltRound);
  
    // เพิ่มข้อมูลลงใน database
    await databaseClient.db().collection("customerInfo").insertOne(body);
    res.json(body);
  });

  export default signupRouter;