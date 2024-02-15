import express from "express";
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const uploadImageRouter = express.Router();                                                                //เก็บค่าฟังก์ชั่น express router ใน uploadImageRouter

//S3 Config
const accessKey = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const myBucket = process.env.AWS_BUCKET_NAME;
const bucketRegion = process.env.AWS_REGION;

const s3 = new S3Client({
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey: secretAccessKey,
  },
  region: bucketRegion
})

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

//test upload image
uploadImageRouter.post("/",upload.single('actImage'), async (req, res) => {
    console.log(req.body);
    console.log(req.file);
  
    req.file.buffer
  
    const params = {
      Bucket: myBucket,
      Key: req.file.originalname,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    }
  
    const command = new PutObjectCommand(params)
    await s3.send(command)
  
    res.send(req.file)
  });

export default addActitvityRouter;