import express from "express";
import { ObjectId } from "mongodb";
import databaseClient from "../services/database.mjs";

const yourActRouter = express.Router();

yourActRouter.get("/:_id", async (req, res) => {
    const responseID = req.params._id
    console.log(responseID)
    const customerActivities = await databaseClient
      .db()
      .collection("customerActivities")
      .findOne({_id :new ObjectId(responseID)})
    res.json(customerActivities);
  });
  
yourActRouter.delete("/:_id", async (req, res) => {
    const activityID = req.params._id;
    console.log(activityID);
    try {
      const result = await databaseClient
        .db()
        .collection("customerActivities")
        .deleteOne({ _id: new ObjectId(activityID) });
      if (result.deletedCount === 1) {
        res.status(200).json({ message: "Activity deleted successfully" });
      } else {
        res.status(404).json({ message: "Activity not found" });
      }
    } catch (error) {
      console.error("Error deleting activity:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

yourActRouter.get("/:_id", async (req, res) => {
    const responseID = req.params._id
    console.log(responseID)
    const customerActivities = await databaseClient
      .db()
      .collection("customerActivities")
      .findOne({_id :new ObjectId(responseID)})
    res.json(customerActivities);
  });
  
yourActRouter.delete("/:_id", async (req, res) => {
    const activityID = req.params._id;
    console.log(activityID);
    try {
      const result = await databaseClient
        .db()
        .collection("customerActivities")
        .deleteOne({ _id: new ObjectId(activityID) });
      if (result.deletedCount === 1) {
        res.status(200).json({ message: "Activity deleted successfully" });
      } else {
        res.status(404).json({ message: "Activity not found" });
      }
    } catch (error) {
      console.error("Error deleting activity:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
yourActRouter.put("/:_id", async (req, res) => {
    const activityID = req.params._id;
    const updatedActivity = req.body; // ข้อมูลที่ต้องการอัปเดต
    try {
      // อัปเดตกิจกรรมของลูกค้าในฐานข้อมูล
      const result = await databaseClient
        .db()
        .collection("customerActivities")
        .updateOne({ _id: new ObjectId(activityID) }, { $set: updatedActivity });
      if (result.modifiedCount === 1) {
        res.status(200).json({ message: "Activity updated successfully" });
      } else {
        res.status(404).json({ message: "Activity not found" });
      }
    } catch (error) {
      console.error("Error updating activity:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  export default yourActRouter;