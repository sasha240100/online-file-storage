import {File} from '../db'

import router from './router'

router.get("/files", async (req, res) => {
  const files = await File.find({});

  // returning fileupload location
  return res.status(200).json(files);
});
