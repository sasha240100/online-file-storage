import { File, s3 } from "../db";
import { v4 as uuidv4 } from "uuid";

import router from "./router";
import {authMiddleware} from './middleware/auth';

// actual function for uploading file
async function uploadFile(file) {
  const params = {
    Bucket: process.env.AWS_BUCKET, // bucket you want to upload to
    Key: `${Date.now()}-${file.name}`, // put all image to fileupload folder with name scanskill-${Date.now()}${file.name}`
    Body: file.data,
    ACL: "public-read",
  };
  const data = await s3.upload(params).promise();

  return {
    params,
    ...data
  }; // returns the url location
}

router.post("/upload", authMiddleware, async (req, res) => {
  if (!req.files) return null

  const userId = req.user?._id;

  const fileData = req.files.file;
  // the file when inserted from form-data comes in req.files.file
  const {
    params,
    Location: location,
  } = await uploadFile(fileData);

  const file = new File({
    name: fileData.name,
    key: params.Key,
    url: location,
    hash: uuidv4().split("-")[0],
    mimeType: fileData.mimetype,
    userId,
  });

  await file.save();

  // returning fileupload location
  return res.status(200).json({ location });
});
