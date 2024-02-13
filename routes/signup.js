import express from "express";
import { checkMissingField } from "../utils/requestUtils.js";
import databaseClient from "../services/database.mjs";
import bcrypt from "bcrypt";

const signupRouter = express.Router();
const CUSTOMER_DATA_KEYS = ["signup_photo", "login_email", "login_password",  "signup_firstname", "signup_lastname", "signup_date", "signup_height", "signup_weight", "signup_gender", "signup_phone"];
const SALT = 10;

signupRouter.get("/", async (req, res) => {
    const customerInfo = await databaseClient
      .db()
      .collection("customerInfo")
      .find({})
      .toArray();
    res.json(customerInfo);
  });
  
signupRouter.post("/", async (req, res) => {
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

  export default signupRouter;