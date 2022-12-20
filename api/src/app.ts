import express, { Request, Response } from "express";
import logger from "morgan";
import cookieParser from "cookie-parser";
import userRouter from "./routes/users";
import indexRouter from "./routes/index";
import { db } from "./config/index";
import adminRouter from "./routes/admin";
import vendorRouter from "./routes/vendor";
import dotenv from "dotenv";
import cors from "cors";

// sequelize connection
// {force:true}
db.sync()
  .then(() => {
    console.log("db connected successfully");
  })
  .catch((err) => console.log(err));

dotenv.config();
//{force:true} to erase database
//killall node

const app = express();
app.use(cors());
app.use(express.json());
app.use(logger("dev"));
app.use(cookieParser());

app.use("/users", userRouter);
app.use("/", indexRouter);
app.use("/admins", adminRouter);
app.use("/vendor", vendorRouter);

const port = 4000;
app.listen(port, () => {
  console.log(`server running on port http://localhost:${port}`);
});

export default app;
