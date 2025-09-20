const express = require("express");
const path = require("path");
const api = require("./api");

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// API routes
app.use("/api/state", api);

// Serve the main editor page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(
    `Initial State Configuration Editor running on http://localhost:${PORT}`
  );
  console.log(`API available at http://localhost:${PORT}/api/state`);
});
