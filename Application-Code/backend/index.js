const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

let pipelines = [];

app.get("/", (req, res) => {
  res.send("DevOps Pipeline Backend Running");
});

// Run pipeline
app.post("/run-pipeline", (req, res) => {
  const { name } = req.body;

  const pipeline = {
    id: pipelines.length + 1,
    name,
    stage: "Code",
    status: "running",
    logs: ["Pipeline started..."],
  };

  pipelines.push(pipeline);

  // Simulate pipeline stages
  setTimeout(() => {
    pipeline.stage = "Build";
    pipeline.logs.push("Build started...");
  }, 2000);

  setTimeout(() => {
    pipeline.stage = "Test";
    pipeline.logs.push("Testing application...");
  }, 4000);

  setTimeout(() => {
    pipeline.stage = "Deploy";
    pipeline.logs.push("Deploying to server...");
  }, 6000);

  setTimeout(() => {
    pipeline.status = "success";
    pipeline.logs.push("Deployment successful!");
  }, 8000);

  res.json(pipeline);
});

// Get all pipelines
app.get("/pipelines", (req, res) => {
  res.json(pipelines);
});

// Get logs
app.get("/logs/:id", (req, res) => {
  const pipeline = pipelines.find(p => p.id == req.params.id);
  res.json(pipeline ? pipeline.logs : []);
});

app.listen(3500, () => {
  console.log("Server running on port 3500");
});