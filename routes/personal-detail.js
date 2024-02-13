import express from "express";
import databaseClient from "../services/database.mjs";
import { ObjectId } from "mongodb";

const personalDetailRouter = express.Router();                  //เก็บค่าฟังก์ชั่น express router ใน personalDetailRouter

//แก้ไขข้อมูล personal detail
personalDetailRouter.put("/:_id", async (req, res) => {
    const personalID = req.params._id;                          //looking for the specific user
    const updatedPersonalID = req.body;                         // ข้อมูลที่ต้องการอัปเดต
  
    try {
      //update ข้อมูล ใน database
      const result = await databaseClient
        .db()
        .collection("customerInfo")
        .updateOne({ _id: new ObjectId(personalID) }, { $set: updatedPersonalID });
  
      // ถ้าหากว่ามีกร update ข้อมูล modifiedCount จะเท่ากัน 1
      if (result.modifiedCount === 1) {
        // เมื่อทำการ update ข้อมูลสำเร็จ
        res.status(200).json({ message: "Your personal detail is updated successfully" });
      } else {
        // เมื่อทำการ update ข้อมูลไม่สำเร็จ
        res.status(404).json({ message: "Your personal detail not found" });
      }
    } catch (error) {
      // หากเกิด server error 
      console.error("Error updating your personal detail :", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  export default personalDetailRouter;