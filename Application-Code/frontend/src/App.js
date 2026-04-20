import React, { useState, useEffect, useRef } from "react";

const STAGES = ["Code", "Build", "Test", "Deploy"];

const initialPipelines = [
  { id: 1, name: "Frontend Build", branch: "main", status: "success", duration: "2m 34s", time: "10 mins ago", currentStage: 4, commit: "a3f8c12", author: "Rishav" },
  { id: 2, name: "Backend API", branch: "feature/auth", status: "failed", duration: "1m 12s", time: "25 mins ago", currentStage: 2, commit: "b7d2e91", author: "Rishav" },
  { id: 3, name: "Database Migration", branch: "main", status: "success", duration: "0m 45s", time: "1 hour ago", currentStage: 4, commit: "c9a1f44", author: "Rishav" },
  { id: 4, name: "Infrastructure TF", branch: "main", status: "success", duration: "5m 10s", time: "2 hours ago", currentStage: 4, commit: "d2b5e78", author: "Rishav" },
];

const LOG_TEMPLATES = {
  running: [
    "[INFO]  Cloning repository from GitHub...",
    "[INFO]  Branch: main | Commit: {commit}",
    "[INFO]  Installing dependencies...",
    "[INFO]  Running npm install...",
    "[SUCCESS] Dependencies installed successfully",
    "[INFO]  Running SonarQube code analysis...",
    "[INFO]  Building Docker image...",
    "[INFO]  Pushing image to AWS ECR...",
    "[INFO]  Deploying to Kubernetes cluster...",
    "[INFO]  Waiting for pods to be ready...",
  ],
  success: [
    "[SUCCESS] All pods running successfully",
    "[SUCCESS] Health check passed",
    "[SUCCESS] Pipeline completed in {duration}",
    "[SUCCESS] Deployment live on AWS EKS",
  ],
  failed: [
    "[ERROR]  Test suite failed — 2 tests failed",
    "[ERROR]  Build aborted",
    "[ERROR]  Pipeline failed at Test stage",
  ],
};

function generateLogs(pipeline) {
  const logs = [...LOG_TEMPLATES.running];
  if (pipeline.status === "success") return [...logs, ...LOG_TEMPLATES.success].map(l => l.replace("{commit}", pipeline.commit).replace("{duration}", pipeline.duration));
  if (pipeline.status === "failed") return [...logs.slice(0, 5), ...LOG_TEMPLATES.failed];
  return logs.slice(0, 5);
}

