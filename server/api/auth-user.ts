import jwt from 'jsonwebtoken';
import { User } from "../db";

import router from "./router";
import {TOKEN_SECRET} from './constants';

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username, password });

  if (!user) {
    return res.status(403).send("Not authorized");
  }

  const token = jwt.sign({ username }, TOKEN_SECRET);

  // returning fileupload location
  return res.status(200).json({token, username});
});
