import React, { useState, useEffect } from "react";

/* ═══════════════════════════════════════════════════
   CONFIG
   ═══════════════════════════════════════════════════ */

const SK = {
  PROFILE: "pre-profile",
  PROJECTS: "pre-projects",
  OPPS: "pre-opps",
  APPS: "pre-apps",
  PAY: "pre-pay",
  FILES: "pre-files"
};

const DEF_PROFILE = {
  companyName: "Precariat Productions",
  founders: "Ryan Guiterman & Sam Ellison",
  location: "New York City",
  bio: "NYC-based film, theater and animation production company specializing in genre films with cutting-edge VFX + AI technology. Credits include Canvas (Annecy 2021, Gravitas Ventures) and Loud & Longing (Lighthouse IFF 2023, Gravitas Ventures).",
  website: "precariatproductions.com",
  credits: "Canvas (2021) - Animated Horror - Annecy, Gravitas Ventures\nLoud & Longing (2023) - Drama/Thriller - Lighthouse IFF, Gravitas Ventures\nFor Marta (Short Film)",
  specialties: "Animation, Horror, Genre Films, VFX, AI Technology, Independent Film"
};

const DEF_PAY = {
  methods: [],
  defaultMethodId: null,
  spendingLimit: 500,
  requireApproval: true,
  monthlyBudget: 2000
};

const TABS = [
  { id: "dash", label: "DASHBOARD", icon: "◈" },
  { id: "proj", label: "PROJECTS", icon: "◉" },
  { id: "disc", label: "DISCOVER", icon: "◎" },
  { id: "dead", label: "DEADLINES", icon: "◷" },
  { id: "apps", label: "APPLICATIONS", icon: "◆" },
  { id: "pay", label: "PAYMENT", icon: "◐" },
  { id: "prof", label: "PROFILE", icon: "◇" }
];

const FILE_CATEGORIES = [
  { id: "screenplay", label: "Screenplay", icon: "📄", accept: ".pdf,.txt", hint: "PDF or TXT" },
  { id: "pitchDeck", label: "Pitch Deck", icon: "🎬", accept: ".pdf", hint: "PDF" },
  { id: "lookbook", label: "Look Book / Visual Reference", icon: "🎨", accept: ".pdf,.png,.jpg,.jpeg", hint: "PDF or images" },
  { id: "treatment", label: "Treatment / Synopsis", icon: "📝", accept: ".pdf,.txt", hint: "PDF or TXT" },
  { id: "other", label: "Other Materials", icon: "📎", accept: ".pdf,.txt,.png,.jpg,.jpeg", hint: "PDF, text, or image" }
];

const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB per file

const C = {
  bg: "#0a0a0c", sf: "#131318", bd: "#222230", bl: "#2a2a3a",
  tx: "#e8e8f0", tm: "#8888a0", td: "#555568",
  ac: "#c8ff00", ad: "#8baa20",
  dn: "#ff4060", ok: "#00e080", wn: "#ffaa00", pp: "#a855f7", tl: "#00ccaa"
};

const FN = {
  d: "'Instrument Serif', Georgia, serif",
  b: "'DM Sans', 'Helvetica Neue', sans-serif",
  m: "'JetBrains Mono', 'Fira Code', monospace"
};

const LS = {
  display: "block",
  fontFamily: FN.m,
  fontSize: "10px",
  color: C.td,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  marginBottom: "6px"
};

/* ═══════════════════════════════════════════════════
   GLOBAL STYLES
   ═══════════════════════════════════════════════════ */

