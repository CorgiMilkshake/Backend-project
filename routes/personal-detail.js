import express from "express";
import databaseClient from "../services/database.mjs";
import { ObjectId } from "mongodb";

//import fs from fs;

const personalDetailRouter = express.Router();

personalDetailRouter.put("/:_id", async (req, res) => {
    const personalID = req.params._id;  //looking for the specific user
    const updatedPersonalID = req.body; // ข้อมูลที่ต้องการอัปเดต
  
    try {
      const result = await databaseClient
        .db()
        .collection("customerInfo")
        .updateOne({ _id: new ObjectId(personalID) }, { $set: updatedPersonalID });
  
      if (result.modifiedCount === 1) {
        res.status(200).json({ message: "Your personal detail is updated successfully" });
      } else {
        res.status(404).json({ message: "Your personal detail not found" });
      }
    } catch (error) {
      console.error("Error updating your personal detail :", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  export default personalDetailRouter;