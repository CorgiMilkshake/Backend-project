import express from "express";
import { checkMissingField } from "../utils/requestUtils.js";
import jwt from "jsonwebtoken";
import databaseClient from "../services/database.mjs";
import bcrypt from "bcrypt";

const loginRouter = express.Router();
const LOGIN_DATA_KEYS = ["login_email", "login_password"];

function createJwt(login_email) {
    const jwtSecretKey = process.env.JWT_SECRET_KEY;
    const token = jwt.sign({id: login_email}, jwtSecretKey, {
      expiresIn: "3h",
    });
  
    return token;
  }

loginRouter.post("/", async (req, res) => {
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

loginRouter.post("/", async (req, res) => {
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

  export default loginRouter;