import express from "express";
import { ObjectId } from "mongodb";
import databaseClient from "../services/database.mjs";

const personalImageRouter = express.Router();                                                                //เก็บค่าฟังก์ชั่น express router ใน personalImageRouter

personalImageRouter.put("/:_id", async (req, res) => {
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

  export default personalImageRouter;