const GS = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=JetBrains+Mono:wght@400;500&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: ${C.bg}; color: ${C.tx}; font-family: ${FN.b}; }
    ::-webkit-scrollbar { width: 5px; }
    ::-webkit-scrollbar-thumb { background: ${C.bd}; border-radius: 4px; }
    input, textarea, select {
      background: ${C.bg};
      border: 1px solid ${C.bd};
      color: ${C.tx};
      font-family: ${FN.b};
      font-size: 14px;
      padding: 10px 14px;
      border-radius: 6px;
      outline: none;
      width: 100%;
      transition: border-color 0.2s;
    }
    input:focus, textarea:focus, select:focus { border-color: ${C.ac}; }
    textarea { resize: vertical; min-height: 80px; line-height: 1.5; }
    select { cursor: pointer; appearance: none; }
    input[type="file"] { display: none; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
    @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
  `}</style>
);

/* ═══════════════════════════════════════════════════
   UI PRIMITIVES
   ═══════════════════════════════════════════════════ */

function Btn({ children, onClick, variant = "primary", small, disabled, style }) {
  const base = {
    border: "none",
    borderRadius: "6px",
    fontFamily: FN.b,
    fontWeight: 600,
    fontSize: small ? "12px" : "14px",
    padding: small ? "6px 12px" : "10px 20px",
    transition: "all 0.2s",
    opacity: disabled ? 0.4 : 1,
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    letterSpacing: "0.02em",
    cursor: disabled ? "not-allowed" : "pointer"
  };
  const variants = {
    primary: { background: C.ac, color: "#0a0a0c" },
    secondary: { background: C.sf, color: C.tx, border: "1px solid " + C.bd },
    ghost: { background: "transparent", color: C.tm },
    danger: { background: "transparent", color: C.dn, border: "1px solid " + C.dn + "40" },
    success: { background: C.ok, color: "#0a0a0c" },
    teal: { background: C.tl, color: "#0a0a0c" },
    cal: { background: C.pp, color: "#fff" }
  };
  return (
    <button
      onClick={disabled ? undefined : onClick}
      style={{ ...base, ...(variants[variant] || variants.primary), ...style }}
    >
      {children}
    </button>
  );
}

function Card({ children, style, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: C.sf,
        border: "1px solid " + C.bd,
        borderRadius: "10px",
        padding: "20px",
        animation: "fadeIn 0.3s ease",
        cursor: onClick ? "pointer" : "default",
        transition: "border-color 0.2s, transform 0.2s",
        ...style
      }}
    >
      {children}
    </div>
  );
}

function Bdg({ children, color = C.ac }) {
  return (
    <span style={{
      background: color + "18",
      color: color,
      fontSize: "11px",
      fontWeight: 600,
      padding: "3px 8px",
      borderRadius: "4px",
      letterSpacing: "0.04em",
      textTransform: "uppercase",
      fontFamily: FN.m
    }}>
      {children}
    </span>
  );
}

function Loader({ text }) {
  return (
    <div style={{ padding: "40px 0", textAlign: "center" }}>
      <div style={{
        width: "200px",
        height: "3px",
        background: C.bd,
        borderRadius: "2px",
        margin: "0 auto 16px",
        overflow: "hidden"
      }}>
        <div style={{
          width: "60%",
          height: "100%",
          background: "linear-gradient(90deg, transparent, " + C.ac + ", transparent)",
          backgroundSize: "200% 100%",
          animation: "shimmer 1.5s infinite"
        }} />
      </div>
      <p style={{ color: C.tm, fontSize: "13px", fontFamily: FN.m }}>{text}</p>
    </div>
  );
}

function Blank({ icon, title, sub, action }) {
  return (
    <div style={{ padding: "60px 20px", textAlign: "center" }}>
      <div style={{ fontSize: "32px", marginBottom: "12px", opacity: 0.4 }}>{icon}</div>
      <h3 style={{
        fontFamily: FN.d,
        fontSize: "20px",
        marginBottom: "8px",
        fontWeight: 400,
        fontStyle: "italic"
      }}>{title}</h3>
      <p style={{
        color: C.tm,
        fontSize: "13px",
        maxWidth: "340px",
        margin: "0 auto 20px",
        lineHeight: 1.6
      }}>{sub}</p>
      {action}
    </div>
  );
}

function Chk({ checked, onChange, label, sub }) {
  return (
    <div
      style={{
        display: "flex",
        gap: "12px",
        alignItems: "flex-start",
        cursor: "pointer",
        padding: "8px 0"
      }}
      onClick={() => onChange(!checked)}
    >
      <div style={{
        width: "20px",
        height: "20px",
        minWidth: "20px",
        borderRadius: "4px",
        border: "2px solid " + (checked ? C.ac : C.bd),
        background: checked ? C.ac : "transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.15s",
        marginTop: "1px"
      }}>
        {checked && <span style={{ color: "#0a0a0c", fontSize: "13px", fontWeight: 800 }}>✓</span>}
      </div>
      <div>
        <span style={{ fontSize: "14px", color: C.tx, display: "block" }}>{label}</span>
        {sub && <span style={{ fontSize: "12px", color: C.tm, display: "block", marginTop: "2px" }}>{sub}</span>}
      </div>
    </div>
  );
}

function Mdl({ open, onClose, children, title, width }) {
  if (!open) return null;
  return (
    <div
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "20px"
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: C.sf,
          border: "1px solid " + C.bd,
          borderRadius: "12px",
          padding: "28px",
          width: "100%",
          maxWidth: width || "540px",
          maxHeight: "85vh",
          overflowY: "auto",
          animation: "scaleIn 0.2s ease"
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px"
        }}>
          <h3 style={{ fontFamily: FN.d, fontSize: "22px", fontStyle: "italic" }}>{title}</h3>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: C.tm,
              fontSize: "20px",
              cursor: "pointer",
              padding: "4px 8px"
            }}
          >×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function InfoBlock({ label, content, color }) {
  return (
    <div style={{ marginBottom: "16px" }}>
      <p style={{
        fontFamily: FN.m,
        fontSize: "10px",
        color: color || C.ac,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        marginBottom: "8px"
      }}>{label}</p>
      <p style={{ fontSize: "13px", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{content}</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════ */

async function askClaude(content, search) {
  const apiKey = localStorage.getItem("poe_api_key") || "";
  if (!apiKey) {
    throw new Error("No API key set. Go to the Profile tab and add your Anthropic API key.");
  }
  const messages = [{
    role: "user",
    content: typeof content === "string" ? content : content
  }];
  const body = {
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    messages: messages
  };
  if (search) {
    body.tools = [{ type: "web_search_20250305", name: "web_search" }];
  }
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true"
    },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = err.error?.message || err.error || ("API request failed: " + res.status);
    throw new Error(msg);
  }
  const data = await res.json();
  return (data.content || [])
    .map(b => b.type === "text" ? b.text : "")
    .filter(Boolean)
    .join("\n");
}

function extractJSON(text) {
  const clean = text.replace(/```json|```/g, "").trim();
  const arr = clean.match(/\[[\s\S]*\]/);
  if (arr) {
    try { return JSON.parse(arr[0]); } catch (e) {}
  }
  const obj = clean.match(/\{[\s\S]*\}/);
  if (obj) {
    try { return JSON.parse(obj[0]); } catch (e) {}
  }
  return null;
}

function parseDate(str) {
  if (!str) return null;
  if (["Rolling", "TBD", "Varies", "Ongoing", "Unknown"].includes(str)) return null;
  const d = new Date(str.replace(/,/g, "").trim());
  if (!isNaN(d.getTime()) && d.getFullYear() > 2020) return d;
  return null;
}

function daysLeft(date) {
  if (!date) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const t = new Date(date);
  t.setHours(0, 0, 0, 0);
  return Math.ceil((t - now) / 86400000);
}

function urgency(days) {
  if (days === null) return { label: "TBD", color: C.td };
  if (days < 0) return { label: "PAST", color: C.dn };
  if (days === 0) return { label: "TODAY", color: C.dn };
  if (days <= 7) return { label: days + "d", color: C.dn };
  if (days <= 30) return { label: days + "d", color: C.wn };
  if (days <= 90) return { label: days + "d", color: C.tl };
  return { label: days + "d", color: C.td };
}

function parseFee(fee) {
  if (!fee || typeof fee !== "string") return 0;
  const s = fee.toLowerCase().trim();
  if (s === "free" || s === "$0" || s === "0" || s === "n/a" || s === "none" || s === "waived") return 0;
  const matches = s.match(/\d+(?:\.\d+)?/g);
  if (!matches || matches.length === 0) return 0;
  const nums = matches.map(n => parseFloat(n)).filter(n => !isNaN(n));
  if (nums.length === 0) return 0;
  // For ranges like "$65-$85", return the MAX for safety (so spending limit gates catch it)
  const max = Math.max(...nums);
  // Sanity cap: no submission fee should exceed $10,000
  if (max > 10000) return 0;
  return max;
}

function isFeeRange(fee) {
  if (!fee || typeof fee !== "string") return false;
  const matches = fee.match(/\d+(?:\.\d+)?/g);
  if (!matches || matches.length < 2) return false;
  const nums = matches.map(n => parseFloat(n));
  return Math.max(...nums) !== Math.min(...nums);
}

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}

function getMediaType(fileName) {
  const ext = fileName.toLowerCase().split(".").pop();
  const map = {
    pdf: "application/pdf",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    txt: "text/plain"
  };
  return map[ext] || "application/octet-stream";
}

async function loadProjectFiles(projectId) {
  try {
    const result = await window.storage.get(SK.FILES + "-" + projectId);
    if (result && result.value) return JSON.parse(result.value);
  } catch (e) {}
  return [];
}

async function saveProjectFiles(projectId, files) {
  try {
    await window.storage.set(SK.FILES + "-" + projectId, JSON.stringify(files));
  } catch (e) {
    console.error("Failed to save files:", e);
  }
}

async function deleteProjectFiles(projectId) {
  try {
    await window.storage.delete(SK.FILES + "-" + projectId);
  } catch (e) {}
}

/* ═══════════════════════════════════════════════════
   MAIN APP
   ═══════════════════════════════════════════════════ */

export default function App() {
  const [tab, setTab] = useState("dash");
  const [profile, setProfile] = useState(DEF_PROFILE);
  const [projects, setProjects] = useState([]);
  const [opps, setOpps] = useState([]);
  const [apps, setApps] = useState([]);
  const [pay, setPay] = useState(DEF_PAY);
  const [ready, setReady] = useState(false);

  // Background jobs system — operations continue running when you switch tabs
  const [jobs, setJobs] = useState([]);
  // job = { id, kind: "analyze"|"search"|"generate", status: "running"|"error", label, error, startedAt, meta }

  // Lifted Discover state (persists across tab switches)
  const [searchResults, setSearchResults] = useState([]);
  const [searchProjectIdx, setSearchProjectIdx] = useState(0);
  const [searchFilter, setSearchFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchError, setSearchError] = useState("");

  // Refs keep latest values accessible inside long-running async functions
  const projectsRef = React.useRef(projects);
  const appsRef = React.useRef(apps);
  const payRef = React.useRef(pay);
  const profileRef = React.useRef(profile);
  const oppsRef = React.useRef(opps);

  useEffect(() => { projectsRef.current = projects; }, [projects]);
  useEffect(() => { appsRef.current = apps; }, [apps]);
  useEffect(() => { payRef.current = pay; }, [pay]);
  useEffect(() => { profileRef.current = profile; }, [profile]);
  useEffect(() => { oppsRef.current = opps; }, [opps]);

  useEffect(() => {
    (async () => {
      try {
        const keys = [SK.PROFILE, SK.PROJECTS, SK.OPPS, SK.APPS, SK.PAY];
        const results = await Promise.all(
          keys.map(k => window.storage.get(k).catch(() => null))
        );
        if (results[0] && results[0].value) setProfile(JSON.parse(results[0].value));
        if (results[1] && results[1].value) setProjects(JSON.parse(results[1].value));
        if (results[2] && results[2].value) setOpps(JSON.parse(results[2].value));
        if (results[3] && results[3].value) {
          const loadedApps = JSON.parse(results[3].value);
          // Migration: re-parse costs from feeLabel to fix any corrupted values
          // (older versions had a parsing bug where "$65-$85" became 6585)
          let needsResave = false;
          const fixedApps = loadedApps.map(a => {
            if (a.feeLabel) {
              const correctCost = parseFee(a.feeLabel);
              if (a.cost !== correctCost) {
                needsResave = true;
                return { ...a, cost: correctCost, _costFixed: true };
              }
            }
            return a;
          });
          setApps(fixedApps);
          if (needsResave) {
            window.storage.set(SK.APPS, JSON.stringify(fixedApps)).catch(() => {});
          }
        }
        if (results[4] && results[4].value) setPay(JSON.parse(results[4].value));
      } catch (err) {
        console.error(err);
      }
      setReady(true);
    })();
  }, []);

  const makeSaver = (key, setter) => async (val) => {
    setter(val);
    try {
      await window.storage.set(key, JSON.stringify(val));
    } catch (e) {
      console.error("Save failed:", e);
    }
  };

  const sProfile = makeSaver(SK.PROFILE, setProfile);
  const sProjects = makeSaver(SK.PROJECTS, setProjects);
  const sOpps = makeSaver(SK.OPPS, setOpps);
  const sApps = makeSaver(SK.APPS, setApps);
  const sPay = makeSaver(SK.PAY, setPay);

  // Jobs helpers
  const addJob = (job) => {
    const fullJob = { ...job, startedAt: new Date().toISOString() };
    setJobs(j => [...j, fullJob]);
    return fullJob.id;
  };
  const updateJob = (id, updates) => {
    setJobs(j => j.map(x => x.id === id ? { ...x, ...updates } : x));
  };
  const removeJob = (id) => {
    setJobs(j => j.filter(x => x.id !== id));
  };
  const dismissJob = (id) => removeJob(id);

  // Background: Analyze a project
  const runAnalyze = async (projectId) => {
    const existing = jobs.find(j => j.kind === "analyze" && j.meta?.projectId === projectId && j.status === "running");
    if (existing) return;

    const p = projectsRef.current.find(x => x.id === projectId);
    if (!p) return;

    const jobId = "analyze-" + projectId + "-" + Date.now();
    addJob({
      id: jobId,
      kind: "analyze",
      status: "running",
      label: "Analyzing: " + p.title,
      meta: { projectId }
    });

    try {
      const projectFiles = await loadProjectFiles(p.id);
      const prof = profileRef.current;

      const textPrompt = `You are a world-class film strategist who has programmed Sundance, Cannes, and advised A24. Analyze this project with extreme depth.

COMPANY: ${prof.companyName} | ${prof.founders} | ${prof.location}
Credits: ${prof.credits}
Specialties: ${prof.specialties}
Bio: ${prof.bio}

PROJECT:
Title: "${p.title}"
Format: ${p.format}
Genre: ${p.genre || "Not specified"}
Stage: ${p.stage}
Logline: ${p.logline || "Not provided"}
Synopsis: ${p.synopsis || "Not provided"}
Budget: ${p.budget || "Not specified"}
Runtime: ${p.runtime || "Not specified"}
Target Audience: ${p.targetAudience || "Not specified"}
Themes: ${p.themes || "Not specified"}
Team Notes: ${p.teamNotes || "Not specified"}

${projectFiles.length > 0 ? "ATTACHED MATERIALS (review carefully for deep analysis):\n" + projectFiles.map(f => "- " + f.name + " (" + f.category + ")").join("\n") + "\n\nUse attached materials as the PRIMARY source. Reference specific scenes, visuals, or content from them.\n" : ""}

Respond ONLY with JSON (no markdown, no backticks):
{
  "artistic": {
    "thematicCore": "3-4 sentences on the deepest thematic concerns. What questions does it ask?",
    "narrativeApproach": "2-3 sentences on storytelling strategy, structure, perspective, tone",
    "visualIdentity": "2-3 sentences on visual/aesthetic language. Reference specific styles or filmmakers",
    "artisticLineage": "2-3 sentences on what films, artists, or traditions this is in conversation with",
    "culturalSignificance": "2-3 sentences on why this story matters NOW"
  },
  "market": {
    "comparables": "3-5 comparable films with rationale",
    "festivalStrategy": "3-4 sentences naming specific festivals and sections",
    "audienceProfile": "2-3 sentences on core and secondary audiences",
    "distributionAngle": "2-3 sentences on distribution strategy",
    "marketPositioning": "2-3 sentences on unique selling proposition",
    "grantFitProfile": "2-3 sentences on what funding bodies would be receptive"
  },
  "strategy": {
    "strengths": "3-4 points on competitive strengths",
    "risks": "2-3 points on potential concerns with mitigations",
    "keyPhrasing": "5-8 specific phrases that should appear in applications",
    "submissionTiming": "2-3 sentences on optimal timing",
    "idealOpportunityTypes": "ranked list of opportunity types with rationale"
  }
}

Be brutally specific to THIS project only. No generic advice.`;

      let messageContent;
      if (projectFiles.length > 0) {
        const blocks = [{ type: "text", text: textPrompt }];
        for (const f of projectFiles) {
          if (f.isText) {
            blocks.push({
              type: "text",
              text: "\n--- " + f.name + " (" + f.category + ") ---\n" + f.data
            });
          } else if (f.mediaType === "application/pdf") {
            blocks.push({
              type: "document",
              source: { type: "base64", media_type: "application/pdf", data: f.data }
            });
          } else if (f.mediaType.startsWith("image/")) {
            blocks.push({
              type: "image",
              source: { type: "base64", media_type: f.mediaType, data: f.data }
            });
          }
        }
        messageContent = blocks;
      } else {
        messageContent = textPrompt;
      }

      const txt = await askClaude(messageContent);
      const result = extractJSON(txt);
      if (result) {
        const current = projectsRef.current;
        const updated = current.map(proj =>
          proj.id === projectId
            ? { ...proj, analysis: { ...result, analyzedAt: new Date().toISOString(), basedOnFiles: projectFiles.length } }
            : proj
        );
        sProjects(updated);
        removeJob(jobId);
      } else {
        updateJob(jobId, { status: "error", error: "Couldn't parse AI response as JSON. Try again." });
      }
    } catch (e) {
      console.error("Analyze error:", e);
      updateJob(jobId, { status: "error", error: e.message || "Analysis failed" });
    }
  };

  // Background: Search for opportunities
  const runSearch = async (projectIdx, filter, query) => {
    const p = projectsRef.current[projectIdx];
    if (!p) return;

    // Kill any existing running search
    setJobs(j => j.filter(x => x.kind !== "search" || x.status !== "running"));
    setSearchResults([]);
    setSearchError("");

    const jobId = "search-" + Date.now();
    addJob({
      id: jobId,
      kind: "search",
      status: "running",
      label: "Searching opportunities for: " + p.title,
      meta: { projectId: p.id }
    });

    const a = p.analysis;
    const tf = filter === "All"
      ? "grants, festivals, labs, fellowships, and residencies"
      : filter.toLowerCase();

    const stageRules = {
      "Development": "Only return opportunities that accept projects IN DEVELOPMENT (screenplay stage, not yet in production). This includes: screenwriting grants, script development funds, writers labs, development fellowships, story/screenplay competitions, early-stage incubators, and development residencies. DO NOT return film festivals (which require finished films), completed-film awards, distribution grants, post-production funds, or anything requiring an existing cut or finished work.",
      "Pre-Production": "Only return opportunities that accept projects in PRE-PRODUCTION (script is locked, preparing to shoot). This includes: production financing grants, pre-production labs, production fellowships, producer labs, and packaging/financing programs. DO NOT return completed-film festivals, post-production funds, or development-only grants.",
      "Production": "Only return opportunities that accept projects currently IN PRODUCTION (actively shooting). This includes: production grants, in-progress financing, and labs accepting projects mid-production. DO NOT return completed-film festivals, development-only grants, or post-production funds.",
      "Post-Production": "Only return opportunities that accept projects in POST-PRODUCTION (shot but not finished). This includes: finishing funds, post-production grants, work-in-progress showcases, rough-cut labs, and WIP festivals. DO NOT return completed-film festivals requiring a locked final cut (unless they have a WIP section), development grants, or production-only funds.",
      "Completed": "Only return opportunities for FINISHED films. This includes: film festivals (premiere and subsequent), distribution grants, completed-film awards, and release support programs. DO NOT return development grants, production funds, or opportunities requiring in-progress work."
    };

    const stageRule = stageRules[p.stage] || "Match opportunities appropriate to the project's current stage.";

    // Build exclusion list from existing applications FOR THIS PROJECT ONLY
    // (same opportunity can be applied to with different projects)
    const currentApps = appsRef.current;
    const projectApps = currentApps.filter(ap => ap.projTitle === p.title);
    const submittedNames = projectApps
      .filter(ap => ap.status === "submitted")
      .map(ap => ap.oppName + " — " + ap.oppOrg);
    const draftedNames = projectApps
      .filter(ap => ap.status === "draft" || ap.status === "approved")
      .map(ap => ap.oppName + " — " + ap.oppOrg);
    const exclusionList = [...submittedNames, ...draftedNames];

    let exclusionContext = "";
    if (exclusionList.length > 0) {
      exclusionContext = "\n\n🚫 ALREADY APPLIED WITH THIS PROJECT — DO NOT INCLUDE THESE IN RESULTS:\n"
        + exclusionList.map(n => "- " + n).join("\n")
        + "\n\nThe user has existing applications for \"" + p.title + "\" with the opportunities above. EXCLUDE them entirely from your search results. Find NEW opportunities only. Note: opportunities the user has applied to with OTHER projects are still eligible — only exclude ones tied to this specific project.";
    }

    let analysisContext = "";
    if (a) {
      analysisContext = "\nPROJECT INTELLIGENCE:\n"
        + "Artistic: " + JSON.stringify(a.artistic || {}) + "\n"
        + "Market: " + JSON.stringify(a.market || {}) + "\n"
        + "Strategy: " + JSON.stringify(a.strategy || {}) + "\n\n"
        + "Use this intelligence to find opportunities aligned with the project's specific artistic and market profile.";
    }

    const prof = profileRef.current;
    const prompt = `You are an expert film industry researcher. Search for REAL, currently open or upcoming ${tf} for this project.

COMPANY: ${prof.companyName} | ${prof.bio} | ${prof.location}
PROJECT: "${p.title}"
Format: ${p.format}
Genre: ${p.genre || "?"}
Stage: ${p.stage}
Logline: ${p.logline || "?"}
Themes: ${p.themes || "?"}${analysisContext}${exclusionContext}
${query && query.trim() ? "\nAdditional focus: " + query : ""}

🚨 CRITICAL STAGE REQUIREMENT (NON-NEGOTIABLE):
This project is currently in "${p.stage}" stage. ${stageRule}

Before returning ANY opportunity, verify it explicitly accepts projects in "${p.stage}" stage. If an opportunity requires a different stage, EXCLUDE IT. It is better to return fewer results than to include mismatched opportunities.

Respond ONLY with a JSON array. Each object must have:
- "name", "organization"
- "type" ("Grant"|"Festival"|"Lab"|"Fellowship"|"Residency")
- "deadline" (specific date like "June 15, 2026" when available)
- "amount", "submissionFee", "url"
- "description" (2-3 sentences)
- "stageEligibility" (explicit quote or paraphrase from the opportunity confirming it accepts ${p.stage}-stage projects)
- "matchReason" (why this fits THIS specific project — reference the analysis if provided)
- "matchStrength" ("strong"|"moderate"|"speculative")
- "eligibility" (other key requirements beyond stage)

Find 6-12 real opportunities that STRICTLY match the project's current stage. Quality over quantity.`;

    try {
      const txt = await askClaude(prompt, true);
      const parsed = extractJSON(txt);
      if (parsed && Array.isArray(parsed)) {
        // Hard client-side filter: drop any that already exist as submitted apps FOR THIS PROJECT
        // (belt-and-suspenders safety in case the AI ignored the exclusion list)
        const submittedSet = new Set(
          projectApps
            .filter(ap => ap.status === "submitted")
            .map(ap => (ap.oppName || "").toLowerCase().trim() + "|" + (ap.oppOrg || "").toLowerCase().trim())
        );
        const filtered = parsed.filter(o => {
          const key = (o.name || "").toLowerCase().trim() + "|" + (o.organization || "").toLowerCase().trim();
          return !submittedSet.has(key);
        });
        const order = { strong: 0, moderate: 1, speculative: 2 };
        const sorted = [...filtered].sort(
          (a, b) => (order[a.matchStrength] || 2) - (order[b.matchStrength] || 2)
        );
        setSearchResults(sorted);
        removeJob(jobId);
      } else {
        setSearchError("Couldn't parse results.");
        updateJob(jobId, { status: "error", error: "Parse failed" });
      }
    } catch (e) {
      console.error("Search error:", e);
      setSearchError(e.message || "Search failed");
      updateJob(jobId, { status: "error", error: e.message || "Search failed" });
    }
  };

  // Background: Generate an application
  const runGenerate = async (oppIdx, projectIdx) => {
    const o = oppsRef.current[oppIdx];
    const p = projectsRef.current[projectIdx];
    if (!o || !p) return;

    const jobId = "generate-" + Date.now();
    addJob({
      id: jobId,
      kind: "generate",
      status: "running",
      label: "Generating application: " + o.name,
      meta: { oppName: o.name, projectTitle: p.title }
    });

    try {
      const a = p.analysis;
      const projectFiles = await loadProjectFiles(p.id);
      const prof = profileRef.current;

      let analysisContext = "";
      if (a) analysisContext = "\nPROJECT INTELLIGENCE:\n" + JSON.stringify(a);

      const textPrompt = `You are a world-class grant writer. Generate a complete, hand-tailored application.

OPPORTUNITY: ${o.name} | ${o.organization} | ${o.type} | ${o.description}
COMPANY: ${prof.companyName} | ${prof.founders} | ${prof.location} | ${prof.bio} | ${prof.credits}
PROJECT: "${p.title}" | ${p.format} | ${p.genre || "?"} | ${p.stage} | ${p.logline || "?"} | ${p.synopsis || "?"} | ${p.themes || "?"}${analysisContext}

${projectFiles.length > 0 ? "ATTACHED MATERIALS: Review the attached files (screenplay, pitch deck, etc.) and reference specific content from them in the application." : ""}

Respond ONLY with JSON (no markdown):
{
  "projectStatement": "2-3 para",
  "artistStatement": "1-2 para",
  "budgetJustification": "...",
  "impactStatement": "...",
  "timeline": "...",
  "coverLetter": "...",
  "strategicNotes": "internal notes only"
}`;

      let messageContent;
      if (projectFiles.length > 0) {
        const blocks = [{ type: "text", text: textPrompt }];
        for (const f of projectFiles) {
          if (f.isText) {
            blocks.push({ type: "text", text: "\n--- " + f.name + " ---\n" + f.data });
          } else if (f.mediaType === "application/pdf") {
            blocks.push({
              type: "document",
              source: { type: "base64", media_type: "application/pdf", data: f.data }
            });
          } else if (f.mediaType.startsWith("image/")) {
            blocks.push({
              type: "image",
              source: { type: "base64", media_type: f.mediaType, data: f.data }
            });
          }
        }
        messageContent = blocks;
      } else {
        messageContent = textPrompt;
      }

      const txt = await askClaude(messageContent);
      const parsed = extractJSON(txt);
      if (parsed) {
        const cost = parseFee(o.submissionFee);
        const currentPay = payRef.current;
        const newApp = {
          id: Date.now().toString(),
          oppName: o.name,
          oppOrg: o.organization,
          oppUrl: o.url,
          projTitle: p.title,
          hadAnalysis: !!a,
          hadFiles: projectFiles.length > 0,
          status: "draft",
          cost: cost,
          feeLabel: o.submissionFee || "?",
          payId: currentPay.defaultMethodId,
          createdAt: new Date().toISOString(),
          content: parsed,
          checks: { content: false, cost: false, ready: false }
        };
        const currentApps = appsRef.current;
        sApps([...currentApps, newApp]);
        removeJob(jobId);
      } else {
        updateJob(jobId, { status: "error", error: "Parse failed" });
      }
    } catch (e) {
      console.error("Generate error:", e);
      updateJob(jobId, { status: "error", error: e.message || "Generation failed" });
    }
  };

  // Background: Refresh an existing application with updated analysis
  // mode: "augment" preserves user edits, only updates sections that benefit from new intelligence
  // mode: "regenerate" creates a completely fresh draft replacing the existing content
  const runRefreshApp = async (appId, mode) => {
    const app = appsRef.current.find(a => a.id === appId);
    if (!app || app.status === "submitted") return;

    const allProjects = projectsRef.current;
    const p = allProjects.find(x => x.title === app.projTitle) || allProjects[0];
    if (!p) return;

    const jobId = "refresh-" + appId + "-" + Date.now();
    addJob({
      id: jobId,
      kind: "refresh",
      status: "running",
      label: (mode === "regenerate" ? "Regenerating: " : "Refreshing: ") + app.oppName,
      meta: { appId, mode }
    });

    try {
      const a = p.analysis;
      const projectFiles = await loadProjectFiles(p.id);
      const prof = profileRef.current;
      const o = oppsRef.current.find(x => x.name === app.oppName && x.organization === app.oppOrg);

      let analysisContext = "";
      if (a) analysisContext = "\nUPDATED PROJECT INTELLIGENCE:\n" + JSON.stringify(a);

      let textPrompt;
      if (mode === "regenerate") {
        textPrompt = `You are a world-class grant writer. Generate a complete, hand-tailored application using the latest project intelligence.

OPPORTUNITY: ${app.oppName} | ${app.oppOrg}${o ? " | " + o.type + " | " + o.description : ""}
COMPANY: ${prof.companyName} | ${prof.founders} | ${prof.location} | ${prof.bio} | ${prof.credits}
PROJECT: "${p.title}" | ${p.format} | ${p.genre || "?"} | ${p.stage} | ${p.logline || "?"} | ${p.synopsis || "?"} | ${p.themes || "?"} | Team: ${p.teamNotes || "?"}${analysisContext}

${projectFiles.length > 0 ? "ATTACHED MATERIALS: Review the attached files and reference specific content from them." : ""}

Respond ONLY with JSON (no markdown):
{
  "projectStatement": "2-3 para",
  "artistStatement": "1-2 para",
  "budgetJustification": "...",
  "impactStatement": "...",
  "timeline": "...",
  "coverLetter": "...",
  "strategicNotes": "internal notes only"
}`;
      } else {
        // Augment mode: surgical update preserving tone and user edits
        textPrompt = `You are a world-class grant writer reviewing an existing application draft against UPDATED project intelligence. The team has new information (perhaps a new collaborator attached, updated budget, revised script, new credits, etc.) and needs to know if the application should be updated.

OPPORTUNITY: ${app.oppName} | ${app.oppOrg}${o ? " | " + o.type : ""}
COMPANY: ${prof.companyName} | ${prof.founders} | ${prof.location} | ${prof.bio} | ${prof.credits}
PROJECT: "${p.title}" | ${p.format} | ${p.genre || "?"} | ${p.stage} | ${p.logline || "?"} | ${p.synopsis || "?"} | Team Notes: ${p.teamNotes || "?"}${analysisContext}

EXISTING APPLICATION DRAFT:
${JSON.stringify(app.content, null, 2)}

${projectFiles.length > 0 ? "ATTACHED MATERIALS: Review the attached files for current details." : ""}

CRITICAL INSTRUCTIONS:
1. Review each section. If the new intelligence/info genuinely strengthens a section, return an updated version.
2. If a section is already strong and the new info doesn't meaningfully improve it, return the EXACT original text unchanged — preserve the writer's voice and any manual edits.
3. Integrate new information naturally (new producer credits, new themes from fresh analysis, updated strategic positioning). Don't force changes.
4. Preserve the overall structure and any specific phrasing that works.
5. Add a "changesSummary" field listing what you changed and why (brief bullet points).

Respond ONLY with JSON (no markdown):
{
  "projectStatement": "...",
  "artistStatement": "...",
  "budgetJustification": "...",
  "impactStatement": "...",
  "timeline": "...",
  "coverLetter": "...",
  "strategicNotes": "...",
  "changesSummary": "Brief bullet points of what was updated, or 'No meaningful changes needed' if the draft already incorporates the latest intelligence well."
}`;
      }

      let messageContent;
      if (projectFiles.length > 0) {
        const blocks = [{ type: "text", text: textPrompt }];
        for (const f of projectFiles) {
          if (f.isText) {
            blocks.push({ type: "text", text: "\n--- " + f.name + " ---\n" + f.data });
          } else if (f.mediaType === "application/pdf") {
            blocks.push({
              type: "document",
              source: { type: "base64", media_type: "application/pdf", data: f.data }
            });
          } else if (f.mediaType.startsWith("image/")) {
            blocks.push({
              type: "image",
              source: { type: "base64", media_type: f.mediaType, data: f.data }
            });
          }
        }
        messageContent = blocks;
      } else {
        messageContent = textPrompt;
      }

      const txt = await askClaude(messageContent);
      const parsed = extractJSON(txt);

      if (parsed) {
        const currentApps = appsRef.current;
        const updatedApps = currentApps.map(a => {
          if (a.id !== appId) return a;
          const newContent = { ...a.content };
          // Copy over any fields that came back
          ["projectStatement", "artistStatement", "budgetJustification", "impactStatement", "timeline", "coverLetter", "strategicNotes"].forEach(k => {
            if (parsed[k]) newContent[k] = parsed[k];
          });
          return {
            ...a,
            content: newContent,
            hadAnalysis: !!a,
            refreshedAt: new Date().toISOString(),
            refreshMode: mode,
            changesSummary: parsed.changesSummary || null,
            // Dropping an approved/reviewed app back to draft because content changed
            status: a.status === "approved" ? "draft" : a.status,
            checks: a.status === "approved"
              ? { content: false, cost: false, ready: false }
              : a.checks
          };
        });
        sApps(updatedApps);
        removeJob(jobId);
      } else {
        updateJob(jobId, { status: "error", error: "Parse failed" });
      }
    } catch (e) {
      console.error("Refresh error:", e);
      updateJob(jobId, { status: "error", error: e.message || "Refresh failed" });
    }
  };

  if (!ready) {
    return (
      <div style={{
        background: C.bg,
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <GS />
        <Loader text="Loading Precariat..." />
      </div>
    );
  }

  const spent = apps
    .filter(a => a.status === "submitted" && a.cost)
    .reduce((s, a) => s + (a.cost || 0), 0);
  const draftCount = apps.filter(a => a.status === "draft").length;

  const deadlines = opps.map(o => {
    const pd = parseDate(o.deadline);
    const dl = daysLeft(pd);
    const ug = urgency(dl);
    const matchingApp = apps.find(a => a.oppName === o.name);
    const appSt = matchingApp ? matchingApp.status : null;
    return { ...o, pd, dl, ug, appSt };
  }).sort((a, b) => {
    if (!a.pd && !b.pd) return 0;
    if (!a.pd) return 1;
    if (!b.pd) return -1;
    return a.pd - b.pd;
  });

  const urgentCount = deadlines.filter(
    d => d.dl !== null && d.dl >= 0 && d.dl <= 30
  ).length;

  return (
    <div style={{ background: C.bg, minHeight: "100vh", display: "flex" }}>
      <GS />

      <nav style={{
        width: "220px",
        minHeight: "100vh",
        borderRight: "1px solid " + C.bd,
        padding: "24px 0",
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        top: 0,
        left: 0,
        background: C.bg,
        zIndex: 10
      }}>
        <div style={{ padding: "0 20px 28px", borderBottom: "1px solid " + C.bd }}>
          <h1 style={{ fontFamily: FN.d, fontSize: "22px", fontStyle: "italic" }}>Precariat</h1>
          <p style={{
            fontFamily: FN.m,
            fontSize: "10px",
            color: C.td,
            marginTop: "4px",
            letterSpacing: "0.08em",
            textTransform: "uppercase"
          }}>Opportunity Engine</p>
        </div>

        <div style={{ flex: 1, padding: "12px 10px" }}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                width: "100%",
                padding: "10px 12px",
                border: "none",
                borderRadius: "6px",
                background: tab === t.id ? C.ac + "12" : "transparent",
                color: tab === t.id ? C.ac : C.tm,
                fontFamily: FN.m,
                fontSize: "11px",
                letterSpacing: "0.06em",
                cursor: "pointer",
                transition: "all 0.15s",
                marginBottom: "2px",
                textAlign: "left"
              }}
            >
              <span style={{ fontSize: "14px" }}>{t.icon}</span>
              {t.label}
              {t.id === "apps" && draftCount > 0 && (
                <span style={{
                  marginLeft: "auto",
                  background: C.wn,
                  color: "#0a0a0c",
                  fontSize: "10px",
                  fontWeight: 700,
                  width: "18px",
                  height: "18px",
                  borderRadius: "9px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>{draftCount}</span>
              )}
              {t.id === "dead" && urgentCount > 0 && (
                <span style={{
                  marginLeft: "auto",
                  background: C.dn,
                  color: "#fff",
                  fontSize: "10px",
                  fontWeight: 700,
                  width: "18px",
                  height: "18px",
                  borderRadius: "9px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>{urgentCount}</span>
              )}
            </button>
          ))}
        </div>

        <div style={{ padding: "16px 20px", borderTop: "1px solid " + C.bd }}>
          {jobs.length > 0 && (
            <div style={{
              marginBottom: "12px",
              padding: "10px",
              background: C.tl + "10",
              border: "1px solid " + C.tl + "30",
              borderRadius: "6px"
            }}>
              <p style={{
                fontFamily: FN.m,
                fontSize: "9px",
                color: C.tl,
                letterSpacing: "0.06em",
                marginBottom: "6px",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}>
                <span style={{
                  display: "inline-block",
                  width: "6px",
                  height: "6px",
                  background: jobs.some(j => j.status === "running") ? C.tl : C.dn,
                  borderRadius: "50%",
                  animation: jobs.some(j => j.status === "running") ? "pulse 1.5s infinite" : "none"
                }} />
                {jobs.filter(j => j.status === "running").length} RUNNING
                {jobs.some(j => j.status === "error") && " · " + jobs.filter(j => j.status === "error").length + " ERROR"}
              </p>
              {jobs.slice(0, 3).map(j => (
                <div key={j.id} style={{ marginBottom: "4px" }}>
                  <p style={{
                    fontSize: "10px",
                    color: j.status === "error" ? C.dn : C.tx,
                    lineHeight: 1.4,
                    wordBreak: "break-word"
                  }}>
                    {j.status === "running" ? "⏳ " : "⚠ "}
                    {j.label.length > 32 ? j.label.slice(0, 32) + "..." : j.label}
                  </p>
                  {j.status === "error" && (
                    <div style={{ display: "flex", gap: "6px", marginTop: "2px" }}>
                      <button
                        onClick={() => dismissJob(j.id)}
                        style={{
                          background: "none",
                          border: "none",
                          color: C.tm,
                          fontSize: "9px",
                          fontFamily: FN.m,
                          cursor: "pointer",
                          padding: 0,
                          textDecoration: "underline"
                        }}
                      >dismiss</button>
                    </div>
                  )}
                </div>
              ))}
              {jobs.length > 3 && (
                <p style={{ fontSize: "9px", color: C.tm, marginTop: "4px" }}>
                  +{jobs.length - 3} more
                </p>
              )}
            </div>
          )}
          <p style={{
            fontFamily: FN.m,
            fontSize: "9px",
            color: C.td,
            letterSpacing: "0.06em"
          }}>
            {projects.length} PROJECTS · {projects.filter(p => p.analysis).length} ANALYZED
          </p>
          <p style={{
            fontFamily: FN.m,
            fontSize: "9px",
            color: C.tm,
            letterSpacing: "0.06em",
            marginTop: "4px"
          }}>
            SPENT ${spent.toFixed(0)} / ${pay.monthlyBudget}
          </p>
        </div>
      </nav>

      <main style={{
        marginLeft: "220px",
        flex: 1,
        padding: "32px 40px",
        maxWidth: "960px"
      }}>
        {tab === "dash" && (
          <DashView
            profile={profile}
            projects={projects}
            apps={apps}
            pay={pay}
            go={setTab}
            spent={spent}
            deadlines={deadlines}
            jobs={jobs}
          />
        )}
        {tab === "proj" && (
          <ProjView
            projects={projects}
            save={sProjects}
            profile={profile}
            jobs={jobs}
            runAnalyze={runAnalyze}
            dismissJob={dismissJob}
            apps={apps}
            runRefreshApp={runRefreshApp}
          />
        )}
        {tab === "disc" && (
          <DiscView
            profile={profile}
            projects={projects}
            opps={opps}
            save={sOpps}
            apps={apps}
            jobs={jobs}
            runSearch={runSearch}
            searchResults={searchResults}
            setSearchResults={setSearchResults}
            searchProjectIdx={searchProjectIdx}
            setSearchProjectIdx={setSearchProjectIdx}
            searchFilter={searchFilter}
            setSearchFilter={setSearchFilter}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            searchError={searchError}
            setSearchError={setSearchError}
            dismissJob={dismissJob}
          />
        )}
        {tab === "dead" && (
          <DeadView
            deadlines={deadlines}
            opps={opps}
            save={sOpps}
            go={setTab}
          />
        )}
        {tab === "apps" && (
          <AppsView
            profile={profile}
            projects={projects}
            opps={opps}
            apps={apps}
            save={sApps}
            pay={pay}
            jobs={jobs}
            runGenerate={runGenerate}
            dismissJob={dismissJob}
            runRefreshApp={runRefreshApp}
          />
        )}
        {tab === "pay" && (
          <PayView pay={pay} save={sPay} spent={spent} />
        )}
        {tab === "prof" && (
          <ProfView profile={profile} save={sProfile} />
        )}
      </main>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   DASHBOARD
   ═══════════════════════════════════════════════════ */

function DashView({ profile, projects, apps, pay, go, spent, deadlines }) {
  const urgent = deadlines.filter(d => d.dl !== null && d.dl >= 0 && d.dl <= 7);
  const drafts = apps.filter(a => a.status === "draft").length;

  const stats = [
    { l: "Projects", v: projects.length, c: C.ac },
    { l: "Analyzed", v: projects.filter(p => p.analysis).length + "/" + projects.length, c: C.tl },
    { l: "Deadlines", v: deadlines.filter(d => d.dl !== null && d.dl >= 0).length, c: C.pp },
    { l: "Spent", v: "$" + spent.toFixed(0), c: C.wn }
  ];

  return (
    <div>
      <div style={{ marginBottom: "36px" }}>
        <h2 style={{
          fontFamily: FN.d,
          fontSize: "32px",
          fontWeight: 400,
          fontStyle: "italic",
          marginBottom: "8px"
        }}>Welcome back</h2>
        <p style={{ color: C.tm, fontSize: "14px" }}>{profile.companyName}</p>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "12px",
        marginBottom: "24px"
      }}>
        {stats.map(s => (
          <Card key={s.l}>
            <p style={{
              fontFamily: FN.m,
              fontSize: "10px",
              color: C.td,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              marginBottom: "8px"
            }}>{s.l}</p>
            <p style={{
              fontFamily: FN.d,
              fontSize: "28px",
              color: s.c,
              fontStyle: "italic"
            }}>{s.v}</p>
          </Card>
        ))}
      </div>

      {urgent.length > 0 && (
        <Card style={{ marginBottom: "16px", borderColor: C.dn + "50" }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "14px"
          }}>
            <span style={{ fontSize: "20px" }}>🔥</span>
            <h3 style={{ fontFamily: FN.d, fontSize: "18px", fontStyle: "italic" }}>
              Urgent Deadlines
            </h3>
          </div>
          {urgent.slice(0, 4).map((d, i) => (
            <div key={i} style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "10px 14px",
              background: C.bg,
              borderRadius: "8px",
              borderLeft: "3px solid " + d.ug.color,
              marginBottom: "6px"
            }}>
              <div>
                <p style={{ fontSize: "14px", fontWeight: 500 }}>{d.name}</p>
                <p style={{ fontSize: "11px", color: C.tm }}>{d.organization}</p>
              </div>
              <p style={{
                fontFamily: FN.m,
                fontSize: "14px",
                fontWeight: 700,
                color: d.ug.color
              }}>{d.ug.label}</p>
            </div>
          ))}
          <Btn
            variant="ghost"
            small
            onClick={() => go("dead")}
            style={{ marginTop: "8px", width: "100%", justifyContent: "center" }}
          >View All →</Btn>
        </Card>
      )}

      {drafts > 0 && (
        <Card style={{ marginBottom: "16px", borderColor: C.wn + "50" }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}>
            <p style={{ fontSize: "14px" }}>⚠ {drafts} application(s) need review</p>
            <Btn small onClick={() => go("apps")}>Review</Btn>
          </div>
        </Card>
      )}

      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "16px"
      }}>
        <Card>
          <h3 style={{
            fontFamily: FN.d,
            fontSize: "18px",
            fontStyle: "italic",
            marginBottom: "16px"
          }}>Quick Actions</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <Btn
              variant="secondary"
              onClick={() => go("proj")}
              style={{ width: "100%", justifyContent: "center" }}
            >+ Add Project</Btn>
            <Btn
              variant="secondary"
              onClick={() => go("disc")}
              style={{ width: "100%", justifyContent: "center" }}
            >◎ Search</Btn>
            <Btn
              variant="secondary"
              onClick={() => go("dead")}
              style={{ width: "100%", justifyContent: "center" }}
            >◷ Deadlines</Btn>
          </div>
        </Card>
        <Card>
          <h3 style={{
            fontFamily: FN.d,
            fontSize: "18px",
            fontStyle: "italic",
            marginBottom: "16px"
          }}>Budget</h3>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "13px",
            marginBottom: "8px"
          }}>
            <span style={{ color: C.tm }}>Spent</span>
            <span style={{ color: C.ok, fontFamily: FN.m }}>${spent.toFixed(2)}</span>
          </div>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "13px",
            marginBottom: "12px"
          }}>
            <span style={{ color: C.tm }}>Cap</span>
            <span style={{ fontFamily: FN.m }}>${pay.monthlyBudget}</span>
          </div>
          <div style={{
            height: "8px",
            background: C.bg,
            borderRadius: "4px",
            overflow: "hidden"
          }}>
            <div style={{
              height: "100%",
              borderRadius: "4px",
              width: Math.min(100, (spent / pay.monthlyBudget) * 100) + "%",
              background: spent > pay.monthlyBudget * 0.8 ? C.dn : C.ac,
              transition: "width 0.4s"
            }} />
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   PROJECTS (with file upload)
   ═══════════════════════════════════════════════════ */

