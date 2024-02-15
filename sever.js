import dotenv from "dotenv";
import cors from "cors";
import express from "express";
import multer from "multer";
import bcrypt from "bcrypt";
import databaseClient from "./services/database.mjs";
import { checkMissingField } from "./utils/requestUtils.js";
import morgan from "morgan";
import { ObjectId } from "mongodb";
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';   // karn add
import jwt from "jsonwebtoken";
import fs from 'fs'

const HOSTNAME = process.env.SERVER_IP || "127.0.0.1";
const PORT = process.env.SERVER_PORT || 3000;
const SALT = 10;

// setting initial configuration for upload file, web server (express), and cors
// const upload = multer({ dest: "uploads/" });
dotenv.config();
const webServer = express();
webServer.use(cors());
webServer.use(express.json());
webServer.use(morgan('dev'))

//S3 Config // karn add

const accessKey = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const myBucket = process.env.AWS_BUCKET_NAME;
const bucketRegion = process.env.AWS_REGION;

const s3 = new S3Client({
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey: secretAccessKey,
  },
  region: bucketRegion
})

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })


// save key data ที่เราต้องใช้
const CUSTOMER_DATA_KEYS = ["signup_photo", "login_email", "login_password",  "signup_firstname", "signup_lastname", "signup_date", "signup_height", "signup_weight", "signup_gender", "signup_phone"];
const LOGIN_DATA_KEYS = ["login_email", "login_password"];
const ACT_DATA_KEYS = ["activityName","activityDes","activityType","hours","minutes","date","actImage"];
// server routes
webServer.get("/", (req, res) => res.send("This is GreenSculpt management system"));

webServer.post("/login", async (req, res) => {
  let body = req.body; 
  const { login_email, login_password } = body;
  const [isBodyChecked, missingFields] = checkMissingField(
    LOGIN_DATA_KEYS,
    body
  );

  if (!isBodyChecked) {
    res.status(400).send(`MissingFields: ${missingFields}`);
    return;
  }

  const customerInfo = await databaseClient
    .db()
    .collection("customerInfo")
    .findOne({ login_email });

  if (!customerInfo) {
    return res.status(400).send({ error: { message: "Invalid email or password22" } });
  }
  
  // Check password
  const validPassword = bcrypt.compareSync(login_password, customerInfo.login_password);
  if (!validPassword) {
    return res.status(400).send({ error: { message: "Invalid email or password33" } });
  }

  customerInfo.password = ""
  res.send({ token: createJwt(customerInfo)});
});

function createJwt(login_email) {
  const jwtSecretKey = process.env.JWT_SECRET_KEY;
  const token = jwt.sign({id: login_email}, jwtSecretKey, {
    expiresIn: "3h",
  });

  return token;
}

//   webServer.get("/home", async (req, res) => {
//   const customerInfo = await databaseClient
//     .db()
//     .collection("customerInfo")
//     .findMany({userId})
//     .toArray();
//   res.json(customerInfo);
// });

// เป็นการดึงข้อมูลจาก Database
webServer.get("/signup", async (req, res) => {
  const customerInfo = await databaseClient
    .db()
    .collection("customerInfo")
    .find({})
    .toArray();
  res.json(customerInfo);
});

webServer.post("/signup", async (req, res) => {
  const body = req.body;
  const [isBodyChecked, missingFields] = checkMissingField(
    CUSTOMER_DATA_KEYS,
    body
  );

  if (!isBodyChecked) {
    res.send(`Missing Fields: ${"".concat(missingFields)}`);
    return;
  }

   // Check if login_email is duplicate
   const existingUser = await databaseClient
   .db()
   .collection("customerInfo")
   .findOne({ login_email: body.login_email });
   console.log("sdas"+existingUser)
   if (existingUser !== null) {
    res.send("User does exist.");
    exit();
  }

  // const saltRound = await bcrypt.genSalt(SALT);
  const saltRound = await bcrypt.genSalt(SALT);
  body["login_password"] = await bcrypt.hash(body["login_password"], saltRound);

  await databaseClient.db().collection("customerInfo").insertOne(body);
  res.json(body);
});

webServer.get("/add-activity/:_id", async (req, res) => {
  const customerActivities = await databaseClient
    .db()
    .collection("customerActivities")
    .find({ user_id: req.params._id })
    .toArray();
  res.json(customerActivities);
});

