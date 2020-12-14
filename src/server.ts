import "reflect-metadata";
import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import { createConnection } from "typeorm";

import authRoutes from "./routes/auth";
import postRoutes from "./routes/post";
import trim from "./middlewares/trim";

dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use(morgan("dev"));
app.use(trim);
app.use(cookieParser());

app.get("/", (_, res) => res.send("Hellowww"));
app.use("/api/auth", authRoutes);
app.use("/api/post", postRoutes);

app.listen(PORT, async () => {
  console.log(`Server running at http://localhost:${PORT}`);

  try {
    await createConnection();
    console.log("Database connected");
  } catch (err) {
    console.log(err);
  }
});
