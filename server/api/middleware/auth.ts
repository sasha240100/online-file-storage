import * as util from "util";
import jwt from "jsonwebtoken";
import {User} from '../../db';
import {TOKEN_SECRET} from '../constants';

const verifyToken = util.promisify(jwt.verify);

export async function authMiddleware(req, res, next) {
  const authToken = req.headers["authorization"];

  if (authToken) {
    const decoded = await verifyToken(authToken, TOKEN_SECRET);
    const user = await User.findOne({ username: decoded.username });

    req.user = user;

    next();
  } else {
    res.send(403);
  }
}
