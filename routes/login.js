import express from "express";
import { checkMissingField } from "../utils/requestUtils.js";
import jwt from "jsonwebtoken";
import databaseClient from "../services/database.mjs";
import bcrypt from "bcrypt";

const loginRouter = express.Router();                           //เก็บค่าฟังก์ชั่น express router ใน loginRouter
const LOGIN_DATA_KEYS = ["login_email", "login_password"];      //data array key ของ login

// สร้าง token function โดยการใช้ JWT
function createJwt(login_email) {
    const jwtSecretKey = process.env.JWT_SECRET_KEY;            //เก็บค่า JWT secret key ในตัวแปร jwtSecretKey
    const token = jwt.sign({id: login_email}, jwtSecretKey, {
      expiresIn: "3h",
    });                                                         //กำหนดระยะเวลาของ token
  
    return token;
  }

// การรับข้อมูลจากหน้า login
loginRouter.post("/", async (req, res) => {
    let body = req.body;                                        //รับค่าที่ส่งมาจาก client
    const { login_email, login_password } = body;               //ตัวแปรเก็บค่า login_email และ login_password
    
    // ตรวจสอบว่ามีข้อมูลครบทุก fields หรือไม่
    const [isBodyChecked, missingFields] = checkMissingField(
      LOGIN_DATA_KEYS,
      body
    );

    // ถ้าหากว่ามีข้อมูลที่ไม่ได้กรอก กำหนดให้มี error message เพื่อเตือนให้กรอกให้ครบทุก fields
    if (!isBodyChecked) {
      res.status(400).send(`MissingFields: ${missingFields}`);
      return;
    }
  
    // ทำการค้นหาข้อมูล user ใน database
    const customerInfo = await databaseClient
        .db()
        .collection("customerInfo")
        .findOne({ login_email });

    // หากว่าค้นหาไม่เจอ จะมี error message
    if (!customerInfo) {
      return res.status(400).send({ error: { message: "Invalid email or password22" } });
    }
    
    // Check password แล้วเปลี่ยนให้เป็น bcrypt
    const validPassword = bcrypt.compareSync(login_password, customerInfo.login_password);

    //หากว่า password ไม่ถูกต้อง  จะมี error message 
    if (!validPassword) {
      return res.status(400).send({ error: { message: "Invalid email or password33" } });
    }
  
    customerInfo.login_password = "";                               //ไม่ให้ show password
    res.send({ token: createJwt(customerInfo)});                    //ส่งออกค่าข้อมูลผ่าน token
  });

  export default loginRouter;