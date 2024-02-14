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

//multer storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})
const upload = multer({ storage })




// save key data ที่เราต้องใช้
const CUSTOMER_DATA_KEYS = ["signup_photo", "login_email", "login_password",  "signup_firstname", "signup_lastname", "signup_date", "signup_height", "signup_weight", "signup_gender", "signup_phone"];
const LOGIN_DATA_KEYS = ["login_email", "login_password"];
const ACT_DATA_KEYS = ["activityName","activityDes","activityType","hours","minutes","date","actImage"];
// server routes
webServer.get("/", (req, res) => res.send("This is user management system"));

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

//test delete img
webServer.delete("/api/delete-image", (req, res) => {
  const { imagePath } = req.body;

  try {
    fs.unlinkSync(imagePath);
    res.status(200).json({ message: "Image deleted successfully" });
  } catch (error) {
    console.error("Error deleting image:", error);
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

//test upload image
webServer.post("/api/upload",upload.single('actImage'), (req, res) => {
  res.json(req.file);
});

webServer.put("/your-activity/:_id", async (req, res) => {
  const activityID = req.params._id;
  const updatedActivity = req.body; // ข้อมูลที่ต้องการอัปเดต
  try {
    // อัปเดตกิจกรรมของลูกค้าในฐานข้อมูล
    const result = await databaseClient
      .db()
      .collection("customerActivities")
      .updateOne({ _id: new ObjectId(activityID) }, { $set: updatedActivity });
    if (result.modifiedCount === 1) {
      res.status(200).json({ message: "Activity updated successfully" });
    } else {
      res.status(404).json({ message: "Activity not found" });
    }
  } catch (error) {
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