webServer.get("/your-activity/:_id", async (req, res) => {
  const responseID = req.params._id
  console.log(responseID)
  const customerActivities = await databaseClient
    .db()
    .collection("customerActivities")
    .findOne({_id :new ObjectId(responseID)})
  res.json(customerActivities);
});

webServer.delete("/your-activity/:_id", async (req, res) => {
  const activityID = req.params._id;
  console.log(activityID);
  try {
    const result = await databaseClient
      .db()
      .collection("customerActivities")
      .deleteOne({ _id: new ObjectId(activityID) });
    if (result.deletedCount === 1) {
      res.status(200).json({ message: "Activity deleted successfully" });
    } else {
      res.status(404).json({ message: "Activity not found" });
    }
  } catch (error) {
    console.error("Error deleting activity:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


// karn add
webServer.delete("/delete-account/:_id", async (req, res) => {
  const personalID = req.params._id;
  // ดึงค่า _id มาจาก url parameter

  try {
      // ลบข้อมูลใน database
      const deletePersonalDetail = await databaseClient
          .db()
          .collection("customerInfo")
          .deleteOne({ _id: new ObjectId(personalID) });
      // ถ้ามีการลบข้อมูลใน database ดังนั้น deletedCount จะเปลี่ยนเป็น = 1 
      if (deletePersonalDetail.deletedCount === 1) {
          //ถ้า deletedCount = 1 แสดงว่า ทำการลบข้อมูลสำเร็จ
          res.status(200).json({ message: "Your personal detail is deleted successfully" });
      } else {
          //deletedCount != 1 แสดงว่า ทำการลบข้อมูลไม่สำเร็จ
          res.status(404).json({ message: "Your personal detail not found" });
      }
  } catch (error) {
      //detected error or having a problem with the server
      console.error("Error deleting your personal detail :", error);
      res.status(500).json({ message: "Internal server error" });
  }
});  

webServer.post("/add-activity", async (req, res) => {
  let body = req.body;
  const [isBodyChecked, missingFields] = checkMissingField(
    ACT_DATA_KEYS,
    body
  );
  if (!isBodyChecked) {
    res.send(`Missing Fields: ${"".concat(missingFields)}`);
    return;
  }
  await databaseClient.db().collection("customerActivities").insertOne(body);
  // res.send("Create Activity Successfully");
  res.json(body);
});

//test upload image // karn add
webServer.post("/api/upload",upload.single('actImage'), async (req, res) => {
  console.log(req.body);
  console.log(req.file);

  req.file.buffer

  const params = {
    Bucket: myBucket,
    Key: req.file.originalname,
    Body: req.file.buffer,
    ContentType: req.file.mimetype,
  }

  const command = new PutObjectCommand(params)
  await s3.send(command)

  res.send(req.file)
});

// webServer.put("/start-activity/:_id", async (req, res) => {
//   const activityID = req.params._id;
//   const updatedActivity = req.body; // ข้อมูลที่ต้องการอัปเดต
//   try {
//     // อัปเดตกิจกรรมของลูกค้าในฐานข้อมูล
//     const result = await databaseClient
//       .db()
//       .collection("customerActivities")
//       .updateOne({ _id: new ObjectId(activityID) }, { $set: updatedActivity });
//     if (result.modifiedCount === 1) {
//       res.status(200).json({ message: "Activity updated successfully" });
//     } else {
//       res.status(404).json({ message: "Activity not found" });
//     }
//   } catch (error) {
//     console.error("Error updating activity:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });


// karn add
webServer.put("/PersonaldetailImage/:_id", async (req, res) => {
  const personalID = req.params._id;                             // รับค่า id จาก url parameter           // ข้อมูลจำนวนชั่วโมงที่มีการเปลี่ยนแปลง
  const updatedImage = req.body.signup_photo;             // ข้อมูลจำนวนนาทีที่มีการเปลี่ยนแปลง

  try {
    // อัปเดตกิจกรรมของลูกค้าในฐานข้อมูล
    const updatedResult = await databaseClient
    .db()
    .collection("customerInfo")
    .updateOne(
        { _id: new ObjectId(personalID) },
        { $set: { signup_photo: updatedImage } }
    );

      // หากสามารถ update ข้อมูลใน database แล้ว modifiedCount จะเท่ากับ 1
      if (updatedResult.modifiedCount === 1) {
          //update สำเร็จ
          res.status(200).json({ message: "User updated successfully" });
      } else {
          //update ไม่สำเร็จ
          res.status(404).json({ message: "User not found" });
      }
  } catch (error) {
      //เมื่อเกิด server error
      console.error("Error updating activity:", error);
      res.status(500).json({ message: "Internal server error" });
  }

});


// karn add
webServer.put("/Personaldetail/:_id", async (req, res) => {
  const userId = req.params._id;                             // รับค่า id จาก url parameter
  const updatedFname = req.body.signup_firstname;            // ข้อมูลจำนวนชั่วโมงที่มีการเปลี่ยนแปลง
  const updatedLname = req.body.signup_lastname;             // ข้อมูลจำนวนนาทีที่มีการเปลี่ยนแปลง

  try {
    // อัปเดตกิจกรรมของลูกค้าในฐานข้อมูล
    const updatedResult = await databaseClient
    .db()
    .collection("customerInfo")
    .updateOne(
        { _id: new ObjectId(userId) },
        { $set: { signup_firstname: updatedFname, signup_lastname: updatedLname } }
    );

      // หากสามารถ update ข้อมูลใน database แล้ว modifiedCount จะเท่ากับ 1
      if (updatedResult.modifiedCount === 1) {
          //update สำเร็จ
          res.status(200).json({ message: "User updated successfully" });
      } else {
          //update ไม่สำเร็จ
          res.status(404).json({ message: "User not found" });
      }
  } catch (error) {
      //เมื่อเกิด server error
      console.error("Error updating activity:", error);
      res.status(500).json({ message: "Internal server error" });
  }

});


// karn add
webServer.put("/start-activity/:_id", async (req, res) => {
  const activityTimerID = req.params._id;                             // รับค่า id จาก url parameter
  const updatedHoursActivity = req.body.hours;                        // ข้อมูลจำนวนชั่วโมงที่มีการเปลี่ยนแปลง
  const updatedMinuteActivity = req.body.minutes;                     // ข้อมูลจำนวนนาทีที่มีการเปลี่ยนแปลง
  const updatedSecondsActivity = req.body.seconds;
  const updatedStatusActivity = req.body.status;

  try {
    // อัปเดตกิจกรรมของลูกค้าในฐานข้อมูล
    const updatedResult = await databaseClient
    .db()
    .collection("customerActivities")
    .updateOne(
        { _id: new ObjectId(activityTimerID) },
        { $set: { hours: updatedHoursActivity, minutes: updatedMinuteActivity, seconds: updatedSecondsActivity, status: updatedStatusActivity } }
    )

      // หากสามารถ update ข้อมูลใน database แล้ว modifiedCount จะเท่ากับ 1
      if (updatedResult.modifiedCount === 1) {
          //update สำเร็จ
          res.status(200).json({ message: "Timer updated successfully" });
      } else {
          //update ไม่สำเร็จ
          res.status(404).json({ message: "Timer not found" });
      }
  } catch (error) {
      //เมื่อเกิด server error
      console.error("Error updating activity:", error);
      res.status(500).json({ message: "Internal server error" });
  }

});

webServer.post("/login", async (req, res) => {
  let body = req.body;
  const [isBodyChecked, missingFields] = checkMissingField(
    LOGIN_DATA_KEYS,
    body
  );

  if (!isBodyChecked) {
    res.send(`Missing Fields: ${"".concat(missingFields)}`);
    return;
  }
  // Check if login_email is duplicate
  const existingUser = await databaseClient
    .db()
    .collection("customerInfo")
    .findOne({ login_email: body.login_email });
  if (existingUser === null) {
    res.send("User does not exist.");
    return;
  }

  const user = await databaseClient
    .db()
    .collection("customerInfo")
    .findOne({ login_email: body.login_email, login_password: body.login_password });
  if (user === null) {
    res.send("Invalid username or password");
    return;
  }
  // hash password
  if (!bcrypt.compareSync(body.password, user.password)) {
    res.send("Invalid username or password na ja");
    return;
  }
  // const returnUser = {
  //   _id: user._id,
  //   name: user.name,
  //   age: user.age,
  //   weight: user.weight,
  // };
  // res.json(returnUser);
});

// initilize web server
// const currentServer = webServer.listen(process.env.PORT || 3000, () => {
const currentServer = webServer.listen(PORT, HOSTNAME, () => {
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
