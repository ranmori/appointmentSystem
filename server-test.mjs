import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json({ limit: "10mb" }));

const PORT = process.env.PORT || 3022;

// Test a simple route
app.get("/test", (req, res) => {
  res.json({ message: "Test works" });
});

app.listen(PORT, () => {
  console.log(`Test server listening on ${PORT}`);
});