import express from "express";
import databaseClient from "../services/database.mjs";
import { ObjectId } from "mongodb";

//import fs from fs;

const deleteAccountRouter = express.Router();

deleteAccountRouter.delete("/:_id", async (req, res) => {
    const personalID = req.params._id;
    // const deletePersonalID = req.body; 
  
    try {
      const deletePersonalDetail = await databaseClient
        .db()
        .collection("customerInfo")
        .deleteOne({ _id: new ObjectId(personalID) });
  
      if (deletePersonalDetail.deletedCount === 1) {
        res.status(200).json({ message: "Your personal detail is deleted successfully" });
      } else {
        res.status(404).json({ message: "Your personal detail not found" });
      }
    } catch (error) {
      console.error("Error deleting your personal detail :", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });  

  export default deleteAccountRouter;