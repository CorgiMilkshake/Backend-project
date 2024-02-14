import express from "express";
import { checkMissingField } from "../utils/requestUtils.js";
import databaseClient from "../services/database.mjs";

const getTimerDataRouter = express.Router();    

getTimerDataRouter.get("/:_id", async (req, res) => {
    const responseID = req.params._id                   //รับค่า id จาก url parameter
    
    // ค้นหาข้อมูลจาก database
    const customerActivities = await databaseClient
      .db()
      .collection("customerActivities")
      .findOne({_id :new ObjectId(responseID)})
    res.json(customerActivities);
  });


export default getTimerDataRouter;