function ProjView({ projects, save, profile, jobs, runAnalyze, dismissJob, apps, runRefreshApp }) {
  const [edit, setEdit] = useState(null);
  const [viewAn, setViewAn] = useState(null);
  const [uploadErr, setUploadErr] = useState("");

  // Derive analyze status from global jobs
  const analyzeJobs = jobs.filter(j => j.kind === "analyze");
  const isAnalyzing = (projectId) => analyzeJobs.some(j => j.meta && j.meta.projectId === projectId && j.status === "running");
  const getAnalyzeError = (projectId) => {
    const errJob = analyzeJobs.find(j => j.meta && j.meta.projectId === projectId && j.status === "error");
    return errJob ? errJob : null;
  };
  const anyRunning = analyzeJobs.some(j => j.status === "running");

  const emptyForm = {
    title: "",
    logline: "",
    synopsis: "",
    genre: "",
    format: "Feature Film",
    stage: "Development",
    budget: "",
    runtime: "",
    targetAudience: "",
    themes: "",
    teamNotes: ""
  };

  const [form, setForm] = useState(emptyForm);
  const [files, setFiles] = useState([]);

  const openEdit = async (idx) => {
    if (idx === "new") {
      setForm(emptyForm);
      setFiles([]);
      setEdit("new");
    } else {
      setForm({ ...projects[idx] });
      const loaded = await loadProjectFiles(projects[idx].id);
      setFiles(loaded);
      setEdit(idx);
    }
    setUploadErr("");
  };

  const handleFileUpload = async (category, fileList) => {
    setUploadErr("");
    const newFiles = [];
    for (const file of fileList) {
      if (file.size > MAX_FILE_SIZE) {
        setUploadErr(file.name + " exceeds 4MB limit");
        continue;
      }
      try {
        const mediaType = getMediaType(file.name);
        const isText = mediaType === "text/plain";
        const data = isText
          ? await readFileAsText(file)
          : await readFileAsBase64(file);
        newFiles.push({
          id: Date.now().toString() + "-" + Math.random().toString(36).slice(2, 8),
          name: file.name,
          size: file.size,
          mediaType: mediaType,
          isText: isText,
          data: data,
          category: category,
          uploadedAt: new Date().toISOString()
        });
      } catch (err) {
        setUploadErr("Failed to read " + file.name);
      }
    }
    if (newFiles.length > 0) {
      setFiles([...files, ...newFiles]);
    }
  };

  const removeFile = (fileId) => {
    setFiles(files.filter(f => f.id !== fileId));
  };

  const doSave = async () => {
    if (!form.title.trim()) return;
    const projId = edit === "new"
      ? Date.now().toString()
      : (projects[edit] && projects[edit].id) || Date.now().toString();
    const proj = {
      ...form,
      id: projId,
      fileCount: files.length,
      analysis: edit === "new" ? null : (projects[edit] && projects[edit].analysis) || null
    };
    await saveProjectFiles(projId, files);
    const updated = edit === "new"
      ? [...projects, proj]
      : projects.map((p, i) => i === edit ? proj : p);
    save(updated);
    setEdit(null);
  };

  const doDelete = async () => {
    if (edit === "new") return;
    const proj = projects[edit];
    if (proj && proj.id) {
      await deleteProjectFiles(proj.id);
    }
    save(projects.filter((_, i) => i !== edit));
    setEdit(null);
  };


  /* ── VIEW ANALYSIS ── */
  if (viewAn !== null && projects[viewAn]) {
    const p = projects[viewAn];
    const a = p.analysis;
    return (
      <div>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "24px"
        }}>
          <Btn variant="ghost" onClick={() => setViewAn(null)} small>← Back</Btn>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontFamily: FN.d, fontSize: "24px", fontStyle: "italic" }}>
              {p.title}
            </h2>
            <p style={{ color: C.tm, fontSize: "12px" }}>
              Intelligence Report
              {a && a.basedOnFiles > 0 && " · Based on " + a.basedOnFiles + " uploaded file(s)"}
            </p>
          </div>
          <Btn
            variant="teal"
            small
            onClick={() => runAnalyze(p.id)}
            disabled={isAnalyzing(p.id)}
          >{isAnalyzing(p.id) ? "Analyzing..." : "↻ Re-analyze"}</Btn>
        </div>

        {isAnalyzing(p.id) && <Loader text="Running deep analysis with your uploaded materials..." />}

        {(() => {
          if (!a || !apps) return null;
          const staleForThis = apps.filter(ap => {
            if (ap.status === "submitted") return false;
            if (ap.projTitle !== p.title) return false;
            if (!a.analyzedAt) return false;
            const analyzedAt = new Date(a.analyzedAt).getTime();
            const appUpdatedAt = new Date(ap.refreshedAt || ap.createdAt).getTime();
            return analyzedAt > appUpdatedAt;
          });
          if (staleForThis.length === 0) return null;
          return (
            <Card style={{
              marginBottom: "16px",
              borderColor: C.wn + "50",
              background: C.wn + "08"
            }}>
              <div style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: "16px",
                flexWrap: "wrap"
              }}>
                <div style={{ flex: 1, minWidth: "240px" }}>
                  <p style={{ fontSize: "14px", fontWeight: 600, marginBottom: "6px" }}>
                    🔄 {staleForThis.length} application{staleForThis.length > 1 ? "s" : ""} can be refreshed
                  </p>
                  <p style={{ fontSize: "12px", color: C.tm, lineHeight: 1.5, marginBottom: "10px" }}>
                    These drafts were created before the latest analysis. You can refresh them individually from the Applications tab, or augment them all now with the new intelligence.
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    {staleForThis.map(ap => (
                      <p key={ap.id} style={{ fontSize: "12px", color: C.tx }}>
                        • {ap.oppName} <span style={{ color: C.tm }}>({ap.status})</span>
                      </p>
                    ))}
                  </div>
                </div>
                <Btn
                  variant="teal"
                  small
                  onClick={() => {
                    staleForThis.forEach(ap => runRefreshApp(ap.id, "augment"));
                  }}
                >✨ Augment All</Btn>
              </div>
            </Card>
          );
        })()}

        {!a && !isAnalyzing(p.id) && (
          <Blank
            icon="🔬"
            title="Not analyzed"
            sub="Run AI analysis to generate artistic and market intelligence."
            action={<Btn onClick={() => runAnalyze(p.id)}>Analyze</Btn>}
          />
        )}

        {a && !isAnalyzing(p.id) && (
          <div>
            <Card style={{ marginBottom: "16px", borderColor: C.pp + "30" }}>
              <h3 style={{
                fontFamily: FN.d,
                fontSize: "20px",
                fontStyle: "italic",
                marginBottom: "20px"
              }}>🎨 Artistic Profile</h3>
              {a.artistic && Object.entries(a.artistic).map(([k, v]) => (
                <InfoBlock
                  key={k}
                  label={k.replace(/([A-Z])/g, " $1").trim()}
                  content={v}
                  color={C.pp}
                />
              ))}
            </Card>

            <Card style={{ marginBottom: "16px", borderColor: C.ac + "30" }}>
              <h3 style={{
                fontFamily: FN.d,
                fontSize: "20px",
                fontStyle: "italic",
                marginBottom: "20px"
              }}>📊 Market Intelligence</h3>
              {a.market && Object.entries(a.market).map(([k, v]) => (
                <InfoBlock
                  key={k}
                  label={k.replace(/([A-Z])/g, " $1").trim()}
                  content={v}
                  color={C.ac}
                />
              ))}
            </Card>

            <Card style={{ borderColor: C.tl + "30" }}>
              <h3 style={{
                fontFamily: FN.d,
                fontSize: "20px",
                fontStyle: "italic",
                marginBottom: "20px"
              }}>🎯 Submission Strategy</h3>
              {a.strategy && Object.entries(a.strategy).map(([k, v]) => (
                <InfoBlock
                  key={k}
                  label={k.replace(/([A-Z])/g, " $1").trim()}
                  content={v}
                  color={k === "risks" ? C.wn : C.tl}
                />
              ))}
            </Card>
          </div>
        )}
      </div>
    );
  }

  /* ── EDIT FORM ── */
  if (edit !== null) {
    return (
      <div>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "28px"
        }}>
          <Btn variant="ghost" onClick={() => setEdit(null)} small>← Back</Btn>
          <h2 style={{ fontFamily: FN.d, fontSize: "26px", fontStyle: "italic" }}>
            {edit === "new" ? "New Project" : "Edit: " + form.title}
          </h2>
        </div>

        <Card style={{ marginBottom: "16px" }}>
          <h3 style={{
            fontFamily: FN.m,
            fontSize: "11px",
            color: C.tm,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            marginBottom: "16px"
          }}>Project Details</h3>
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px"
          }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={LS}>Title *</label>
              <input
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. An Illustration of Hell"
              />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={LS}>Logline</label>
              <input
                value={form.logline}
                onChange={e => setForm({ ...form, logline: e.target.value })}
                placeholder="One-sentence summary"
              />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={LS}>Synopsis</label>
              <textarea
                rows={4}
                value={form.synopsis}
                onChange={e => setForm({ ...form, synopsis: e.target.value })}
                placeholder="Detailed synopsis..."
              />
            </div>
            <div>
              <label style={LS}>Genre</label>
              <input
                value={form.genre}
                onChange={e => setForm({ ...form, genre: e.target.value })}
              />
            </div>
            <div>
              <label style={LS}>Format</label>
              <select
                value={form.format}
                onChange={e => setForm({ ...form, format: e.target.value })}
              >
                {["Feature Film", "Short Film", "Documentary", "Animation", "Series / Pilot", "Experimental"].map(f => (
                  <option key={f}>{f}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={LS}>Stage</label>
              <select
                value={form.stage}
                onChange={e => setForm({ ...form, stage: e.target.value })}
              >
                {["Development", "Pre-Production", "Production", "Post-Production", "Completed"].map(s => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={LS}>Budget</label>
              <input
                value={form.budget}
                onChange={e => setForm({ ...form, budget: e.target.value })}
              />
            </div>
            <div>
              <label style={LS}>Runtime</label>
              <input
                value={form.runtime}
                onChange={e => setForm({ ...form, runtime: e.target.value })}
              />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={LS}>Target Audience</label>
              <input
                value={form.targetAudience}
                onChange={e => setForm({ ...form, targetAudience: e.target.value })}
              />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={LS}>Themes & Keywords</label>
              <input
                value={form.themes}
                onChange={e => setForm({ ...form, themes: e.target.value })}
              />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={LS}>Team Notes</label>
              <textarea
                rows={2}
                value={form.teamNotes}
                onChange={e => setForm({ ...form, teamNotes: e.target.value })}
              />
            </div>
          </div>
        </Card>

        {/* FILE UPLOADS */}
        <Card style={{ marginBottom: "16px", borderColor: C.pp + "30" }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "8px"
          }}>
            <span style={{ fontSize: "18px" }}>📎</span>
            <h3 style={{
              fontFamily: FN.m,
              fontSize: "11px",
              color: C.pp,
              letterSpacing: "0.06em",
              textTransform: "uppercase"
            }}>Project Materials</h3>
          </div>
          <p style={{
            fontSize: "12px",
            color: C.tm,
            marginBottom: "16px",
            lineHeight: 1.6
          }}>
            Upload supporting materials. The AI will analyze these directly when generating your project intelligence report and applications. Max 4MB per file. <strong style={{ color: C.wn }}>PDFs limited to 100 pages</strong> — for longer screenplays, upload as .txt instead.
          </p>

          {FILE_CATEGORIES.map(cat => {
            const catFiles = files.filter(f => f.category === cat.id);
            return (
              <div key={cat.id} style={{ marginBottom: "12px" }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "6px"
                }}>
                  <label style={{
                    fontSize: "13px",
                    color: C.tx,
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}>
                    <span>{cat.icon}</span>
                    {cat.label}
                    <span style={{ fontSize: "11px", color: C.td }}>({cat.hint})</span>
                  </label>
                  <label
                    htmlFor={"upload-" + cat.id}
                    style={{
                      cursor: "pointer",
                      fontSize: "12px",
                      color: C.ac,
                      fontFamily: FN.m,
                      padding: "4px 10px",
                      border: "1px solid " + C.ac + "40",
                      borderRadius: "4px"
                    }}
                  >
                    + Upload
                  </label>
                  <input
                    id={"upload-" + cat.id}
                    type="file"
                    accept={cat.accept}
                    multiple
                    onChange={e => {
                      if (e.target.files && e.target.files.length > 0) {
                        handleFileUpload(cat.id, Array.from(e.target.files));
                        e.target.value = "";
                      }
                    }}
                  />
                </div>
                {catFiles.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    {catFiles.map(f => (
                      <div
                        key={f.id}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "8px 12px",
                          background: C.bg,
                          borderRadius: "6px",
                          fontSize: "12px"
                        }}
                      >
                        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                          <span style={{ color: C.tx }}>{f.name}</span>
                          <span style={{ color: C.td, fontFamily: FN.m }}>
                            {formatFileSize(f.size)}
                          </span>
                        </div>
                        <button
                          onClick={() => removeFile(f.id)}
                          style={{
                            background: "none",
                            border: "none",
                            color: C.dn,
                            cursor: "pointer",
                            fontSize: "14px"
                          }}
                        >×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {uploadErr && (
            <p style={{ color: C.dn, fontSize: "12px", marginTop: "10px" }}>
              ⚠ {uploadErr}
            </p>
          )}

          {files.length > 0 && (
            <div style={{
              marginTop: "12px",
              padding: "10px 12px",
              background: C.pp + "08",
              border: "1px solid " + C.pp + "20",
              borderRadius: "6px"
            }}>
              <p style={{ fontSize: "12px", color: C.pp }}>
                ✓ {files.length} file(s) attached · Total: {formatFileSize(files.reduce((s, f) => s + f.size, 0))}
              </p>
            </div>
          )}
        </Card>

        <div style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "16px"
        }}>
          <div>
            {edit !== "new" && (
              <Btn variant="danger" onClick={doDelete}>Delete</Btn>
            )}
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <Btn variant="secondary" onClick={() => setEdit(null)}>Cancel</Btn>
            <Btn onClick={doSave} disabled={!form.title.trim()}>Save Project</Btn>
          </div>
        </div>
      </div>
    );
  }

  /* ── LIST ── */
  return (
    <div>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "28px"
      }}>
        <div>
          <h2 style={{ fontFamily: FN.d, fontSize: "26px", fontStyle: "italic" }}>
            Projects
          </h2>
          <p style={{ color: C.tm, fontSize: "13px", marginTop: "4px" }}>
            Add projects with supporting materials, then run AI analysis
          </p>
        </div>
        <Btn onClick={() => openEdit("new")}>+ New Project</Btn>
      </div>

      {anyRunning && (
        <Card style={{ marginBottom: "16px", borderColor: C.tl + "50" }}>
          <p style={{ fontSize: "13px", color: C.tl, fontFamily: FN.m, marginBottom: "8px" }}>
            ⏳ {analyzeJobs.filter(j => j.status === "running").length} analysis running in background — feel free to switch tabs
          </p>
          {analyzeJobs.filter(j => j.status === "running").map(j => (
            <p key={j.id} style={{ fontSize: "12px", color: C.tm, marginTop: "4px" }}>• {j.label}</p>
          ))}
        </Card>
      )}

      {analyzeJobs.filter(j => j.status === "error").map(j => (
        <Card key={j.id} style={{ marginBottom: "16px", borderColor: C.dn + "50", background: C.dn + "08" }}>
          <p style={{ fontSize: "13px", color: C.dn, marginBottom: "8px", fontWeight: 600 }}>
            ⚠ Analysis failed: {j.label}
          </p>
          <p style={{ fontSize: "12px", color: C.tx, lineHeight: 1.6, marginBottom: "10px" }}>
            {j.error}
          </p>
          <Btn variant="ghost" small onClick={() => dismissJob(j.id)}>Dismiss</Btn>
        </Card>
      ))}

      {!projects.length ? (
        <Blank
          icon="◉"
          title="No projects"
          sub="Add upcoming films with screenplays, pitch decks, and other materials to unlock deep AI analysis."
          action={<Btn onClick={() => openEdit("new")}>+ Add Project</Btn>}
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {projects.map((p, i) => (
            <Card key={p.id || i}>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start"
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "6px",
                    flexWrap: "wrap"
                  }}>
                    <h3 style={{
                      fontFamily: FN.d,
                      fontSize: "20px",
                      fontStyle: "italic"
                    }}>{p.title}</h3>
                    {p.analysis ? (
                      <Bdg color={C.tl}>ANALYZED</Bdg>
                    ) : (
                      <Bdg color={C.td}>NEEDS ANALYSIS</Bdg>
                    )}
                    {p.fileCount > 0 && (
                      <Bdg color={C.pp}>📎 {p.fileCount} FILES</Bdg>
                    )}
                  </div>
                  {p.logline && (
                    <p style={{
                      color: C.tm,
                      fontSize: "13px",
                      marginBottom: "10px",
                      lineHeight: 1.5
                    }}>{p.logline}</p>
                  )}
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    <Bdg>{p.format}</Bdg>
                    <Bdg color={C.pp}>{p.stage}</Bdg>
                    {p.genre && <Bdg color={C.wn}>{p.genre}</Bdg>}
                  </div>
                </div>
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  alignItems: "flex-end"
                }}>
                  <Btn
                    variant="ghost"
                    small
                    onClick={() => openEdit(i)}
                  >Edit</Btn>
                  {p.analysis ? (
                    <Btn
                      variant="ghost"
                      small
                      onClick={() => setViewAn(i)}
                      style={{ color: C.tl }}
                    >Analysis →</Btn>
                  ) : (
                    <Btn
                      variant="teal"
                      small
                      onClick={() => runAnalyze(p.id)}
                      disabled={isAnalyzing(p.id)}
                    >{isAnalyzing(p.id) ? "⏳ Analyzing..." : "🔬 Analyze"}</Btn>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   DISCOVER
   ═══════════════════════════════════════════════════ */

function DiscView({
  profile, projects, opps, save, apps,
  jobs, runSearch, dismissJob,
  searchResults, setSearchResults,
  searchProjectIdx, setSearchProjectIdx,
  searchFilter, setSearchFilter,
  searchQuery, setSearchQuery,
  searchError, setSearchError
}) {
  // Derive busy state and errors from global jobs
  const searchJobs = jobs.filter(j => j.kind === "search");
  const busy = searchJobs.some(j => j.status === "running");
  const errJobs = searchJobs.filter(j => j.status === "error");
  const sel = searchProjectIdx;
  const filter = searchFilter;
  const query = searchQuery;
  const results = searchResults;
  const err = searchError;
  const setSel = setSearchProjectIdx;
  const setFilter = setSearchFilter;
  const setQuery = setSearchQuery;

  const search = () => {
    if (!projects.length) {
      setSearchError("Add a project first.");
      return;
    }
    runSearch(sel, filter, query);
  };

  const isSaved = (o) => opps.some(
    s => s.name === o.name && s.organization === o.organization
  );

  const toggle = (o) => {
    if (isSaved(o)) {
      save(opps.filter(
        s => !(s.name === o.name && s.organization === o.organization)
      ));
    } else {
      save([...opps, { ...o, savedAt: new Date().toISOString() }]);
    }
  };

  const selectedProj = projects[sel];
  const hasAnalysis = selectedProj && selectedProj.analysis;

  return (
    <div>
      <div style={{ marginBottom: "28px" }}>
        <h2 style={{ fontFamily: FN.d, fontSize: "26px", fontStyle: "italic" }}>
          Discover
        </h2>
        <p style={{ color: C.tm, fontSize: "13px", marginTop: "4px" }}>
          {hasAnalysis ? "🔬 Analysis-powered search" : "Search for opportunities"}
        </p>
      </div>

      {selectedProj && !hasAnalysis && (
        <Card style={{
          marginBottom: "16px",
          borderColor: C.tl + "30",
          background: C.tl + "06"
        }}>
          <p style={{ fontSize: "13px", color: C.tl }}>
            💡 <strong>{selectedProj.title}</strong> isn't analyzed yet. Run analysis for dramatically better-matched results.
          </p>
        </Card>
      )}

      {selectedProj && (() => {
        const existingCount = (apps || []).filter(ap =>
          ap.projTitle === selectedProj.title &&
          (ap.status === "submitted" || ap.status === "approved" || ap.status === "draft")
        ).length;
        return (
          <Card style={{
            marginBottom: "16px",
            borderColor: C.pp + "30",
            background: C.pp + "06"
          }}>
            <p style={{ fontSize: "13px", color: C.tx, lineHeight: 1.5 }}>
              🎯 Searching for opportunities that accept projects in <strong style={{ color: C.pp }}>{selectedProj.stage}</strong> stage only. Results for other stages will be excluded.
            </p>
            {existingCount > 0 && (
              <p style={{ fontSize: "12px", color: C.tm, lineHeight: 1.5, marginTop: "8px" }}>
                🚫 Also excluding <strong style={{ color: C.tx }}>{existingCount} opportunit{existingCount === 1 ? "y" : "ies"}</strong> you've already applied to <strong style={{ color: C.tx }}>with this project</strong>. The same opportunity can still appear for other projects.
              </p>
            )}
          </Card>
        );
      })()}

      <Card style={{ marginBottom: "20px" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "12px",
          marginBottom: "14px"
        }}>
          <div>
            <label style={LS}>Project</label>
            <select value={sel} onChange={e => setSel(parseInt(e.target.value))}>
              {!projects.length ? (
                <option>No projects</option>
              ) : (
                projects.map((p, i) => (
                  <option key={i} value={i}>
                    {p.title}{p.analysis ? " 🔬" : ""}
                  </option>
                ))
              )}
            </select>
          </div>
          <div>
            <label style={LS}>Type</label>
            <select value={filter} onChange={e => setFilter(e.target.value)}>
              {["All", "Grants", "Festivals", "Labs", "Fellowships", "Residencies"].map(t => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Optional refinement..."
            onKeyDown={e => e.key === "Enter" && search()}
          />
          <Btn
            onClick={search}
            disabled={busy || !projects.length}
            style={{ whiteSpace: "nowrap" }}
          >{busy ? "..." : "◎ Search"}</Btn>
        </div>
        {err && (
          <p style={{ color: C.dn, fontSize: "13px", marginTop: "10px" }}>{err}</p>
        )}
      </Card>

      {busy && <Loader text="Searching..." />}

      {!busy && results.length > 0 && (
        <div>
          <p style={{
            fontFamily: FN.m,
            fontSize: "11px",
            color: C.td,
            marginBottom: "14px"
          }}>{results.length} FOUND · SORTED BY MATCH</p>
          {results.map((o, i) => {
            const mc = {
              strong: C.ok,
              moderate: C.wn,
              speculative: C.td
            };
            const existingApp = apps && selectedProj && apps.find(ap =>
              ap.projTitle === selectedProj.title &&
              (ap.oppName || "").toLowerCase().trim() === (o.name || "").toLowerCase().trim() &&
              (ap.oppOrg || "").toLowerCase().trim() === (o.organization || "").toLowerCase().trim()
            );
            return (
              <Card key={i} style={{ marginBottom: "12px" }}>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "10px"
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "6px",
                      flexWrap: "wrap"
                    }}>
                      <h3 style={{
                        fontFamily: FN.d,
                        fontSize: "18px",
                        fontStyle: "italic"
                      }}>{o.name}</h3>
                      <Bdg color={
                        o.type === "Grant" ? C.ac :
                        o.type === "Festival" ? C.pp :
                        C.ok
                      }>{o.type}</Bdg>
                      <Bdg color={mc[o.matchStrength] || C.td}>
                        {o.matchStrength}
                      </Bdg>
                      {existingApp && (
                        <Bdg color={
                          existingApp.status === "submitted" ? C.ok :
                          existingApp.status === "approved" ? C.ac :
                          C.wn
                        }>
                          {existingApp.status === "submitted" ? "✓ SUBMITTED" :
                           existingApp.status === "approved" ? "✓ APPROVED" :
                           "⚠ DRAFTED"}
                        </Bdg>
                      )}
                      {o.submissionFee && o.submissionFee !== "Free" && o.submissionFee !== "$0" ? (
                        <Bdg color={C.wn}>Fee: {o.submissionFee}</Bdg>
                      ) : (
                        <Bdg color={C.ok}>FREE</Bdg>
                      )}
                    </div>
                    <p style={{ color: C.tm, fontSize: "12px", fontFamily: FN.m }}>
                      {o.organization}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: "6px" }}>
                    {o.url && (
                      <Btn
                        variant="ghost"
                        small
                        onClick={() => window.open(o.url, "_blank")}
                      >↗</Btn>
                    )}
                    <Btn
                      variant={isSaved(o) ? "ghost" : "secondary"}
                      small
                      onClick={() => toggle(o)}
                      style={isSaved(o) ? { color: C.ac } : {}}
                    >{isSaved(o) ? "✓" : "+"}</Btn>
                  </div>
                </div>
                <p style={{
                  fontSize: "13px",
                  lineHeight: 1.6,
                  marginBottom: "10px"
                }}>{o.description}</p>
                <div style={{
                  background: (mc[o.matchStrength] || C.ac) + "08",
                  border: "1px solid " + (mc[o.matchStrength] || C.ac) + "20",
                  borderRadius: "6px",
                  padding: "10px 12px",
                  marginBottom: "10px"
                }}>
                  <p style={{
                    fontSize: "11px",
                    fontFamily: FN.m,
                    color: mc[o.matchStrength] || C.ad,
                    marginBottom: "4px"
                  }}>WHY THIS FITS</p>
                  <p style={{ fontSize: "13px", lineHeight: 1.5 }}>{o.matchReason}</p>
                </div>
                {o.stageEligibility && (
                  <div style={{
                    background: C.tl + "08",
                    border: "1px solid " + C.tl + "20",
                    borderRadius: "6px",
                    padding: "10px 12px",
                    marginBottom: "10px"
                  }}>
                    <p style={{
                      fontSize: "11px",
                      fontFamily: FN.m,
                      color: C.tl,
                      marginBottom: "4px"
                    }}>STAGE MATCH</p>
                    <p style={{ fontSize: "12px", lineHeight: 1.5, color: C.tm }}>{o.stageEligibility}</p>
                  </div>
                )}
                <div style={{
                  display: "flex",
                  gap: "16px",
                  fontSize: "12px",
                  color: C.tm,
                  flexWrap: "wrap"
                }}>
                  <span>
                    <strong style={{ color: C.tx }}>Deadline:</strong> {o.deadline}
                  </span>
                  {o.amount && o.amount !== "N/A" && (
                    <span>
                      <strong style={{ color: C.tx }}>Amount:</strong> {o.amount}
                    </span>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {!busy && !results.length && (
        <Blank
          icon="◎"
          title="Ready"
          sub="Select a project and search for opportunities."
        />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   DEADLINES
   ═══════════════════════════════════════════════════ */

function DeadView({ deadlines, opps, save, go }) {
  const [mode, setMode] = useState("upcoming");
  const [calMdl, setCalMdl] = useState(null);
  const [calDate, setCalDate] = useState("");
  const [remind, setRemind] = useState("7");

  const filtered = deadlines.filter(d => {
    if (mode === "upcoming") return d.dl === null || d.dl >= 0;
    if (mode === "past") return d.dl !== null && d.dl < 0;
    return true;
  });

  const groups = {};
  filtered.forEach(d => {
    let g;
    if (d.dl === null) g = "No Date";
    else if (d.dl < 0) g = "Past";
    else if (d.dl <= 7) g = "This Week";
    else if (d.dl <= 30) g = "This Month";
    else if (d.dl <= 90) g = "Next 3 Months";
    else g = "Later";
    if (!groups[g]) groups[g] = [];
    groups[g].push(d);
  });

  const order = ["This Week", "This Month", "Next 3 Months", "Later", "No Date", "Past"];
  const calItem = calMdl !== null ? deadlines[calMdl] : null;

  const markSynced = (name, org) => {
    save(opps.map(o =>
      o.name === name && o.organization === org
        ? { ...o, calendarSynced: true }
        : o
    ));
  };

  return (
    <div>
      <div style={{ marginBottom: "28px" }}>
        <h2 style={{ fontFamily: FN.d, fontSize: "26px", fontStyle: "italic" }}>
          Deadlines
        </h2>
        <p style={{ color: C.tm, fontSize: "13px", marginTop: "4px" }}>
          Track and sync to calendar
        </p>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "10px",
        marginBottom: "20px"
      }}>
        {[
          { l: "This Week", v: deadlines.filter(d => d.dl !== null && d.dl >= 0 && d.dl <= 7).length, c: C.dn },
          { l: "This Month", v: deadlines.filter(d => d.dl !== null && d.dl > 7 && d.dl <= 30).length, c: C.wn },
          { l: "Upcoming", v: deadlines.filter(d => d.dl !== null && d.dl > 30).length, c: C.tl },
          { l: "Synced", v: opps.filter(o => o.calendarSynced).length, c: C.pp }
        ].map(s => (
          <div key={s.l} style={{
            background: C.sf,
            border: "1px solid " + C.bd,
            borderRadius: "8px",
            padding: "14px",
            textAlign: "center"
          }}>
            <p style={{
              fontFamily: FN.m,
              fontSize: "9px",
              color: C.td,
              marginBottom: "6px"
            }}>{s.l}</p>
            <p style={{
              fontFamily: FN.d,
              fontSize: "24px",
              color: s.c,
              fontStyle: "italic"
            }}>{s.v}</p>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: "6px", marginBottom: "20px" }}>
        {["upcoming", "all", "past"].map(f => (
          <Btn
            key={f}
            variant={mode === f ? "primary" : "secondary"}
            small
            onClick={() => setMode(f)}
            style={{ textTransform: "capitalize" }}
          >{f}</Btn>
        ))}
      </div>

      <Card style={{
        marginBottom: "20px",
        borderColor: C.pp + "30",
        background: C.pp + "06"
      }}>
        <p style={{ fontSize: "13px", lineHeight: 1.5 }}>
          📅 Click <strong style={{ color: C.pp }}>+ Cal</strong> on any deadline, then ask Claude to sync it to your calendar.
        </p>
      </Card>

      {!filtered.length ? (
        <Blank
          icon="◷"
          title="No deadlines"
          sub="Save opportunities from Discover."
          action={<Btn onClick={() => go("disc")}>◎ Discover</Btn>}
        />
      ) : (
        <div>
          {order.filter(g => groups[g]).map(group => (
            <div key={group} style={{ marginBottom: "24px" }}>
              <p style={{
                fontFamily: FN.m,
                fontSize: "12px",
                color: group === "This Week" || group === "Past" ? C.dn : group === "This Month" ? C.wn : C.tm,
                letterSpacing: "0.06em",
                marginBottom: "12px"
              }}>{group} ({groups[group].length})</p>
              {groups[group].map((d, i) => {
                const idx = deadlines.indexOf(d);
                return (
                  <div key={i} style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    padding: "14px 18px",
                    background: C.sf,
                    borderRadius: "10px",
                    border: "1px solid " + C.bd,
                    borderLeft: "4px solid " + d.ug.color,
                    marginBottom: "8px"
                  }}>
                    <div style={{ minWidth: "50px", textAlign: "center" }}>
                      <p style={{
                        fontFamily: FN.m,
                        fontSize: "18px",
                        fontWeight: 700,
                        color: d.ug.color
                      }}>{d.ug.label}</p>
                      {d.pd && (
                        <p style={{
                          fontSize: "10px",
                          color: C.td,
                          marginTop: "2px"
                        }}>
                          {d.pd.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </p>
                      )}
                    </div>
                    <div style={{ width: "1px", height: "36px", background: C.bd }} />
                    <div style={{ flex: 1 }}>
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginBottom: "4px",
                        flexWrap: "wrap"
                      }}>
                        <p style={{ fontSize: "15px", fontWeight: 500 }}>{d.name}</p>
                        <Bdg color={
                          d.type === "Grant" ? C.ac :
                          d.type === "Festival" ? C.pp :
                          C.ok
                        }>{d.type}</Bdg>
                        {d.appSt && (
                          <Bdg color={d.appSt === "submitted" ? C.ok : C.wn}>
                            {d.appSt}
                          </Bdg>
                        )}
                        {d.calendarSynced && <span title="Synced">📅</span>}
                      </div>
                      <p style={{ fontSize: "12px", color: C.tm }}>
                        {d.organization}
                        {d.submissionFee && d.submissionFee !== "Free" ? " · Fee: " + d.submissionFee : " · Free"}
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: "6px" }}>
                      {d.url && (
                        <Btn
                          variant="ghost"
                          small
                          onClick={() => window.open(d.url, "_blank")}
                        >↗</Btn>
                      )}
                      {!d.appSt && (
                        <Btn
                          variant="ghost"
                          small
                          onClick={() => go("apps")}
                          style={{ color: C.ac }}
                        >Apply</Btn>
                      )}
                      <Btn
                        variant={d.calendarSynced ? "ghost" : "cal"}
                        small
                        onClick={() => {
                          setCalMdl(idx);
                          setCalDate(d.pd ? d.pd.toISOString().split("T")[0] : "");
                        }}
                        style={d.calendarSynced ? { color: C.pp } : {}}
                      >
                        {d.calendarSynced ? "📅" : "+ Cal"}
                      </Btn>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      <Mdl
        open={calMdl !== null}
        onClose={() => setCalMdl(null)}
        title="Add to Calendar"
        width="480px"
      >
        {calItem && (
          <div>
            <div style={{
              background: C.bg,
              borderRadius: "8px",
              padding: "16px",
              marginBottom: "20px"
            }}>
              <p style={{
                fontSize: "16px",
                fontWeight: 500,
                marginBottom: "4px"
              }}>{calItem.name}</p>
              <p style={{ fontSize: "12px", color: C.tm }}>{calItem.organization}</p>
              {calItem.pd && (
                <p style={{
                  fontSize: "13px",
                  color: C.ac,
                  marginTop: "8px",
                  fontFamily: FN.m
                }}>
                  {calItem.pd.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric"
                  })}
                </p>
              )}
            </div>
            <div style={{ marginBottom: "16px" }}>
              <label style={LS}>Date</label>
              <input
                type="date"
                value={calDate}
                onChange={e => setCalDate(e.target.value)}
              />
            </div>
            <div style={{ marginBottom: "20px" }}>
              <label style={LS}>Reminder</label>
              <select value={remind} onChange={e => setRemind(e.target.value)}>
                <option value="1">1 day before</option>
                <option value="3">3 days before</option>
                <option value="7">1 week before</option>
                <option value="14">2 weeks before</option>
                <option value="30">1 month before</option>
              </select>
            </div>
            <Card style={{
              borderColor: C.pp + "30",
              background: C.pp + "08",
              marginBottom: "16px"
            }}>
              <p style={{ fontSize: "13px", color: C.pp, lineHeight: 1.6 }}>
                📅 After closing, ask Claude: <strong>"Add the {calItem.name} deadline to my calendar with a {remind}-day reminder"</strong>
              </p>
            </Card>
            <div style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px"
            }}>
              <Btn variant="secondary" onClick={() => setCalMdl(null)}>Cancel</Btn>
              <Btn
                variant="cal"
                onClick={() => {
                  markSynced(calItem.name, calItem.organization);
                  setCalMdl(null);
                }}
              >✓ Mark Ready</Btn>
            </div>
          </div>
        )}
      </Mdl>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   APPLICATIONS
   ═══════════════════════════════════════════════════ */

function AppsView({ profile, projects, opps, apps, save, pay, jobs, runGenerate, dismissJob, runRefreshApp }) {
  const [selO, setSelO] = useState(null);
  const [selP, setSelP] = useState(0);
  const [view, setView] = useState(null);
  const [rvw, setRvw] = useState(null);
  const [limitOk, setLimitOk] = useState(false);
  const [submitMdl, setSubmitMdl] = useState(null);
  const [editingKey, setEditingKey] = useState(null);
  const [draftText, setDraftText] = useState("");
  const [refreshMdl, setRefreshMdl] = useState(null);
  const [listFilter, setListFilter] = useState("all");

  // Derive busy + errors from global jobs
  const generateJobs = jobs.filter(j => j.kind === "generate");
  const refreshJobs = jobs.filter(j => j.kind === "refresh");
  const busy = generateJobs.some(j => j.status === "running");
  const errJobs = generateJobs.filter(j => j.status === "error");
  const refreshErrJobs = refreshJobs.filter(j => j.status === "error");
  const isRefreshing = (appId) => refreshJobs.some(j => j.meta && j.meta.appId === appId && j.status === "running");

  // An app is "stale" if its project has been analyzed more recently than the app was created or last refreshed
  const isStale = (app) => {
    if (app.status === "submitted") return false;
    const p = projects.find(x => x.title === app.projTitle);
    if (!p || !p.analysis || !p.analysis.analyzedAt) return false;
    const analyzedAt = new Date(p.analysis.analyzedAt).getTime();
    const appUpdatedAt = new Date(app.refreshedAt || app.createdAt).getTime();
    return analyzedAt > appUpdatedAt;
  };

  const generate = () => {
    if (selO === null || !projects[selP]) return;
    runGenerate(selO, selP);
  };

  const setCheck = (idx, key, val) => {
    const u = [...apps];
    u[idx] = {
      ...u[idx],
      checks: { ...u[idx].checks, [key]: val }
    };
    save(u);
  };

  const approve = (idx) => {
    const a = apps[idx];
    if (!a.checks.content || !a.checks.cost || !a.checks.ready) return;
    if (a.cost > pay.spendingLimit && !limitOk) return;
    const u = [...apps];
    u[idx] = {
      ...u[idx],
      status: "approved",
      reviewedAt: new Date().toISOString()
    };
    save(u);
    setRvw(null);
    setLimitOk(false);
  };

  const doSubmit = (idx) => {
    const u = [...apps];
    u[idx] = {
      ...u[idx],
      status: "submitted",
      submittedAt: new Date().toISOString()
    };
    save(u);
    setSubmitMdl(null);
  };

  /* ── VIEW APP ── */
  if (view !== null && apps[view]) {
    const app = apps[view];
    const c = app.content;
    const sections = [
      { t: "Cover Letter", v: c.coverLetter, k: "coverLetter" },
      { t: "Project Statement", v: c.projectStatement, k: "projectStatement" },
      { t: "Artist Statement", v: c.artistStatement, k: "artistStatement" },
      { t: "Budget Justification", v: c.budgetJustification, k: "budgetJustification" },
      { t: "Impact Statement", v: c.impactStatement, k: "impactStatement" },
      { t: "Timeline", v: c.timeline, k: "timeline" }
    ].filter(s => s.v);
    const sc = { draft: C.wn, approved: C.ac, submitted: C.ok };
    const pm = pay.methods.find(m => m.id === app.payId);
    const canEdit = app.status !== "submitted";

    const startEdit = (key, currentVal) => {
      setEditingKey(key);
      setDraftText(currentVal || "");
    };

    const cancelEdit = () => {
      setEditingKey(null);
      setDraftText("");
    };

    const saveEdit = (key) => {
      const updated = [...apps];
      updated[view] = {
        ...updated[view],
        content: { ...updated[view].content, [key]: draftText },
        editedAt: new Date().toISOString(),
        // If they edit an approved app, drop back to draft so it gets re-reviewed
        status: updated[view].status === "approved" ? "draft" : updated[view].status,
        // Reset review checks if reverting to draft
        checks: updated[view].status === "approved"
          ? { content: false, cost: false, ready: false }
          : updated[view].checks
      };
      save(updated);
      setEditingKey(null);
      setDraftText("");
    };

    return (
      <div>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "24px"
        }}>
          <Btn variant="ghost" onClick={() => setView(null)} small>← Back</Btn>
          <div style={{ flex: 1 }}>
            <h2 style={{
              fontFamily: FN.d,
              fontSize: "22px",
              fontStyle: "italic"
            }}>{app.oppName}</h2>
            <p style={{ color: C.tm, fontSize: "12px" }}>
              {app.projTitle} · {new Date(app.createdAt).toLocaleDateString()}
              {app.hadAnalysis ? " · 🔬" : ""}
              {app.hadFiles ? " · 📎" : ""}
              {app.editedAt ? " · ✎ edited " + new Date(app.editedAt).toLocaleDateString() : ""}
              {app.refreshedAt ? " · 🔄 refreshed " + new Date(app.refreshedAt).toLocaleDateString() : ""}
            </p>
          </div>
          {isStale(app) && <Bdg color={C.wn}>STALE</Bdg>}
          <Bdg color={sc[app.status]}>{app.status}</Bdg>
        </div>

        <Card style={{
          marginBottom: "16px",
          borderColor: (sc[app.status] || C.wn) + "40"
        }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px"
          }}>
            <div style={{ display: "flex", gap: "28px", alignItems: "center" }}>
              <div>
                <p style={{ ...LS, marginBottom: "4px" }}>FEE</p>
                <p style={{
                  fontFamily: FN.d,
                  fontSize: "26px",
                  fontStyle: "italic",
                  color: app.cost > 0 ? C.wn : C.ok
                }}>
                  {app.cost > 0 ? "$" + app.cost.toFixed(2) : "FREE"}
                </p>
              </div>
              {pm && app.cost > 0 && (
                <div>
                  <p style={{ ...LS, marginBottom: "4px" }}>PAYMENT</p>
                  <p style={{ fontSize: "14px" }}>💳 {pm.label}</p>
                </div>
              )}
            </div>
            <div>
              {app.status === "draft" && (
                <Btn onClick={() => setRvw(view)}>Review & Approve</Btn>
              )}
              {app.status === "approved" && (
                <Btn
                  variant="success"
                  onClick={() => setSubmitMdl(view)}
                >
                  Submit{app.cost > 0 ? " ($" + app.cost.toFixed(2) + ")" : ""}
                </Btn>
              )}
              {app.status === "submitted" && (
                <span style={{ fontSize: "13px", color: C.ok, fontFamily: FN.m }}>
                  ✓ Submitted
                </span>
              )}
            </div>
          </div>
        </Card>

        {isStale(app) && (
          <Card style={{
            marginBottom: "12px",
            borderColor: C.wn + "50",
            background: C.wn + "08"
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px",
              flexWrap: "wrap"
            }}>
              <div style={{ flex: 1, minWidth: "240px" }}>
                <p style={{ fontSize: "14px", fontWeight: 600, marginBottom: "4px" }}>
                  ⚠ Stale — project has been re-analyzed
                </p>
                <p style={{ fontSize: "12px", color: C.tm, lineHeight: 1.5 }}>
                  The project intelligence has been updated since this application was created. You can refresh the draft to incorporate the new information.
                </p>
              </div>
              <Btn
                variant="teal"
                small
                onClick={() => setRefreshMdl(view)}
                disabled={isRefreshing(app.id)}
              >{isRefreshing(app.id) ? "🔄 Refreshing..." : "🔄 Refresh"}</Btn>
            </div>
          </Card>
        )}

        {app.changesSummary && (
          <Card style={{
            marginBottom: "12px",
            borderColor: C.tl + "40",
            background: C.tl + "06"
          }}>
            <p style={{
              fontFamily: FN.m,
              fontSize: "11px",
              color: C.tl,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              marginBottom: "8px"
            }}>🔄 Last Refresh ({app.refreshMode || "augment"})</p>
            <p style={{
              fontSize: "13px",
              lineHeight: 1.6,
              whiteSpace: "pre-wrap",
              color: C.tx
            }}>{app.changesSummary}</p>
          </Card>
        )}

        {sections.map((s, i) => {
          const isEditing = editingKey === s.k;
          return (
            <Card key={i} style={{ marginBottom: "12px" }}>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "12px"
              }}>
                <h3 style={{
                  fontFamily: FN.m,
                  fontSize: "11px",
                  color: C.ad,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase"
                }}>{s.t}</h3>
                {canEdit && !isEditing && (
                  <Btn
                    variant="ghost"
                    small
                    onClick={() => startEdit(s.k, s.v)}
                    style={{ color: C.tm }}
                  >✎ Edit</Btn>
                )}
              </div>
              {isEditing ? (
                <div>
                  <textarea
                    rows={Math.max(6, Math.min(20, (draftText.match(/\n/g) || []).length + 3))}
                    value={draftText}
                    onChange={e => setDraftText(e.target.value)}
                    style={{
                      fontSize: "14px",
                      lineHeight: 1.7,
                      fontFamily: FN.b
                    }}
                    autoFocus
                  />
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: "10px",
                    gap: "10px"
                  }}>
                    <p style={{ fontSize: "11px", color: C.tm, fontFamily: FN.m }}>
                      {draftText.length} chars · {draftText.trim().split(/\s+/).filter(Boolean).length} words
                      {app.status === "approved" && " · editing reverts to draft"}
                    </p>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <Btn variant="secondary" small onClick={cancelEdit}>Cancel</Btn>
                      <Btn small onClick={() => saveEdit(s.k)}>Save</Btn>
                    </div>
                  </div>
                </div>
              ) : (
                <p style={{
                  fontSize: "14px",
                  lineHeight: 1.7,
                  whiteSpace: "pre-wrap"
                }}>{s.v}</p>
              )}
            </Card>
          );
        })}

        {c.strategicNotes && (() => {
          const isEditing = editingKey === "strategicNotes";
          return (
            <Card style={{
              marginBottom: "12px",
              borderColor: C.tl + "30",
              background: C.tl + "06"
            }}>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "12px"
              }}>
                <h3 style={{
                  fontFamily: FN.m,
                  fontSize: "11px",
                  color: C.tl,
                  letterSpacing: "0.06em"
                }}>🎯 STRATEGIC NOTES (Internal)</h3>
                {canEdit && !isEditing && (
                  <Btn
                    variant="ghost"
                    small
                    onClick={() => startEdit("strategicNotes", c.strategicNotes)}
                    style={{ color: C.tl }}
                  >✎ Edit</Btn>
                )}
              </div>
              {isEditing ? (
                <div>
                  <textarea
                    rows={Math.max(4, Math.min(15, (draftText.match(/\n/g) || []).length + 3))}
                    value={draftText}
                    onChange={e => setDraftText(e.target.value)}
                    style={{ fontSize: "13px", lineHeight: 1.7 }}
                    autoFocus
                  />
                  <div style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "8px",
                    marginTop: "10px"
                  }}>
                    <Btn variant="secondary" small onClick={cancelEdit}>Cancel</Btn>
                    <Btn small onClick={() => saveEdit("strategicNotes")}>Save</Btn>
                  </div>
                </div>
              ) : (
                <p style={{
                  fontSize: "13px",
                  lineHeight: 1.7,
                  whiteSpace: "pre-wrap"
                }}>{c.strategicNotes}</p>
              )}
            </Card>
          );
        })()}

        <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
          <Btn
            variant="secondary"
            onClick={() => navigator.clipboard.writeText(
              sections.map(s => "## " + s.t + "\n\n" + s.v).join("\n\n---\n\n")
            )}
          >Copy All</Btn>
          <Btn
            variant="danger"
            onClick={() => {
              save(apps.filter((_, i) => i !== view));
              setView(null);
            }}
          >Delete</Btn>
        </div>

        <Mdl
          open={rvw !== null}
          onClose={() => { setRvw(null); setLimitOk(false); }}
          title="Review & Approve"
          width="600px"
        >
          {rvw !== null && apps[rvw] && (() => {
            const ra = apps[rvw];
            const noM = ra.cost > 0 && !pay.methods.length;
            const overLimit = ra.cost > pay.spendingLimit;
            const pmLabelObj = pay.methods.find(m => m.id === ra.payId);
            const pmLabel = pmLabelObj ? pmLabelObj.label : null;
            return (
              <div>
                <div style={{
                  background: C.bg,
                  borderRadius: "8px",
                  padding: "16px",
                  marginBottom: "20px",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "14px"
                }}>
                  <div>
                    <p style={LS}>OPPORTUNITY</p>
                    <p style={{ fontSize: "14px", marginTop: "4px" }}>{ra.oppName}</p>
                  </div>
                  <div>
                    <p style={LS}>PROJECT</p>
                    <p style={{ fontSize: "14px", marginTop: "4px" }}>{ra.projTitle}</p>
                  </div>
                  <div>
                    <p style={LS}>FEE (MAX)</p>
                    <p style={{
                      fontSize: "22px",
                      fontFamily: FN.d,
                      fontStyle: "italic",
                      marginTop: "4px",
                      color: ra.cost > 0 ? C.wn : C.ok
                    }}>
                      {ra.cost > 0 ? "$" + ra.cost.toFixed(2) : "FREE"}
                    </p>
                    {ra.feeLabel && ra.feeLabel !== "?" && (
                      <p style={{ fontSize: "11px", color: C.tm, fontFamily: FN.m, marginTop: "2px" }}>
                        listed as: {ra.feeLabel}
                      </p>
                    )}
                  </div>
                  <div>
                    <p style={LS}>PAYMENT</p>
                    <p style={{ fontSize: "14px", marginTop: "4px" }}>
                      {noM ? "⚠ None" : ra.cost === 0 ? "N/A" : "💳 " + (pmLabel || "?")}
                    </p>
                  </div>
                </div>

                {isFeeRange(ra.feeLabel) && (
                  <div style={{
                    background: C.wn + "10",
                    border: "1px solid " + C.wn + "30",
                    borderRadius: "6px",
                    padding: "12px",
                    marginBottom: "12px"
                  }}>
                    <p style={{ fontSize: "13px", color: C.wn, lineHeight: 1.5 }}>
                      💡 This fee is a <strong>range ({ra.feeLabel})</strong>. The app uses the maximum amount (${ra.cost.toFixed(2)}) for safety. The actual charge may be lower depending on submission timing, tier, or eligibility.
                    </p>
                  </div>
                )}

                {overLimit && (
                  <div style={{
                    background: C.dn + "10",
                    border: "1px solid " + C.dn + "30",
                    borderRadius: "6px",
                    padding: "12px",
                    marginBottom: "12px"
                  }}>
                    <p style={{
                      fontSize: "13px",
                      color: C.dn,
                      marginBottom: "8px"
                    }}>⚠ Exceeds limit (${pay.spendingLimit})</p>
                    <Chk
                      checked={limitOk}
                      onChange={setLimitOk}
                      label="I acknowledge this exceeds my limit"
                    />
                  </div>
                )}

                {noM && (
                  <div style={{
                    background: C.dn + "10",
                    border: "1px solid " + C.dn + "30",
                    borderRadius: "6px",
                    padding: "12px",
                    marginBottom: "12px"
                  }}>
                    <p style={{ fontSize: "13px", color: C.dn }}>
                      ⚠ No payment method
                    </p>
                  </div>
                )}

                <p style={{ ...LS, marginBottom: "12px" }}>CHECKLIST</p>
                <Chk
                  checked={ra.checks.content}
                  onChange={v => setCheck(rvw, "content", v)}
                  label="I reviewed all content"
                />
                <Chk
                  checked={ra.checks.cost}
                  onChange={v => setCheck(rvw, "cost", v)}
                  label={ra.cost > 0 ? "I approve $" + ra.cost.toFixed(2) : "Confirmed free"}
                />
                <Chk
                  checked={ra.checks.ready}
                  onChange={v => setCheck(rvw, "ready", v)}
                  label="Ready to submit"
                />

                <div style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                  marginTop: "20px"
                }}>
                  <Btn
                    variant="secondary"
                    onClick={() => { setRvw(null); setLimitOk(false); }}
                  >Cancel</Btn>
                  <Btn
                    onClick={() => approve(rvw)}
                    disabled={
                      !ra.checks.content ||
                      !ra.checks.cost ||
                      !ra.checks.ready ||
                      noM ||
                      (overLimit && !limitOk)
                    }
                  >✓ Approve</Btn>
                </div>
              </div>
            );
          })()}
        </Mdl>

        <Mdl
          open={submitMdl !== null}
          onClose={() => setSubmitMdl(null)}
          title="Confirm Submission"
          width="440px"
        >
          {submitMdl !== null && apps[submitMdl] && (
            <div>
              <p style={{
                fontSize: "14px",
                lineHeight: 1.6,
                marginBottom: "12px"
              }}>
                Submit <strong>{apps[submitMdl].oppName}</strong>?
              </p>
              {apps[submitMdl].cost > 0 ? (
                <div style={{
                  background: C.wn + "10",
                  border: "1px solid " + C.wn + "30",
                  borderRadius: "6px",
                  padding: "12px",
                  marginBottom: "16px"
                }}>
                  <p style={{ fontSize: "13px", color: C.tx, marginBottom: "4px" }}>
                    {isFeeRange(apps[submitMdl].feeLabel)
                      ? "Fee range: " + apps[submitMdl].feeLabel + " (max $" + apps[submitMdl].cost.toFixed(2) + " will be charged)"
                      : "Fee: $" + apps[submitMdl].cost.toFixed(2) + " will be charged"}
                  </p>
                </div>
              ) : (
                <p style={{ fontSize: "13px", color: C.ok, marginBottom: "16px" }}>This is a free submission.</p>
              )}
              <div style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px"
              }}>
                <Btn
                  variant="secondary"
                  onClick={() => setSubmitMdl(null)}
                >Cancel</Btn>
                <Btn
                  variant="success"
                  onClick={() => doSubmit(submitMdl)}
                >✓ Submit</Btn>
              </div>
            </div>
          )}
        </Mdl>

        <Mdl
          open={refreshMdl !== null}
          onClose={() => setRefreshMdl(null)}
          title="Refresh Application"
          width="520px"
        >
          {refreshMdl !== null && apps[refreshMdl] && (
            <div>
              <p style={{ fontSize: "13px", color: C.tm, lineHeight: 1.6, marginBottom: "16px" }}>
                The latest project analysis for <strong style={{ color: C.tx }}>{apps[refreshMdl].projTitle}</strong> will be used to update this draft. Choose how:
              </p>

              <div
                onClick={() => {
                  runRefreshApp(apps[refreshMdl].id, "augment");
                  setRefreshMdl(null);
                }}
                style={{
                  background: C.bg,
                  border: "1px solid " + C.tl + "40",
                  borderRadius: "8px",
                  padding: "16px",
                  marginBottom: "10px",
                  cursor: "pointer",
                  transition: "border-color 0.15s"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                  <span style={{ fontSize: "18px" }}>✨</span>
                  <h4 style={{ fontFamily: FN.d, fontSize: "17px", fontStyle: "italic", color: C.tl }}>
                    Augment (Recommended)
                  </h4>
                </div>
                <p style={{ fontSize: "12px", color: C.tm, lineHeight: 1.5, marginLeft: "28px" }}>
                  Surgical updates only. Preserves your voice, manual edits, and sections that already work. The AI will integrate new information (new collaborator, updated credits, fresh analysis) only where it meaningfully strengthens the draft, and return a summary of what changed.
                </p>
              </div>

              <div
                onClick={() => {
                  runRefreshApp(apps[refreshMdl].id, "regenerate");
                  setRefreshMdl(null);
                }}
                style={{
                  background: C.bg,
                  border: "1px solid " + C.wn + "40",
                  borderRadius: "8px",
                  padding: "16px",
                  marginBottom: "16px",
                  cursor: "pointer",
                  transition: "border-color 0.15s"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                  <span style={{ fontSize: "18px" }}>🔄</span>
                  <h4 style={{ fontFamily: FN.d, fontSize: "17px", fontStyle: "italic", color: C.wn }}>
                    Regenerate Fresh
                  </h4>
                </div>
                <p style={{ fontSize: "12px", color: C.tm, lineHeight: 1.5, marginLeft: "28px" }}>
                  Completely rewrite the entire application from scratch using the latest analysis. <strong style={{ color: C.wn }}>Any manual edits you made will be lost.</strong> Use this if the project has changed dramatically or you want a totally new angle.
                </p>
              </div>

              {apps[refreshMdl].status === "approved" && (
                <p style={{ fontSize: "11px", color: C.wn, marginBottom: "12px" }}>
                  ⚠ This application is currently approved. Refreshing will revert it to draft status.
                </p>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <Btn variant="secondary" onClick={() => setRefreshMdl(null)}>Cancel</Btn>
              </div>
            </div>
          )}
        </Mdl>
      </div>
    );
  }

  /* ── LIST ── */
  return (
    <div>
      <div style={{ marginBottom: "28px" }}>
        <h2 style={{ fontFamily: FN.d, fontSize: "26px", fontStyle: "italic" }}>
          Applications
        </h2>
      </div>
      <Card style={{ marginBottom: "24px" }}>
        <h3 style={{
          fontFamily: FN.d,
          fontSize: "18px",
          fontStyle: "italic",
          marginBottom: "14px"
        }}>Generate</h3>
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "12px",
          marginBottom: "14px"
        }}>
          <div>
            <label style={LS}>Opportunity</label>
            <select
              value={selO !== null ? selO : ""}
              onChange={e => setSelO(e.target.value === "" ? null : parseInt(e.target.value))}
            >
              <option value="">Select...</option>
              {opps.map((o, i) => (
                <option key={i} value={i}>
                  {o.name} — {o.submissionFee || "?"}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={LS}>Project</label>
            <select
              value={selP}
              onChange={e => setSelP(parseInt(e.target.value))}
            >
              {projects.map((p, i) => (
                <option key={i} value={i}>
                  {p.title}{p.analysis ? " 🔬" : ""}{p.fileCount > 0 ? " 📎" : ""}
                </option>
              ))}
            </select>
          </div>
        </div>
        <Btn
          onClick={generate}
          disabled={selO === null || !projects.length}
        >◆ Generate</Btn>
        {busy && (
          <p style={{ color: C.tl, fontSize: "12px", marginTop: "10px" }}>
            ⏳ {generateJobs.filter(j => j.status === "running").length} generation(s) running in background. You can keep working.
          </p>
        )}
        {errJobs.map(j => (
          <div key={j.id} style={{
            marginTop: "10px",
            padding: "10px 12px",
            background: C.dn + "10",
            border: "1px solid " + C.dn + "30",
            borderRadius: "6px"
          }}>
            <p style={{ color: C.dn, fontSize: "12px", marginBottom: "6px" }}>⚠ {j.label}: {j.error}</p>
            <Btn variant="ghost" small onClick={() => dismissJob(j.id)}>Dismiss</Btn>
          </div>
        ))}
      </Card>

      {!apps.length && !busy ? (
        <Blank
          icon="◆"
          title="No applications"
          sub="Generate from saved opportunities."
        />
      ) : (
        <div>
          {/* Summary strip */}
          {(() => {
            const counts = {
              all: apps.length,
              draft: apps.filter(a => a.status === "draft").length,
              approved: apps.filter(a => a.status === "approved").length,
              submitted: apps.filter(a => a.status === "submitted").length
            };
            const totalSubmitted = apps
              .filter(a => a.status === "submitted")
              .reduce((s, a) => s + (a.cost || 0), 0);
            const filterOptions = [
              { id: "all", label: "All", count: counts.all, color: C.tx },
              { id: "draft", label: "Drafts", count: counts.draft, color: C.wn },
              { id: "approved", label: "Approved", count: counts.approved, color: C.ac },
              { id: "submitted", label: "Submitted", count: counts.submitted, color: C.ok }
            ];
            return (
              <div>
                <Card style={{ marginBottom: "14px" }}>
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: "12px"
                  }}>
                    <div>
                      <p style={{ ...LS, marginBottom: "4px" }}>TOTAL</p>
                      <p style={{ fontFamily: FN.d, fontSize: "24px", fontStyle: "italic", color: C.tx }}>
                        {counts.all}
                      </p>
                    </div>
                    <div>
                      <p style={{ ...LS, marginBottom: "4px" }}>SUBMITTED</p>
                      <p style={{ fontFamily: FN.d, fontSize: "24px", fontStyle: "italic", color: C.ok }}>
                        {counts.submitted}
                      </p>
                    </div>
                    <div>
                      <p style={{ ...LS, marginBottom: "4px" }}>TOTAL SPENT</p>
                      <p style={{ fontFamily: FN.d, fontSize: "24px", fontStyle: "italic", color: C.wn }}>
                        ${totalSubmitted.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p style={{ ...LS, marginBottom: "4px" }}>STALE</p>
                      <p style={{ fontFamily: FN.d, fontSize: "24px", fontStyle: "italic", color: C.wn }}>
                        {apps.filter(isStale).length}
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Filter tabs */}
                <div style={{
                  display: "flex",
                  gap: "6px",
                  marginBottom: "14px",
                  flexWrap: "wrap"
                }}>
                  {filterOptions.map(f => (
                    <Btn
                      key={f.id}
                      variant={listFilter === f.id ? "primary" : "secondary"}
                      small
                      onClick={() => setListFilter(f.id)}
                    >
                      {f.label} ({f.count})
                    </Btn>
                  ))}
                </div>
              </div>
            );
          })()}

          {(() => {
            const filtered = listFilter === "all"
              ? apps
              : apps.filter(a => a.status === listFilter);
            // Sort: most recent first, using the most recent timestamp on each app
            const sorted = [...filtered].sort((a, b) => {
              const ta = new Date(a.submittedAt || a.refreshedAt || a.editedAt || a.createdAt).getTime();
              const tb = new Date(b.submittedAt || b.refreshedAt || b.editedAt || b.createdAt).getTime();
              return tb - ta;
            });
            if (sorted.length === 0) {
              return (
                <Blank
                  icon="◆"
                  title={"No " + listFilter + " applications"}
                  sub={listFilter === "submitted"
                    ? "Submitted applications will appear here for record-keeping."
                    : "Switch filters or generate new applications above."}
                />
              );
            }
            return (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {sorted.map((app) => {
                  const i = apps.indexOf(app);
                  return (
            <Card
              key={app.id}
              onClick={() => setView(i)}
              style={{ cursor: "pointer" }}
            >
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}>
                <div>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "4px"
                  }}>
                    <h3 style={{
                      fontFamily: FN.d,
                      fontSize: "17px",
                      fontStyle: "italic"
                    }}>{app.oppName}</h3>
                    {app.hadAnalysis && <span>🔬</span>}
                    {app.hadFiles && <span>📎</span>}
                    {isStale(app) && <Bdg color={C.wn}>STALE</Bdg>}
                    {app.cost > 0 ? (
                      <span style={{
                        fontFamily: FN.m,
                        fontSize: "12px",
                        color: C.wn
                      }}>${app.cost.toFixed(2)}</span>
                    ) : (
                      <Bdg color={C.ok}>FREE</Bdg>
                    )}
                  </div>
                  <p style={{ color: C.tm, fontSize: "12px" }}>
                    {app.projTitle} · {app.status === "submitted" && app.submittedAt
                      ? "submitted " + new Date(app.submittedAt).toLocaleDateString()
                      : "created " + new Date(app.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Bdg color={{ draft: C.wn, approved: C.ac, submitted: C.ok }[app.status]}>
                  {app.status}
                </Bdg>
              </div>
            </Card>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   PAYMENT
   ═══════════════════════════════════════════════════ */

function PayView({ pay, save, spent }) {
  const [addMdl, setAddMdl] = useState(false);
  const [cf, setCf] = useState({
    name: "", last4: "", type: "Visa", exp: "", label: ""
  });

  const addCard = () => {
    if (!cf.last4 || !cf.name) return;
    const m = {
      id: Date.now().toString(),
      label: cf.label || cf.type + " ····" + cf.last4,
      last4: cf.last4,
      type: cf.type,
      exp: cf.exp,
      name: cf.name
    };
    save({
      ...pay,
      methods: [...pay.methods, m],
      defaultMethodId: !pay.methods.length ? m.id : pay.defaultMethodId
    });
    setAddMdl(false);
    setCf({ name: "", last4: "", type: "Visa", exp: "", label: "" });
  };

  return (
    <div>
      <div style={{ marginBottom: "28px" }}>
        <h2 style={{ fontFamily: FN.d, fontSize: "26px", fontStyle: "italic" }}>
          Payment
        </h2>
      </div>

      <Card style={{
        marginBottom: "20px",
        borderColor: C.ac + "40",
        background: C.ac + "06"
      }}>
        <p style={{
          fontSize: "14px",
          fontWeight: 600,
          marginBottom: "4px"
        }}>🔒 Safety Active</p>
        <p style={{ fontSize: "13px", color: C.tm, lineHeight: 1.6 }}>
          Every submission requires review + approval. Only card refs stored.
        </p>
      </Card>

      <Card style={{ marginBottom: "16px" }}>
        <h3 style={{
          fontFamily: FN.d,
          fontSize: "18px",
          fontStyle: "italic",
          marginBottom: "16px"
        }}>Controls</h3>
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "16px"
        }}>
          <div>
            <label style={LS}>Monthly Cap ($)</label>
            <input
              type="number"
              value={pay.monthlyBudget}
              onChange={e => save({
                ...pay,
                monthlyBudget: parseFloat(e.target.value) || 0
              })}
            />
          </div>
          <div>
            <label style={LS}>Per-Submission Limit ($)</label>
            <input
              type="number"
              value={pay.spendingLimit}
              onChange={e => save({
                ...pay,
                spendingLimit: parseFloat(e.target.value) || 0
              })}
            />
          </div>
        </div>
        <div style={{ marginTop: "16px" }}>
          <Chk
            checked={pay.requireApproval}
            onChange={v => save({ ...pay, requireApproval: v })}
            label="Require manual approval"
            sub="Prevents accidental charges"
          />
        </div>
        <div style={{
          marginTop: "16px",
          padding: "14px",
          background: C.bg,
          borderRadius: "8px"
        }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "8px"
          }}>
            <span style={{ fontSize: "12px", color: C.tm }}>Spend</span>
            <span style={{ fontSize: "12px", fontFamily: FN.m }}>
              ${spent.toFixed(2)} / ${pay.monthlyBudget}
            </span>
          </div>
          <div style={{
            height: "8px",
            background: C.bd,
            borderRadius: "4px",
            overflow: "hidden"
          }}>
            <div style={{
              height: "100%",
              borderRadius: "4px",
              width: Math.min(100, (spent / pay.monthlyBudget) * 100) + "%",
              background: spent > pay.monthlyBudget * 0.8 ? C.dn : C.ac,
              transition: "width 0.4s"
            }} />
          </div>
        </div>
      </Card>

      <Card>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px"
        }}>
          <h3 style={{
            fontFamily: FN.d,
            fontSize: "18px",
            fontStyle: "italic"
          }}>Methods</h3>
          <Btn small onClick={() => setAddMdl(true)}>+ Add</Btn>
        </div>
        {!pay.methods.length ? (
          <div style={{
            padding: "24px",
            textAlign: "center",
            background: C.bg,
            borderRadius: "8px"
          }}>
            <p style={{
              color: C.td,
              fontSize: "13px",
              fontStyle: "italic"
            }}>None yet</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {pay.methods.map(m => (
              <div
                key={m.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "14px 16px",
                  background: C.bg,
                  borderRadius: "8px",
                  border: m.id === pay.defaultMethodId
                    ? "1px solid " + C.ac + "40"
                    : "1px solid transparent"
                }}
              >
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px"
                }}>
                  <span style={{ fontSize: "20px", opacity: 0.6 }}>💳</span>
                  <div>
                    <p style={{ fontSize: "14px", fontWeight: 500 }}>{m.label}</p>
                    <p style={{ fontSize: "11px", color: C.td }}>
                      {m.name} · {m.exp}
                    </p>
                  </div>
                  {m.id === pay.defaultMethodId && <Bdg>DEFAULT</Bdg>}
                </div>
                <div style={{ display: "flex", gap: "6px" }}>
                  {m.id !== pay.defaultMethodId && (
                    <Btn
                      variant="ghost"
                      small
                      onClick={() => save({ ...pay, defaultMethodId: m.id })}
                    >Default</Btn>
                  )}
                  <Btn
                    variant="ghost"
                    small
                    onClick={() => save({
                      ...pay,
                      methods: pay.methods.filter(x => x.id !== m.id),
                      defaultMethodId: pay.defaultMethodId === m.id ? null : pay.defaultMethodId
                    })}
                    style={{ color: C.dn }}
                  >Remove</Btn>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Mdl
        open={addMdl}
        onClose={() => setAddMdl(false)}
        title="Add Payment Method"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={LS}>Billing Name *</label>
            <input
              value={cf.name}
              onChange={e => setCf({ ...cf, name: e.target.value })}
            />
          </div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px"
          }}>
            <div>
              <label style={LS}>Type</label>
              <select
                value={cf.type}
                onChange={e => setCf({ ...cf, type: e.target.value })}
              >
                {["Visa", "Mastercard", "Amex", "Bank / ACH"].map(t => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={LS}>Last 4 *</label>
              <input
                value={cf.last4}
                onChange={e => setCf({
                  ...cf,
                  last4: e.target.value.replace(/\D/g, "").slice(0, 4)
                })}
                maxLength={4}
              />
            </div>
          </div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px"
          }}>
            <div>
              <label style={LS}>Expiry</label>
              <input
                value={cf.exp}
                onChange={e => setCf({ ...cf, exp: e.target.value })}
                placeholder="MM/YY"
              />
            </div>
            <div>
              <label style={LS}>Label</label>
              <input
                value={cf.label}
                onChange={e => setCf({ ...cf, label: e.target.value })}
              />
            </div>
          </div>
          <div style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px"
          }}>
            <Btn variant="secondary" onClick={() => setAddMdl(false)}>Cancel</Btn>
            <Btn onClick={addCard} disabled={!cf.last4 || !cf.name}>Add</Btn>
          </div>
        </div>
      </Mdl>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   PROFILE
   ═══════════════════════════════════════════════════ */

function ProfView({ profile, save }) {
  const [form, setForm] = useState({ ...profile });
  const [done, setDone] = useState(false);
  const [apiKey, setApiKey] = useState(localStorage.getItem("poe_api_key") || "");
  const [keyVisible, setKeyVisible] = useState(false);

  const doSave = () => {
    save(form);
    localStorage.setItem("poe_api_key", apiKey);
    setDone(true);
    setTimeout(() => setDone(false), 2000);
  };

  return (
    <div>
      <div style={{ marginBottom: "28px" }}>
        <h2 style={{ fontFamily: FN.d, fontSize: "26px", fontStyle: "italic" }}>
          Profile
        </h2>
      </div>

      <Card style={{
        marginBottom: "16px",
        borderColor: apiKey ? C.ok + "40" : C.dn + "40"
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "14px"
        }}>
          <span style={{ fontSize: "18px" }}>{apiKey ? "🔑" : "⚠"}</span>
          <h3 style={{
            fontFamily: FN.d,
            fontSize: "18px",
            fontStyle: "italic"
          }}>API Configuration</h3>
          {apiKey ? (
            <Bdg color={C.ok}>CONNECTED</Bdg>
          ) : (
            <Bdg color={C.dn}>NOT SET</Bdg>
          )}
        </div>
        <p style={{
          fontSize: "13px",
          color: C.tm,
          marginBottom: "12px",
          lineHeight: 1.6
        }}>
          The Opportunity Engine uses Claude to analyze projects, search opportunities, and generate applications. Enter your Anthropic API key below. Get one at <a href="https://console.anthropic.com" target="_blank" rel="noopener" style={{ color: C.ac }}>console.anthropic.com</a>
        </p>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <input
            type={keyVisible ? "text" : "password"}
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            placeholder="sk-ant-api03-..."
            style={{ fontFamily: FN.m, fontSize: "13px" }}
          />
          <Btn
            variant="ghost"
            small
            onClick={() => setKeyVisible(!keyVisible)}
          >{keyVisible ? "Hide" : "Show"}</Btn>
        </div>
        <p style={{
          fontSize: "11px",
          color: C.td,
          marginTop: "6px"
        }}>Stored locally in your browser only. Never sent anywhere except Anthropic's API.</p>
      </Card>

      <Card>
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "16px"
        }}>
          <div>
            <label style={LS}>Company</label>
            <input
              value={form.companyName}
              onChange={e => setForm({ ...form, companyName: e.target.value })}
            />
          </div>
          <div>
            <label style={LS}>Founders</label>
            <input
              value={form.founders}
              onChange={e => setForm({ ...form, founders: e.target.value })}
            />
          </div>
          <div>
            <label style={LS}>Location</label>
            <input
              value={form.location}
              onChange={e => setForm({ ...form, location: e.target.value })}
            />
          </div>
          <div>
            <label style={LS}>Website</label>
            <input
              value={form.website}
              onChange={e => setForm({ ...form, website: e.target.value })}
            />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={LS}>Bio</label>
            <textarea
              rows={3}
              value={form.bio}
              onChange={e => setForm({ ...form, bio: e.target.value })}
            />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={LS}>Credits</label>
            <textarea
              rows={3}
              value={form.credits}
              onChange={e => setForm({ ...form, credits: e.target.value })}
            />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={LS}>Specialties</label>
            <textarea
              rows={2}
              value={form.specialties}
              onChange={e => setForm({ ...form, specialties: e.target.value })}
            />
          </div>
        </div>
        <div style={{
          display: "flex",
          justifyContent: "flex-end",
          marginTop: "20px",
          gap: "10px",
          alignItems: "center"
        }}>
          {done && (
            <span style={{
              color: C.ok,
              fontSize: "13px",
              fontFamily: FN.m
            }}>✓ Saved</span>
          )}
          <Btn onClick={doSave}>Save All</Btn>
        </div>
      </Card>
    </div>
  );
}
