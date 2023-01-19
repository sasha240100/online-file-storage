import express from "express";
import mongoose from "mongoose";
import upload from "express-fileupload";
import * as AWS from "aws-sdk";
require("dotenv").config();

import apiRouter from './api'

mongoose.set("strictQuery", false);

const app = express();
const PORT = process.env.PORT || 4040;

// using upload middleware
app.use(upload());
app.use(express.json());

app.use('/api', apiRouter);

// starts the express server in the designated port
app.listen(PORT, main);

async function main() {
  console.log(`server started at PORT: ${PORT}`);

  await mongoose.connect(process.env.DB_URI);
}
