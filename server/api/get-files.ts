import {File} from '../db'

import router from './router'

import {authMiddleware} from './middleware/auth'

router.get("/files", authMiddleware, async (req, res) => {
  const userId = req.user?._id;

  const files = await File.find({
    userId,
  });

  // returning fileupload location
  return res.status(200).json(files);
});
