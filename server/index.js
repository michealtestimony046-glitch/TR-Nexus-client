import express from "express";
import authRoutes from "./routes/auth.js";

const app = express();
const PORT = 3001;

app.use(express.json());

app.use("/api/auth", authRoutes);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`[T/R API] Running on port ${PORT}`);
});
