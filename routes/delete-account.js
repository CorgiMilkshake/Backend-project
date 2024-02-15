import express from "express";
import databaseClient from "../services/database.mjs";
import { ObjectId } from "mongodb";

const deleteAccountRouter = express.Router();                   //เก็บค่าฟังก์ชั่น express router ใน deleteAccountRouter

// delete method สำหรับหน้า DeleteAccount.jsx
deleteAccountRouter.delete("/:_id", async (req, res) => {
    const personalID = req.params._id;                          // ดึงค่า _id มาจาก url parameter
  
    try {
        // ลบข้อมูลใน database
        const deletePersonalDetail = await databaseClient
            .db()
            .collection("customerInfo")
            .deleteOne({ _id: new ObjectId(personalID) });
    
        // ถ้ามีการลบข้อมูลใน database ดังนั้น deletedCount จะเปลี่ยนเป็น = 1 
        if (deletePersonalDetail.deletedCount === 1) {
            //ถ้า deletedCount = 1 แสดงว่า ทำการลบข้อมูลสำเร็จ
            res.status(200).json({ message: "Your personal detail is deleted successfully" });
        } else {
            //deletedCount != 1 แสดงว่า ทำการลบข้อมูลไม่สำเร็จ
            res.status(404).json({ message: "Your personal detail not found" });
        }

    } catch (error) {
        //detected error or having a problem with the server
        console.error("Error deleting your personal detail :", error);
        res.status(500).json({ message: "Internal server error" });
    }
  });  

  export default deleteAccountRouter;