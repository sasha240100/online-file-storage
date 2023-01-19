import request from 'request'
import { File, s3 } from "../db";

import router from './router'

router.get("/preview/:hash", async (req, res) => {
  const file = await File.findOne({ hash: req.params.hash });

  const params = {
    Bucket: process.env.AWS_BUCKET, // bucket you want to upload to
    Key: file.key, // put all image to fileupload folder with name scanskill-${Date.now()}${file.name}`
  };

  const previewUrl = s3.getSignedUrl("getObject", {
    Bucket: params.Bucket,
    Key: params.Key,
    Expires: 60 * 5,
    ResponseContentDisposition: "inline",
    ResponseContentType: file.mimeType,
  });

  // returning fileupload location
  return request({ url: previewUrl }).pipe(res)
});
