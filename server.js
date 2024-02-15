import dotenv from "dotenv";
import cors from "cors";
import express from "express";
import multer from "multer";
import bcrypt from "bcrypt";
import databaseClient from "./services/database.mjs";
import { checkMissingField } from "./utils/requestUtils.js";
import morgan from "morgan";
import { ObjectId } from "mongodb";
import jwt from "jsonwebtoken";
//connect the routes
import addActitvityRouter from "./routes/add-activity.js"
import loginRouter from "./routes/login.js";
import signupRouter from "./routes/signup.js"
import yourActRouter from "./routes/your-activity.js"
import personalDetailRouter  from "./routes/personal-detail.js"
import deleteAccountRouter from "./routes/delete-account.js"
import getTimerDataRouter from "./routes/start-activity.js"

const HOSTNAME = process.env.SERVER_IP || "127.0.0.1";
const PORT = process.env.SERVER_PORT || 3000;
// const SALT = 10;

// setting initial configuration for upload file, web server (express), and cors
const upload = multer({ dest: "uploads/" });
dotenv.config();
const webServer = express();
webServer.use(cors());
webServer.use(express.json());
webServer.use(morgan('dev'))

//called routers
webServer.use("/add-activity", addActitvityRouter);
webServer.use("/login", loginRouter);
webServer.use("/signup", signupRouter);
webServer.use("/your-activity", yourActRouter);
webServer.use("/Personaldetail", personalDetailRouter);
webServer.use("/DeleteAccount", deleteAccountRouter);
webServer.use("/start-activity", getTimerDataRouter);


// server routes test
webServer.get("/", (req, res) => res.send("This is user management system"));

// webServer.put("/start-activity/:_id", async (req, res) => {
//   const activityTimerID = req.params._id;                             // รับค่า id จาก url parameter
//   const updatedHoursActivity = req.body.hours;                        // ข้อมูลจำนวนชั่วโมงที่มีการเปลี่ยนแปลง
//   const updatedMinuteActivity = req.body.minutes;                     // ข้อมูลจำนวนนาทีที่มีการเปลี่ยนแปลง
//   const updatedSecondsActivity = req.body.seconds;
//   const updatedStatusActivity = req.body.status;

//   try {
//     // อัปเดตกิจกรรมของลูกค้าในฐานข้อมูล
//     const updatedResult = await databaseClient
//     .db()
//     .collection("customerActivities")
//     .updateOne(
//         { _id: new ObjectId(activityTimerID) },
//         { $set: { hours: updatedHoursActivity, minutes: updatedMinuteActivity, seconds: updatedSecondsActivity, status: updatedStatusActivity } }
//     )

//       // หากสามารถ update ข้อมูลใน database แล้ว modifiedCount จะเท่ากับ 1
//       if (updatedResult.modifiedCount === 1) {
//           //update สำเร็จ
//           res.status(200).json({ message: "Timer updated successfully" });
//       } else {
//           //update ไม่สำเร็จ
//           res.status(404).json({ message: "Timer not found" });
//       }
//   } catch (error) {
//       //เมื่อเกิด server error
//       console.error("Error updating activity:", error);
//       res.status(500).json({ message: "Internal server error" });
//   }

// });


// initilize web server
const currentServer = webServer.listen(process.env.PORT || 3000, () => {
// const currentServer = webServer.listen(PORT, HOSTNAME, () => {
  console.log(
    `DATABASE IS CONNECTED: NAME => ${databaseClient.db().databaseName}`
  );
  console.log(`SERVER IS ONLINE => ${HOSTNAME, PORT}`);
});

const cleanup = () => {
  currentServer.close(() => {
    console.log(
      `DISCONNECT DATABASE: NAME => ${databaseClient.db().databaseName}`
    );
    try {
      databaseClient.close();
    } catch (error) {
      console.error(error);
    }
  });
};

// cleanup connection such as database
process.on("SIGTERM", cleanup);
process.on("SIGINT", cleanup);
