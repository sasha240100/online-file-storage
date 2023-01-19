import mongoose from 'mongoose';
import { File, s3 } from "../db";

import router from './router'

router.delete("/file/:id", async (req, res) => {
  const fileId = new mongoose.Types.ObjectId(req.params.id);

  const file = await File.findOne({ _id: fileId });

  if (!file) return

  await File.deleteOne({ _id: fileId });

  const params = {
    Bucket: process.env.AWS_BUCKET, // bucket you want to upload to
    Key: file.key, // put all image to fileupload folder with name scanskill-${Date.now()}${file.name}`
  };

  try {
    await s3.deleteObject(params).promise();
  } catch {}

  // returning fileupload location
  return res.status(200);
});
