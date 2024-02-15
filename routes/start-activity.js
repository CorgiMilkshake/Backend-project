import express from "express";
import { checkMissingField } from "../utils/requestUtils.js";
import databaseClient from "../services/database.mjs";

const getTimerDataRouter = express.Router();    

getTimerDataRouter.get("/:_id", async (req, res) => {
    const responseID = req.params._id                                   //รับค่า id จาก url parameter
    
    // ค้นหาข้อมูลจาก database
    const customerActivities = await databaseClient
      .db()
      .collection("customerActivities")
      .findOne({_id :new ObjectId(responseID)})
    res.json(customerActivities);
  });

  //update the Timer data
  getTimerDataRouter.put("/:_id", async (req, res) => {
    const activityTimerID = req.params._id;                             // รับค่า id จาก url parameter
    const updatedHoursActivity = req.body.hours;                        // ข้อมูลจำนวนชั่วโมงที่มีการเปลี่ยนแปลง
    const updatedMinuteActivity = req.body.minutes;                     // ข้อมูลจำนวนนาทีที่มีการเปลี่ยนแปลง
    const updatedSecondsActivity = req.body.seconds;

    try {
      // อัปเดตกิจกรรมของลูกค้าในฐานข้อมูล
      const updatedResult = await databaseClient
      .db()
      .collection("customerActivities")
      .updateOne(
          { _id: new ObjectId(activityTimerID) },
          { $set: { hours: updatedHoursActivity, minutes: updatedMinuteActivity, seconds: updatedSecondsActivity } }
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



export default getTimerDataRouter;