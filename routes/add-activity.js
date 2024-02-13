import express from "express";
import { checkMissingField } from "../utils/requestUtils.js";
import databaseClient from "../services/database.mjs";

//import fs from fs;

const addActitvityRouter = express.Router();
const ACT_DATA_KEYS = ["activityName","activityDes","activityType","hours","minutes","date","actImage"];

// fs.readFile('database.mjs', function(err, data) {
//     if (err) {
//         res.writeHead(500, {'Content-Type': 'text/plain'});
//         res.write('Error reading the file');
//         return res.end();
//     }

//     res.writeHead(200, {'Content-Type': 'application/javascript'});
//     res.write(data);
//     return res.end();
// });

addActitvityRouter.get("/:_id", async (req, res) => {
    const customerActivities = await databaseClient
      .db()
      .collection("customerActivities")
      .find({ user_id: req.params._id })
      .toArray();
    res.json(customerActivities);
  });

addActitvityRouter.post("/", async (req, res) => {
    let body = req.body;
    const [isBodyChecked, missingFields] = checkMissingField(
        ACT_DATA_KEYS,
        body
    );
    if (!isBodyChecked) {
        res.send(`Missing Fields: ${"".concat(missingFields)}`);
        return;
    }
    await databaseClient.db().collection("customerActivities").insertOne(body);
    // res.send("Create Activity Successfully");
    res.json(body);
});

export default addActitvityRouter;