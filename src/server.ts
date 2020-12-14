import "reflect-metadata";
import express from "express";
import morgan from "morgan";
import { createConnection } from "typeorm";

import authRoutes from "./routes/auth";

const app = express();

app.use(express.json());
app.use(morgan("dev"));

app.get("/", (_, res) => res.send("Hellowww"));
app.use("/api/auth", authRoutes);

app.listen(5000, async () => {
  console.log("Server running at http://localhost:5000");

  try {
    await createConnection();
    console.log("Database connected");
  } catch (err) {
    console.log(err);
  }
});
