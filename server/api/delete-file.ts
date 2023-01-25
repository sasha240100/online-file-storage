import mongoose from 'mongoose';
import { File, s3 } from "../db";

import router from './router'
import {authMiddleware} from './middleware/auth';

router.delete("/file/:id", authMiddleware, async (req, res) => {
  const fileId = new mongoose.Types.ObjectId(req.params.id);

  const file = await File.findOne({ _id: fileId });

  if (!file) {
    res.status(200);
    return
  }

  await File.deleteOne({ _id: fileId });

  const params = {
    Bucket: process.env.AWS_BUCKET, // bucket you want to upload to
    Key: file.key, // put all image to fileupload folder with name scanskill-${Date.now()}${file.name}`
  };

  try {
    // s3.deleteObject(params).promise();
  } catch {
    // ...
  }

  // returning fileupload location
  return res.status(200);
});