function StageBar({ currentStage, status }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "10px" }}>
      {STAGES.map((stage, i) => {
        let bg = "#21262d", color = "#8b949e";
        if (status === "success" && i < 4) { bg = "#238636"; color = "#fff"; }
        if (status === "failed") {
          if (i < currentStage - 1) { bg = "#238636"; color = "#fff"; }
          else if (i === currentStage - 1) { bg = "#b91c1c"; color = "#fff"; }
        }
        if (status === "running" && i < currentStage) { bg = "#238636"; color = "#fff"; }
        if (status === "running" && i === currentStage) { bg = "#d97706"; color = "#fff"; }
        return (
          <React.Fragment key={i}>
            <div style={{ background: bg, color, padding: "4px 10px", borderRadius: "4px", fontSize: "11px", fontWeight: "600", transition: "all 0.5s", minWidth: "52px", textAlign: "center" }}>
              {status === "running" && i === currentStage ? "● " + stage : stage}
            </div>
            {i < STAGES.length - 1 && <div style={{ width: "24px", height: "2px", background: (status === "success" || (i < currentStage - 1)) ? "#238636" : "#21262d", transition: "all 0.5s" }} />}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function MetricCard({ label, value, unit, color, data }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    data.forEach((v, i) => {
      const x = (i / (data.length - 1)) * canvas.width;
      const y = canvas.height - (v / 100) * canvas.height;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.lineTo(canvas.width, canvas.height);
    ctx.lineTo(0, canvas.height);
    ctx.closePath();
    ctx.fillStyle = color + "22";
    ctx.fill();
  }, [data, color]);

  return (
    <div style={{ background: "#161b22", border: "1px solid #21262d", borderRadius: "8px", padding: "14px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        <span style={{ color: "#8b949e", fontSize: "12px" }}>{label}</span>
        <span style={{ color, fontWeight: "700", fontSize: "18px" }}>{value}<span style={{ fontSize: "11px", color: "#8b949e" }}>{unit}</span></span>
      </div>
      <canvas ref={canvasRef} width="180" height="40" style={{ width: "100%", height: "40px" }} />
    </div>
  );
}

function LogTerminal({ pipeline, onClose }) {
  const logs = generateLogs(pipeline);
  const [visibleLogs, setVisibleLogs] = useState([]);
  const bottomRef = useRef(null);

  useEffect(() => {
    setVisibleLogs([]);
    logs.forEach((log, i) => {
      setTimeout(() => {
        setVisibleLogs(prev => [...prev, log]);
      }, i * 180);
    });
  }, [pipeline.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [visibleLogs]);

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.85)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#0d1117", border: "1px solid #30363d", borderRadius: "10px", width: "700px", maxHeight: "500px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "12px 16px", borderBottom: "1px solid #21262d", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: "#58a6ff", fontWeight: "600", fontSize: "14px" }}>Pipeline Logs — #{pipeline.id} {pipeline.name}</span>
          <button onClick={onClose} style={{ background: "#21262d", color: "#e6edf3", border: "none", borderRadius: "4px", padding: "4px 12px", cursor: "pointer", fontSize: "12px" }}>Close</button>
        </div>
        <div style={{ padding: "16px", fontFamily: "monospace", fontSize: "12px", overflowY: "auto", flex: 1, lineHeight: "1.8" }}>
          {visibleLogs.map((log, i) => (
            <div key={i} style={{ color: log.startsWith("[ERROR]") ? "#f85149" : log.startsWith("[SUCCESS]") ? "#3fb950" : log.startsWith("[WARN]") ? "#d29922" : "#8b949e" }}>
              <span style={{ color: "#444" }}>{String(i + 1).padStart(2, "0")} </span>{log}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [pipelines, setPipelines] = useState(initialPipelines);
  const [newPipeline, setNewPipeline] = useState("");
  const [nextId, setNextId] = useState(5);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [selectedLog, setSelectedLog] = useState(null);
  const [cpuData, setCpuData] = useState(Array.from({ length: 20 }, () => Math.random() * 40 + 30));
  const [memData, setMemData] = useState(Array.from({ length: 20 }, () => Math.random() * 30 + 50));
  const [netData, setNetData] = useState(Array.from({ length: 20 }, () => Math.random() * 60 + 20));
  const [cpuVal, setCpuVal] = useState(52);
  const [memVal, setMemVal] = useState(67);
  const [netVal, setNetVal] = useState(38);

  useEffect(() => {
    const t1 = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
    const t2 = setInterval(() => {
      const nc = Math.min(95, Math.max(10, cpuVal + (Math.random() * 10 - 5)));
      const nm = Math.min(95, Math.max(20, memVal + (Math.random() * 6 - 3)));
      const nn = Math.min(99, Math.max(5, netVal + (Math.random() * 20 - 10)));
      setCpuVal(Math.round(nc)); setMemVal(Math.round(nm)); setNetVal(Math.round(nn));
      setCpuData(p => [...p.slice(1), nc]);
      setMemData(p => [...p.slice(1), nm]);
      setNetData(p => [...p.slice(1), nn]);
    }, 1200);
    return () => { clearInterval(t1); clearInterval(t2); };
  }, [cpuVal, memVal, netVal]);

  const stats = {
    total: pipelines.length,
    success: pipelines.filter(p => p.status === "success").length,
    failed: pipelines.filter(p => p.status === "failed").length,
    running: pipelines.filter(p => p.status === "running").length,
  };

  const triggerPipeline = () => {
    if (!newPipeline.trim()) return;
    const id = nextId;
    setNextId(id + 1);
    const commit = Math.random().toString(16).slice(2, 9);
    const newP = { id, name: newPipeline, branch: "main", status: "running", duration: "0m 0s", time: "Just now", currentStage: 0, commit, author: "Rishav" };
    setPipelines(prev => [newP, ...prev]);
    setNewPipeline("");
    let stage = 0;
    const interval = setInterval(() => {
      stage += 1;
      setPipelines(prev => prev.map(p => p.id === id ? { ...p, currentStage: stage, duration: `${stage}m ${stage * 12}s` } : p));
      if (stage >= STAGES.length) {
        clearInterval(interval);
        setPipelines(prev => prev.map(p => p.id === id ? { ...p, status: "success", currentStage: 4, time: "Just now" } : p));
      }
    }, 2000);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0d1117", color: "#e6edf3", fontFamily: "'Segoe UI', sans-serif", padding: "24px" }}>
      {selectedLog && <LogTerminal pipeline={selectedLog} onClose={() => setSelectedLog(null)} />}

      {/* Header */}
      <div style={{ borderBottom: "1px solid #21262d", paddingBottom: "16px", marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "20px", color: "#58a6ff", fontWeight: "700" }}>Enterprise CI/CD DevOps Pipeline</h1>
          <p style={{ margin: "5px 0 0", color: "#8b949e", fontSize: "11px", letterSpacing: "1.5px", textTransform: "uppercase" }}>AWS EKS &nbsp;|&nbsp; Kubernetes &nbsp;|&nbsp; Jenkins &nbsp;|&nbsp; Terraform &nbsp;|&nbsp; Docker &nbsp;|&nbsp; ArgoCD</p>
        </div>
        <div style={{ textAlign: "right", fontSize: "12px" }}>
          <div style={{ color: "#8b949e", fontFamily: "monospace", marginBottom: "4px" }}>{currentTime}</div>
          <div style={{ color: "#00e676", display: "flex", alignItems: "center", gap: "6px", justifyContent: "flex-end" }}>
            <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#00e676", display: "inline-block" }} />
            AWS EKS Connected
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px", marginBottom: "20px" }}>
        {[
          { label: "Total Pipelines", value: stats.total, color: "#58a6ff" },
          { label: "Successful", value: stats.success, color: "#3fb950" },
          { label: "Failed", value: stats.failed, color: "#f85149" },
          { label: "Running", value: stats.running, color: "#d29922" },
        ].map((s, i) => (
          <div key={i} style={{ background: "#161b22", border: "1px solid #21262d", borderRadius: "8px", padding: "18px", textAlign: "center" }}>
            <div style={{ fontSize: "32px", fontWeight: "700", color: s.color }}>{s.value}</div>
            <div style={{ fontSize: "11px", color: "#8b949e", marginTop: "4px" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Live Metrics */}
      <div style={{ marginBottom: "20px" }}>
        <div style={{ fontSize: "11px", color: "#8b949e", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "10px" }}>Live System Metrics</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px" }}>
          <MetricCard label="CPU Usage" value={cpuVal} unit="%" color="#58a6ff" data={cpuData} />
          <MetricCard label="Memory Usage" value={memVal} unit="%" color="#3fb950" data={memData} />
          <MetricCard label="Network I/O" value={netVal} unit="MB/s" color="#d29922" data={netData} />
        </div>
      </div>

      {/* Cluster Info */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px", marginBottom: "20px" }}>
        {[
          { label: "Kubernetes Cluster", value: "AWS EKS — Active", color: "#3fb950" },
          { label: "Docker Containers", value: `${stats.running + 3} Running`, color: "#58a6ff" },
          { label: "Terraform IaC", value: "Infrastructure Ready", color: "#d29922" },
        ].map((item, i) => (
          <div key={i} style={{ background: "#161b22", border: "1px solid #21262d", borderRadius: "8px", padding: "14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "#8b949e", fontSize: "12px" }}>{item.label}</span>
            <span style={{ color: item.color, fontWeight: "600", fontSize: "12px" }}>{item.value}</span>
          </div>
        ))}
      </div>

      {/* Trigger */}
      <div style={{ background: "#161b22", border: "1px solid #21262d", borderRadius: "8px", padding: "16px", marginBottom: "20px" }}>
        <div style={{ fontSize: "11px", color: "#8b949e", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "12px" }}>Trigger New Pipeline</div>
        <div style={{ display: "flex", gap: "10px" }}>
          <input value={newPipeline} onChange={e => setNewPipeline(e.target.value)} onKeyDown={e => e.key === "Enter" && triggerPipeline()}
            placeholder="Enter service name (e.g. Payment Service)"
            style={{ flex: 1, background: "#0d1117", border: "1px solid #30363d", borderRadius: "6px", padding: "10px 14px", color: "#e6edf3", fontSize: "13px", outline: "none", fontFamily: "monospace" }} />
          <button onClick={triggerPipeline}
            style={{ background: "#238636", color: "#fff", border: "none", borderRadius: "6px", padding: "10px 24px", cursor: "pointer", fontWeight: "600", fontSize: "13px" }}>
            Run Pipeline
          </button>
        </div>
      </div>

      {/* Pipeline List */}
      <div style={{ background: "#161b22", border: "1px solid #21262d", borderRadius: "8px", padding: "16px" }}>
        <div style={{ fontSize: "11px", color: "#8b949e", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "14px" }}>Pipeline Runs</div>
        {pipelines.map(p => (
          <div key={p.id} style={{ border: "1px solid #21262d", borderRadius: "8px", padding: "14px", marginBottom: "10px", background: "#0d1117" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontWeight: "700", fontSize: "14px" }}>#{p.id} {p.name}</span>
                <span style={{ background: "#21262d", padding: "2px 8px", borderRadius: "4px", fontSize: "11px", color: "#8b949e", fontFamily: "monospace" }}>{p.branch}</span>
                <span style={{ background: "#21262d", padding: "2px 8px", borderRadius: "4px", fontSize: "11px", color: "#58a6ff", fontFamily: "monospace" }}>{p.commit}</span>
                <span style={{ fontSize: "11px", color: "#8b949e" }}>by {p.author}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ color: p.status === "success" ? "#3fb950" : p.status === "failed" ? "#f85149" : "#d29922", fontWeight: "600", fontSize: "13px", display: "flex", alignItems: "center", gap: "5px" }}>
                  <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: p.status === "success" ? "#3fb950" : p.status === "failed" ? "#f85149" : "#d29922", display: "inline-block" }} />
                  {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                </span>
                <button onClick={() => setSelectedLog(p)}
                  style={{ background: "#21262d", color: "#8b949e", border: "1px solid #30363d", borderRadius: "4px", padding: "3px 10px", cursor: "pointer", fontSize: "11px" }}>
                  View Logs
                </button>
              </div>
            </div>
            <StageBar currentStage={p.currentStage} status={p.status} />
            <div style={{ marginTop: "8px", fontSize: "11px", color: "#8b949e", fontFamily: "monospace" }}>
              Duration: {p.duration} &nbsp;&nbsp; {p.time}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
