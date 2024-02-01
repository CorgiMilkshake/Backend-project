import dotenv from "dotenv";
import cors from "cors";
import express from "express";
import multer from "multer";
import bcrypt from "bcrypt";
import databaseClient from "./services/database.mjs";
import { checkMissingField } from "./utils/requestUtils.js";
import morgan from "morgan";

const HOSTNAME = process.env.SERVER_IP || "127.0.0.1";
const PORT = process.env.SERVER_PORT || 3000;
const SALT = 10;



// setting initial configuration for upload file, web server (express), and cors
const upload = multer({ dest: "uploads/" });
dotenv.config();
const webServer = express();
webServer.use(cors());
webServer.use(express.json());
webServer.use(morgan('dev'))

// save key data ที่เราต้องใช้
const CUSTOMER_DATA_KEYS = ["signup_photo", "login_email", "login_password",  "signup_firstname", "signup_lastname", "signup_date", "signup_height", "signup_weight", "signup_gender", "signup_phone"];
const LOGIN_DATA_KEYS = ["login_email", "login_password"];
const ACT_DATA_KEYS = ["activityName","activityDes","activityType","hours","minutes","date","actImage"];
// server routes
webServer.get("/", (req, res) => res.send("This is user management system"));

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
  let body = req.body;
  const [isBodyChecked, missingFields] = checkMissingField(
    CUSTOMER_DATA_KEYS,
    body
  );
  if (!isBodyChecked) {
    res.send(`Missing Fields: ${"".concat(missingFields)}`);
    return;
  }
  const saltRound = await bcrypt.genSalt(SALT);
  body["login_password"] = await bcrypt.hash(body["login_password"], saltRound);

  await databaseClient.db().collection("customerInfo").insertOne(body);
  res.send("Create User Successfully");
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
  res.send("Create Activity Successfully");
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
const currentServer = webServer.listen(PORT, HOSTNAME, () => {
  console.log(
    `DATABASE IS CONNECTED: NAME => ${databaseClient.db().databaseName}`
  );
  console.log(`SERVER IS ONLINE => http://${HOSTNAME}:${PORT}`);
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
