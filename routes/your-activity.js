import express from "express";
import { ObjectId } from "mongodb";
import databaseClient from "../services/database.mjs";

const yourActRouter = express.Router();

// รับข้อมูล activity จาก database
yourActRouter.get("/:_id", async (req, res) => {
    const responseID = req.params._id                   //รับค่า id จาก url parameter
    
    // ค้นหาข้อมูลจาก database
    const customerActivities = await databaseClient
      .db()
      .collection("customerActivities")
      .findOne({_id :new ObjectId(responseID)})
    res.json(customerActivities);
  });
  
// ลบข้อมูลใน database
yourActRouter.delete("/:_id", async (req, res) => {
    const activityID = req.params._id;                  //รับค่า id จาก url parameter

    try {
    //ทำการลบข้อมูลใน database
      const result = await databaseClient
        .db()
        .collection("customerActivities")
        .deleteOne({ _id: new ObjectId(activityID) });

    // หากสามารถลบข้อมูลใน database แล้ว deletedCount จะเท่ากับ 1
      if (result.deletedCount === 1) {
        // ลบข้อมูลสำเร็จ
        res.status(200).json({ message: "Activity deleted successfully" });
      } else {
        //ลบข้อมูลไม่สำเร็จ
        res.status(404).json({ message: "Activity not found" });
      }
    } catch (error) {
        //เมื่อเกิด server error
        console.error("Error deleting activity:", error);
        res.status(500).json({ message: "Internal server error" });
    }
  });
  
// update ข้อมูลใน database
yourActRouter.put("/:_id", async (req, res) => {
    const activityID = req.params._id;                    //รับค่า id จาก url parameter
    const updatedActivity = req.body;                     // ข้อมูลที่ต้องการอัปเดต
    try {
      // อัปเดตกิจกรรมของลูกค้าในฐานข้อมูล
      const result = await databaseClient
        .db()
        .collection("customerActivities")
        .updateOne({ _id: new ObjectId(activityID) }, { $set: updatedActivity });

        // หากสามารถ update ข้อมูลใน database แล้ว modifiedCount จะเท่ากับ 1
        if (result.modifiedCount === 1) {
            //update สำเร็จ
            res.status(200).json({ message: "Activity updated successfully" });
        } else {
            //update ไม่สำเร็จ
            res.status(404).json({ message: "Activity not found" });
        }
    } catch (error) {
        //เมื่อเกิด server error
        console.error("Error updating activity:", error);
        res.status(500).json({ message: "Internal server error" });
    }
  });

  export default yourActRouter;