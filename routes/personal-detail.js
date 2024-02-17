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

  personalDetailRouter.put("/:_id", async (req, res) => {
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

  export default personalDetailRouter;