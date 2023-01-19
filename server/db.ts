import mongoose from 'mongoose';
import * as AWS from "aws-sdk";

// s3 config
export const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID, // your AWS access id
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, // your AWS access key
});

const fileSchema = new mongoose.Schema(
  {
    name: String,
    url: String,
    hash: String,
    key: String,
    mimeType: String,
  },
  { timestamps: true }
);

export const File = mongoose.model("File", fileSchema);
