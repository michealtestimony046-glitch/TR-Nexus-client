import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.js";
import projectRoutes from "./routes/projects.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const isProd = process.env.NODE_ENV === "production";
const PORT = process.env.PORT || (isProd ? 5000 : 3001);

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);

if (isProd) {
  const DIST = path.join(__dirname, "../dist");
  app.use(express.static(DIST));
  app.use((_req, res) => {
    res.sendFile(path.join(DIST, "index.html"));
  });
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`[T/R] Server running on port ${PORT} (${isProd ? "production" : "development"})`);
});
