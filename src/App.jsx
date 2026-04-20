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
  contactEmail: "ryan@precariatproductions.com",
  contactPhone: "(917) 544-0654",
  contactName: "Ryan Guiterman",
  credits: "Canvas (2021) - Animated Horror - Annecy, Gravitas Ventures\nLoud & Longing (2023) - Drama/Thriller - Lighthouse IFF, Gravitas Ventures\nFor Marta (Short Film)",
  specialties: "Animation, Horror, Genre Films, VFX, AI Technology, Independent Film",
  connectedAccounts: []  // [{ name, identifier, url, notes }]
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

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB per file

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

async function askClaude(content, search, attempt = 0) {
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
    max_tokens: 16000,
    messages: messages
  };
  if (search) {
    body.tools = [{ type: "web_search_20250305", name: "web_search" }];
  }
  let res;
  try {
    res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true"
      },
      body: JSON.stringify(body)
    });
  } catch (networkErr) {
    if (attempt < 1) {
      await new Promise(r => setTimeout(r, 2000));
      return askClaude(content, search, attempt + 1);
    }
    throw new Error("Network error: " + (networkErr.message || "could not reach API"));
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = err.error?.message || err.error || ("API request failed: " + res.status);
    if ((res.status === 429 || res.status === 529 || res.status === 503) && attempt < 2) {
      const waitMs = (attempt + 1) * 5000;
      console.warn("Retrying after " + waitMs + "ms due to " + res.status);
      await new Promise(r => setTimeout(r, waitMs));
      return askClaude(content, search, attempt + 1);
    }
    if (res.status === 429) throw new Error("Rate limited by Anthropic. Try again in a minute, or run fewer operations in parallel.");
    if (res.status === 529) throw new Error("Anthropic API is overloaded. Try again shortly.");
    if (res.status === 400 && msg.includes("credit")) throw new Error("Out of API credits. Add more at console.anthropic.com.");
    if (res.status === 400 && (msg.includes("PDF") || msg.includes("pages") || msg.includes("document"))) {
      throw new Error("PDF too long (over 100 pages). Re-upload the screenplay as .txt: open the PDF, copy all text, paste into a .txt file, then upload that instead.");
    }
    throw new Error(msg);
  }
  const data = await res.json();
  const stopReason = data.stop_reason;
  const text = (data.content || [])
    .map(b => b.type === "text" ? b.text : "")
    .filter(Boolean)
    .join("\n");
  if (!text) {
    throw new Error("Empty response from API (stop_reason: " + (stopReason || "unknown") + ")");
  }
  // Detect truncation — response hit the max_tokens ceiling mid-JSON
  if (stopReason === "max_tokens") {
    console.warn("Response truncated at max_tokens. Text length:", text.length);
    throw new Error("Response hit 16k token limit. The prompt or AI response is too large. Try reducing team notes, using fewer attached files, or retrying.");
  }
  return text;
}

// Strip citation markup and HTML tags from AI output that was rendered as text.
// Walks the parsed JSON structure and cleans every string value in place.
// This is belt-and-suspenders defense — prompts already tell the AI not to emit
// cite tags, but model behavior can vary so we sanitize on ingest.
function sanitizeStrings(obj) {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === "string") {
    return obj
      // Strip cite tags with any attributes: <cite>, <cite index="1">, </cite>
      .replace(/<\/?cite[^>]*>/gi, "")
      // Strip antml citation wrappers: , , etc
      .replace(/<\/?antml:[^>]*>/gi, "")
      // Strip generic HTML/XML-ish tags that the AI sometimes adds (be conservative
      // — only strip tags we know are decorative, not things like <3 or math)
      .replace(/<\/?(b|i|em|strong|u|span|a|sup|sub|mark|small|div|p|br)(\s[^>]*)?>/gi, "")
      // Strip footnote markers like [1], [^2], [23] when they appear as citations
      // (only at word boundaries, only with digits inside)
      .replace(/\[\^?\d+\]/g, "")
      // Collapse multiple spaces left behind by tag stripping
      .replace(/[ \t]+/g, " ")
      // Fix space before punctuation left by stripped tags
      .replace(/ ([,.;:!?])/g, "$1")
      .trim();
  }
  if (Array.isArray(obj)) return obj.map(sanitizeStrings);
  if (typeof obj === "object") {
    const out = {};
    for (const [k, v] of Object.entries(obj)) {
      out[k] = sanitizeStrings(v);
    }
    return out;
  }
  return obj;
}

function extractJSON(text) {
  const result = extractJSONRaw(text);
  return result === null ? null : sanitizeStrings(result);
}

function extractJSONRaw(text) {
  // Strip markdown fences
  let clean = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();

  // Best case: whole thing parses
  try {
    return JSON.parse(clean);
  } catch (e) {}

  // Find outermost balanced bracket via proper matching (handles nesting + strings)
  const findOutermost = (str, openChar, closeChar) => {
    let start = -1;
    let depth = 0;
    let inString = false;
    let escape = false;
    for (let i = 0; i < str.length; i++) {
      const ch = str[i];
      if (escape) { escape = false; continue; }
      if (ch === "\\") { escape = true; continue; }
      if (ch === '"') { inString = !inString; continue; }
      if (inString) continue;
      if (ch === openChar) {
        if (start === -1) start = i;
        depth++;
      } else if (ch === closeChar) {
        depth--;
        if (depth === 0 && start !== -1) {
          return str.slice(start, i + 1);
        }
      }
    }
    if (start !== -1) return str.slice(start);
    return null;
  };

  // Find first bracket of either type OUTSIDE strings — that tells us
  // whether the root container is an object or an array.
  const findFirstBracket = (str) => {
    let inString = false;
    let escape = false;
    for (let i = 0; i < str.length; i++) {
      const ch = str[i];
      if (escape) { escape = false; continue; }
      if (ch === "\\") { escape = true; continue; }
      if (ch === '"') { inString = !inString; continue; }
      if (inString) continue;
      if (ch === "{" || ch === "[") return ch;
    }
    return null;
  };

  const firstBracket = findFirstBracket(clean);
  const tryParseWithRepair = (candidate) => {
    if (!candidate) return undefined;
    try {
      return JSON.parse(candidate);
    } catch (e) {
      // Strip trailing commas, a common AI mistake
      const repaired = candidate.replace(/,(\s*[}\]])/g, "$1");
      try {
        return JSON.parse(repaired);
      } catch (e2) {}
    }
    return undefined;
  };

  // Try the root container type first
  if (firstBracket === "[") {
    const arrCandidate = findOutermost(clean, "[", "]");
    const parsed = tryParseWithRepair(arrCandidate);
    if (parsed !== undefined) return parsed;
    // Fall back to object
    const objCandidate = findOutermost(clean, "{", "}");
    const parsedObj = tryParseWithRepair(objCandidate);
    if (parsedObj !== undefined) return parsedObj;
  } else {
    const objCandidate = findOutermost(clean, "{", "}");
    const parsed = tryParseWithRepair(objCandidate);
    if (parsed !== undefined) return parsed;
    // Fall back to array
    const arrCandidate = findOutermost(clean, "[", "]");
    const parsedArr = tryParseWithRepair(arrCandidate);
    if (parsedArr !== undefined) return parsedArr;
  }

  console.error("extractJSON failed. Text preview:", clean.slice(0, 500));
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

async function exportAllData() {
  const bundle = {
    version: 1,
    exportedAt: new Date().toISOString(),
    app: "precariat-opportunity-engine",
    data: {}
  };
  // Core keys
  for (const [name, key] of Object.entries(SK)) {
    if (key === SK.FILES) continue; // handle files separately
    try {
      const r = await window.storage.get(key);
      bundle.data[name] = r && r.value ? JSON.parse(r.value) : null;
    } catch (e) {
      bundle.data[name] = null;
    }
  }
  // Per-project files
  bundle.files = {};
  const projects = bundle.data.PROJECTS || [];
  for (const p of projects) {
    try {
      const r = await window.storage.get(SK.FILES + "-" + p.id);
      bundle.files[p.id] = r && r.value ? JSON.parse(r.value) : [];
    } catch (e) {
      bundle.files[p.id] = [];
    }
  }
  return bundle;
}

async function importAllData(bundle) {
  if (!bundle || bundle.app !== "precariat-opportunity-engine") {
    throw new Error("Invalid backup file — not a Precariat Opportunity Engine export");
  }
  if (!bundle.data) {
    throw new Error("Invalid backup file — no data section");
  }
  // Restore core keys
  for (const [name, value] of Object.entries(bundle.data)) {
    if (value === null || value === undefined) continue;
    const key = SK[name];
    if (!key) continue;
    await window.storage.set(key, JSON.stringify(value));
  }
  // Restore files
  if (bundle.files) {
    for (const [projectId, files] of Object.entries(bundle.files)) {
      if (files && files.length > 0) {
        await window.storage.set(SK.FILES + "-" + projectId, JSON.stringify(files));
      }
    }
  }
}

/* ═══════════════════════════════════════════════════
   MAIN APP
   ═══════════════════════════════════════════════════ */

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught:", error, info);
    this.setState({ info });
  }
  async handleClearData() {
    if (!confirm("This will permanently delete ALL app data in this browser (projects, applications, opportunities, everything). Only do this if the app is broken and you have a backup to restore from. Continue?")) {
      return;
    }
    try {
      // Delete all known storage keys
      const keys = ["pre-profile", "pre-projects", "pre-opps", "pre-apps", "pre-pay"];
      for (const k of keys) {
        try { await window.storage.delete(k); } catch (e) {}
      }
      // Delete all project file storage keys
      try {
        const listResult = await window.storage.list("pre-files-");
        if (listResult && listResult.keys) {
          for (const k of listResult.keys) {
            try { await window.storage.delete(k); } catch (e) {}
          }
        }
      } catch (e) {}
      alert("All data cleared. The app will now reload.");
      window.location.reload();
    } catch (e) {
      alert("Clear failed: " + (e.message || "unknown error") + "\n\nTry manually clearing site data in your browser settings.");
    }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "100vh",
          background: "#0a0a0a",
          color: "#e8e4dc",
          padding: "40px",
          fontFamily: "system-ui, -apple-system, sans-serif",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <div style={{
            maxWidth: "560px",
            background: "#14110f",
            border: "1px solid #ef4444",
            borderRadius: "12px",
            padding: "32px"
          }}>
            <h1 style={{
              fontSize: "26px",
              fontStyle: "italic",
              fontFamily: "Georgia, serif",
              marginBottom: "8px",
              color: "#ef4444"
            }}>Something went wrong</h1>
            <p style={{ fontSize: "14px", color: "#999", marginBottom: "20px", lineHeight: 1.6 }}>
              The app crashed while rendering. This is usually caused by malformed data (often from an imported backup that doesn't match the current app version). Your data is still safe in browser storage — the crash only affects the display.
            </p>
            <div style={{
              background: "#0a0a0a",
              border: "1px solid #333",
              borderRadius: "6px",
              padding: "12px",
              marginBottom: "20px",
              fontSize: "12px",
              fontFamily: "ui-monospace, monospace",
              color: "#ef4444",
              wordBreak: "break-word",
              maxHeight: "200px",
              overflow: "auto"
            }}>
              {this.state.error ? (this.state.error.message || String(this.state.error)) : "Unknown error"}
              {this.state.info && this.state.info.componentStack && (
                <div style={{ color: "#888", marginTop: "8px", fontSize: "11px" }}>
                  {this.state.info.componentStack.split("\n").slice(0, 5).join("\n")}
                </div>
              )}
            </div>
            <p style={{ fontSize: "13px", color: "#ccc", marginBottom: "14px", lineHeight: 1.6 }}>
              <strong>Recovery options:</strong>
            </p>
            <ol style={{ fontSize: "13px", color: "#ccc", marginBottom: "20px", paddingLeft: "20px", lineHeight: 1.7 }}>
              <li><strong>Try reloading first</strong> — sometimes this clears transient errors.</li>
              <li><strong>Open the browser console (F12)</strong> and send the red error message to Ryan for diagnosis.</li>
              <li><strong>As a last resort, clear all data</strong> — only if you have a backup you can restore from afterward.</li>
            </ol>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: "12px 20px",
                  background: "#14b8a6",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >↻ Reload Page</button>
              <button
                onClick={() => this.handleClearData()}
                style={{
                  padding: "12px 20px",
                  background: "transparent",
                  color: "#ef4444",
                  border: "1px solid #ef4444",
                  borderRadius: "6px",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >⚠ Clear All Data (Nuclear)</button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function AppMain() {
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
        if (results[0] && results[0].value) {
          const loaded = JSON.parse(results[0].value);
          // Merge with DEF_PROFILE so any new fields (contactEmail, contactPhone, etc.) get populated
          setProfile({ ...DEF_PROFILE, ...loaded });
        }
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

      const textPrompt = `You are a world-class film strategist who has programmed Sundance, Cannes, and advised A24. Your analysis leaves NO stone unturned — you deeply research every person attached to a project because even a single collaborator's credentials can unlock entire tiers of grants, labs, and festivals.

═══════════════════════════════════════════════════════════
COMPANY & PROJECT DATA
═══════════════════════════════════════════════════════════
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

═══════════════════════════════════════════════════════════
CRITICAL: TEAM DEEP-DIVE (MANDATORY, NON-NEGOTIABLE)
═══════════════════════════════════════════════════════════
You MUST use web search to research EVERY named person in the Team Notes, Credits, and Founders sections above. This is the most important part of your analysis — the right team attachments unlock opportunities the project couldn't otherwise access.

For each person mentioned by name:
1. Search their full name + "producer" / "director" / "writer" / relevant role + any company they're associated with
2. Find their credits, awards, and industry standing
3. Identify specific "leverage points" — awards won, festivals played, institutions they're tied to, notable collaborators
4. Note any credentials that could DIRECTLY unlock specific grants, labs, or festivals (e.g., "Academy membership opens AMPAS grants", "Sundance alum status qualifies for Sundance Institute re-entry programs", "Oscar winner → eligible for industry-insider programs")

DO NOT skip this research. DO NOT assume. A team member you dismiss could be an Oscar winner whose attachment would have won you a $500k grant. ACTIVELY SEARCH EVERY NAME.

Extract names from:
- The explicit Team Notes field
- The Credits/Founders fields on the company
- Any names mentioned in the attached materials (screenplay cover page, pitch deck credits, look book credits)

═══════════════════════════════════════════════════════════
OUTPUT FORMAT (JSON only, no markdown, no backticks)
═══════════════════════════════════════════════════════════
🚨 CRITICAL FORMATTING RULE: Your response must be PLAIN TEXT inside JSON string values. Do NOT include ANY of the following in your output:
• No <cite> tags or citation markup of any kind
• No  or similar XML/HTML citation wrappers
• No footnote-style markers like [1], [2], [^1], or superscripts
• No HTML tags of any kind (<b>, <em>, <a>, <span>, etc.)
• No markdown syntax (**, __, [text](url), etc.)
• No source attributions like "(Source: ...)" embedded in the text

Web search is a RESEARCH TOOL for you to gather facts. Once you have the facts, write them as clean prose in the JSON values. If you want to convey where info came from, mention the source in natural language within the research field itself (e.g., "According to IMDb, she produced..." or "Per Variety's 2024 coverage, the film..."). But NO markup, NO tags, NO citation wrappers. The JSON values are displayed directly in a UI and any markup will render as ugly raw text.

{
  "team": {
    "members": [
      {
        "name": "Full name as mentioned",
        "role": "Their role on THIS project (producer, DP, composer, etc.)",
        "researchedCredits": "Notable credits found via web search — be specific about films, years, festivals",
        "awardsAndHonors": "Any awards, nominations, fellowships, institutional memberships found",
        "industryStanding": "1-2 sentences on how they're perceived in the industry — commercial? indie? auteur-world? documentary circle? etc.",
        "leveragePoints": "Specific ways their attachment strengthens applications — be granular. E.g., 'Her Oscar win qualifies the project for AMPAS-adjacent programs' or 'Sundance Institute alum — natural fit for Sundance labs' or 'Emmy for HBO series — unlocks TV/streaming exec attention'",
        "unlockedOpportunities": "Specific grants, labs, festivals, or funds their attachment could unlock that wouldn't otherwise be accessible"
      }
    ],
    "collectiveLeverage": "2-3 sentences on how the TEAM as a whole positions this project. What tier of opportunities does their combined credibility unlock? What language/framings should applications use to highlight the team?",
    "namesToForeground": "List the top 2-3 names to foreground in applications and WHY — based on which names carry the most weight with selection committees",
    "researchGaps": "If you couldn't find solid info on any named person, list them here so the applicant knows to provide more context"
  },
  "artistic": {
    "thematicCore": "3-4 sentences on the deepest thematic concerns. What questions does it ask?",
    "narrativeApproach": "2-3 sentences on storytelling strategy, structure, perspective, tone",
    "visualIdentity": "2-3 sentences on visual/aesthetic language. Reference specific styles or filmmakers",
    "artisticLineage": "2-3 sentences on what films, artists, or traditions this is in conversation with",
    "culturalSignificance": "2-3 sentences on why this story matters NOW"
  },
  "market": {
    "comparables": "3-5 comparable films with rationale",
    "festivalStrategy": "3-4 sentences naming specific festivals and sections — factor in which ones the TEAM's credentials make realistic",
    "audienceProfile": "2-3 sentences on core and secondary audiences",
    "distributionAngle": "2-3 sentences on distribution strategy — note any distribution avenues opened by team connections",
    "marketPositioning": "2-3 sentences on unique selling proposition",
    "grantFitProfile": "2-3 sentences on what funding bodies would be receptive — include any grants UNLOCKED by specific team members"
  },
  "strategy": {
    "strengths": "3-4 points on competitive strengths — LEAD with team strengths if the team is strong",
    "risks": "2-3 points on potential concerns with mitigations",
    "keyPhrasing": "5-8 specific phrases that should appear in applications — include team-credential phrasings",
    "submissionTiming": "2-3 sentences on optimal timing",
    "idealOpportunityTypes": "ranked list of opportunity types with rationale — prioritize ones where team credentials give maximum leverage"
  }
}

Be brutally specific to THIS project and THIS team only. No generic advice. Research every name. Leave no stone unturned.`;

      let messageContent;
      if (projectFiles.length > 0) {
        const blocks = [{ type: "text", text: textPrompt }];
        for (const f of projectFiles) {
          if (f.skipInAI) continue; // Stored for submission only, not sent to AI
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

      const txt = await askClaude(messageContent, true);
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
    let teamContext = "";
    if (a) {
      analysisContext = "\nPROJECT INTELLIGENCE:\n"
        + "Artistic: " + JSON.stringify(a.artistic || {}) + "\n"
        + "Market: " + JSON.stringify(a.market || {}) + "\n"
        + "Strategy: " + JSON.stringify(a.strategy || {}) + "\n\n"
        + "Use this intelligence to find opportunities aligned with the project's specific artistic and market profile.";

      if (a.team) {
        teamContext = "\n\n═══════════════════════════════════════════\n🔑 TEAM LEVERAGE (CRITICAL — DO NOT IGNORE)\n═══════════════════════════════════════════\n"
          + "This project has specific collaborators whose credentials unlock opportunities the project couldn't otherwise access.\n\n"
          + "TEAM MEMBERS:\n" + JSON.stringify(a.team.members || [], null, 2) + "\n\n"
          + "COLLECTIVE LEVERAGE: " + (a.team.collectiveLeverage || "") + "\n"
          + "NAMES TO FOREGROUND: " + (a.team.namesToForeground || "") + "\n\n"
          + "🎯 MANDATORY SEARCH STRATEGY BASED ON TEAM:\n"
          + "1. Each team member's awards, fellowships, and institutional ties may qualify the project for SPECIFIC opportunities. Search for opportunities that specifically reward teams with these credentials.\n"
          + "2. Look for programs with 'alumni re-entry' pathways if any team member is a past fellow/alum of Sundance Institute, Film Independent, IFP, Cinereach, etc.\n"
          + "3. Look for opportunities that specifically require or prefer 'experienced producers,' 'award-winning teams,' or 'established collaborators' — the team makes the project eligible.\n"
          + "4. Factor award-based eligibility: Oscar/Emmy winners on the team may unlock AMPAS-adjacent programs, Television Academy programs, producer-led grants, and industry insider labs.\n"
          + "5. Consider 'tiered' programs where team credentials let you apply to higher tiers than the project would otherwise merit.\n"
          + "6. Note opportunities that specifically value festival pedigree — if a team member has Cannes/Sundance/Berlin/Venice history, those festivals' adjacent programs become stronger matches.\n\n"
          + "LEAVE NO STONE UNTURNED. If even ONE team member's credentials could unlock a specific opportunity, include it with strong match strength.";
      }
    }

    const prof = profileRef.current;
    const prompt = `You are an expert film industry researcher. Search for REAL, currently open or upcoming ${tf} for this project. Your job is to find opportunities where this SPECIFIC team's credentials give the highest probability of success.

COMPANY: ${prof.companyName} | ${prof.bio} | ${prof.location}
PROJECT: "${p.title}"
Format: ${p.format}
Genre: ${p.genre || "?"}
Stage: ${p.stage}
Logline: ${p.logline || "?"}
Themes: ${p.themes || "?"}
Team Notes: ${p.teamNotes || "?"}${analysisContext}${teamContext}${exclusionContext}
${query && query.trim() ? "\nAdditional focus: " + query : ""}

🚨 CRITICAL STAGE REQUIREMENT (NON-NEGOTIABLE):
This project is currently in "${p.stage}" stage. ${stageRule}

Before returning ANY opportunity, verify it explicitly accepts projects in "${p.stage}" stage. If an opportunity requires a different stage, EXCLUDE IT. It is better to return fewer results than to include mismatched opportunities.

Respond ONLY with a JSON array.

🚨 CRITICAL FORMATTING RULE: All string values in the JSON must be PLAIN TEXT. Do NOT include <cite> tags,  wrappers, footnote markers [1][2], HTML tags, markdown, or any other markup. Web search is for research — the output must be clean prose.

Each object must have:
- "name", "organization"
- "type" ("Grant"|"Festival"|"Lab"|"Fellowship"|"Residency")
- "deadline" (specific date like "June 15, 2026" when available)
- "amount", "submissionFee", "url"
- "description" (2-3 sentences)
- "stageEligibility" (explicit quote or paraphrase from the opportunity confirming it accepts ${p.stage}-stage projects)
- "matchReason" (why this fits THIS specific project — reference the analysis AND team credentials if relevant)
- "teamAdvantage" (optional — if a specific team member's credentials give this project an edge for this opportunity, explain how. E.g., "Erika Hampson's Oscar win makes this project eligible for AMPAS Gold programs" — leave empty if team credentials don't specifically apply)
- "matchStrength" ("strong"|"moderate"|"speculative")
- "eligibility" (other key requirements beyond stage)

Find 6-12 real opportunities that STRICTLY match the project's current stage. Quality over quantity. Prioritize opportunities where team credentials give maximum leverage.`;

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

      const textPrompt = `You are a world-class grant writer and application strategist who has helped films win Sundance, Tribeca, Cinereach, SFFILM, Sundance Institute labs, and dozens of major grants. Your success rate is extraordinary because you NEVER write generic applications — every single submission is meticulously tailored to the specific opportunity's values, voice, aesthetic preferences, selection criteria, and the unique things their committees respond to.

═══════════════════════════════════════════════════════════
YOUR TASK: Write a hand-tailored application for a SPECIFIC opportunity.
═══════════════════════════════════════════════════════════

OPPORTUNITY DETAILS
• Name: ${o.name}
• Organization: ${o.organization}
• Type: ${o.type}
• Description: ${o.description}
• Eligibility: ${o.eligibility || "Unknown"}
• URL: ${o.url || "N/A"}

APPLICANT
• Company: ${prof.companyName}
• Founders: ${prof.founders}
• Location: ${prof.location}
• Bio: ${prof.bio}
• Credits: ${prof.credits}
• Specialties: ${prof.specialties}

📬 CONTACT FOR RESPONSES (MANDATORY INCLUSION):
• Primary contact: ${prof.contactName || prof.founders}
• Email: ${prof.contactEmail || "Not provided"}
• Phone: ${prof.contactPhone || "Not provided"}
• Website: ${prof.website || "Not provided"}

🚨 These are the EXACT contact details selection committees should use to respond. You MUST include them in the application. Do not use placeholders, do not make up different contact info, do not omit them. The cover letter MUST include these details in a contact block (typically at the top below the letterhead OR at the close). If the application has a dedicated contact field (name/email/phone), use these exact values. If the applicant's company website shows different contact info, use the ones above — they are authoritative.

🔗 CONNECTED ACCOUNTS & MEMBERSHIPS THE APPLICANT ALREADY HOLDS:
${(prof.connectedAccounts && prof.connectedAccounts.length > 0)
  ? prof.connectedAccounts.map(a => "• " + (a.name || "Unnamed") + (a.identifier ? " (" + a.identifier + ")" : "") + (a.notes ? " — " + a.notes : "")).join("\n")
  : "None listed. The applicant may need to create accounts for this opportunity."}

When identifying account prerequisites during your research, cross-reference this list. If the opportunity requires an account the applicant ALREADY holds, note it as met. If they need a new account, flag it clearly in the accountsRequired output field.

PROJECT
• Title: "${p.title}"
• Format: ${p.format}
• Genre: ${p.genre || "?"}
• Stage: ${p.stage}
• Logline: ${p.logline || "?"}
• Synopsis: ${p.synopsis || "?"}
• Themes: ${p.themes || "?"}
• Budget: ${p.budget || "?"}
• Team Notes: ${p.teamNotes || "?"}${analysisContext}

${projectFiles.length > 0 ? "ATTACHED MATERIALS: Review the attached files (screenplay, pitch deck, look book, etc.) carefully. Reference SPECIFIC scenes, visuals, characters, or moments from them — not vague summaries. This specificity is what separates winning applications from generic ones." : ""}

═══════════════════════════════════════════════════════════
STEP 1 — RESEARCH THE OPPORTUNITY (REQUIRED, NON-NEGOTIABLE)
═══════════════════════════════════════════════════════════
Before writing a single word of the application, you MUST use web search to research "${o.name}" at "${o.organization}". Specifically find:

1. Their mission statement, values, and what they explicitly say they're looking for
2. Past recipients/winners/selected projects — patterns in what they choose
3. The aesthetic, political, thematic, or formal sensibilities they favor
4. The tone and language of their OWN communication (read their website, application guidelines, interviews with program directors)
5. Any specific framings, buzzwords, or priorities that recur in their materials
6. Selection criteria — what do judges/committees explicitly score on?
7. Any red flags or common reasons applications fail
8. **THE EXACT APPLICATION REQUIREMENTS** — CRITICAL. This is the most common failure point: applications get submitted with missing fields because the research was incomplete. You MUST follow all four sub-steps below. Skipping any of them is a failure.

   **8a. FETCH THE ACTUAL SUBMISSION PAGE.** Do not rely on search snippets, press articles, or descriptions of the program. Use web search to find the direct URL where applicants actually submit — typically a page like "${o.organization} [program name] apply" or "${o.organization} submission guidelines" — and read the full page. If the submission portal requires login and you cannot see the field list directly, find any FAQ, guidelines PDF, or alumni writeup that enumerates what the application asks for.

   **8b. ENUMERATE EVERY FIELD THE APPLICATION ASKS FOR.** List each field by its exact name as the application calls it. Include word/character limits where stated. Do not paraphrase — capture the actual labels. Common fields to watch for that are EASILY MISSED: logline, short synopsis, long synopsis, personal statement, director's statement, artist statement, bios (director, producer, key team), comparable films, target audience, distribution plan, budget range, budget narrative/justification, mood board or visual reference upload, screenplay PDF upload, budget top sheet upload, W9 or tax forms, fiscal sponsor documentation, work samples or past film links.

   **8c. MAP EACH FIELD TO AN OUTPUT KEY.** For every field enumerated in 8b, decide: does it map to one of the standard keys (coverLetter, projectStatement, artistStatement, directorsStatement, personalStatement, logline, shortSynopsis, longSynopsis, budgetJustification, impactStatement, timeline, comparableFilms, targetAudience, distributionStrategy, bios)? If yes, add that key to standardSectionsNeeded. If it does not map cleanly to a standard key, create a customSection entry using the application's exact field name as the title. Do NOT drop a field on the floor because it does not fit a standard key — use customSections.

   **8d. COMPLETENESS CHECK.** Before finalizing, ask yourself explicitly: "For a [program type] of this prestige level, what other fields would I typically expect to see? Do I have them all accounted for?" If Gotham-level project markets typically ask for logline + synopsis + personal statement + bios + budget + screenplay, and I only have "cover letter" on my list, something is wrong — search again. Err on the side of over-including rather than under-including: if you're unsure whether something is required, include it and note in requirements.additionalInstructions that the user should verify before submitting.

   **8e. ACCOUNT / MEMBERSHIP PREREQUISITES.** Does this opportunity require the applicant to have an account or active membership with a specific platform? Common examples: Blacklist hosted evaluation, Sundance Institute account, Film Independent membership, Gotham Film & Media Institute membership, FilmFreeway account, Coverfly profile, IMDb Pro listing, WGA registration, Stage 32 membership, Tracking Board, fiscal sponsor affiliation, 501(c)(3) status. Check the applicant's connected accounts list (provided in context) and flag which are met vs. which the applicant needs to create.

Search broadly. Read multiple pages. Do NOT skip this step.

═══════════════════════════════════════════════════════════
STEP 2 — WRITE THE APPLICATION
═══════════════════════════════════════════════════════════
Armed with your research, write each section with these mandates:

▸ **ONLY GENERATE WHAT'S ACTUALLY REQUIRED**: Do NOT write generic boilerplate sections if this opportunity doesn't ask for them. If the opportunity only requires a cover letter and a project statement, DON'T write an artist statement, impact statement, timeline, and budget justification just to fill out a template. Match the application to exactly what's asked for.

▸ **TONE MATCHING**: The voice must match how this specific organization communicates. If they're academic and critical, be academic and critical. If they're activist and urgent, be activist and urgent. If they're literary and meditative, be literary and meditative. If they're industry-insider and commercial, be industry-insider and commercial. Match their register exactly.

▸ **LANGUAGE MIRRORING**: Echo the specific vocabulary and framings the organization uses. If they say "underrepresented voices," use that framing. If they emphasize "craft" or "vision" or "formal innovation" — make those words present.

▸ **RESPECT WORD LIMITS**: If the application specifies word or character limits, adhere to them strictly. A section that runs long gets cut by committees. Write tightly to the specified length.

▸ **EMPHASIS CALIBRATION**: Different opportunities care about different things. A commercial market lab cares about distribution angles and audience — lead with that. A formally adventurous grant cares about aesthetic risk and artistic lineage — lead with that. A social impact fund cares about community, access, and representation — lead with that. CHOOSE what to emphasize based on your research, not a template.

▸ **SPECIFICITY OVER GENERIC GRANT-SPEAK**: Every sentence must be specific to this project AND this opportunity. No generic phrases like "compelling story" or "diverse perspectives." Instead: name specific scenes, specific influences, specific craft decisions, specific reasons THIS project is right for THIS opportunity.

▸ **ANSWER "WHY THIS, WHY HERE"**: Every section must implicitly or explicitly answer: "Why is THIS specific project right for THIS specific opportunity?" not just "Why is this project worthy of support?"

▸ **USE ATTACHED MATERIALS**: If there's a screenplay, quote or reference specific scenes. If there's a pitch deck, reference its visual language. If there's a look book, describe its aesthetic identity. Do not write as if you haven't read the materials.

▸ **HUMANIZE THE PROSE (CRITICAL — AI-DETECTION DEFENSE)**: Grant committees have developed a sharp ear for AI-generated writing and will downgrade applications they suspect were machine-written. Your prose must NOT read as AI-generated. Specifically:
   - **Vary sentence length dramatically.** Mix 4-word sentences with 30-word ones. Avoid the even, balanced rhythm that characterizes LLM output.
   - **BAN these overused grant-speak words entirely**: "compelling," "timely," "important," "vital," "transformative," "resonates," "navigates," "explores," "delves into," "tapestry," "landscape," "journey," "powerful," "profound," "unique perspective," "diverse voices" (as generic phrase), "meaningful," "thought-provoking," "visceral," "nuanced," "at its core," "multifaceted." These are the tells that get flagged.
   - **Embrace idiosyncrasy.** A genuinely human artist statement has weird specific details, occasional sentence fragments, personal asides, unexpected word choices. Include these.
   - **Cut hedging language.** "Seeks to explore" → "explores." "Aims to" → "does." "Attempts to" → "does."
   - **Specificity over abstraction.** Instead of "the film examines themes of loss" — name the exact scene, the exact image, the exact sound.
   - **One perfect weird detail beats five generic beautiful sentences.** A grant reader remembers "the grandmother hides the matchbook in her bra" — not "themes of resilience across generations."
   - **Don't open paragraphs with the project title or "This film."** Break the predictable rhythm of template-driven applications.
   - **Write how the director actually talks, not how grant writers write.** Read your own sentences aloud mentally — if they sound like a press release, rewrite them.

▸ **STRATEGICALLY FOREGROUND THE TEAM**: The project intelligence includes deep research on every team member — their awards, credits, institutional ties, and leverage points. Use this intelligently:
   - If THIS opportunity's committee is likely to weigh specific credentials (Oscar winners, Emmy winners, Sundance alums, Academy members, past festival winners, institutional fellows), LEAD with the relevant team member and their relevant credential
   - Match the named collaborator to what the org values. If the org cares about commercial viability, foreground producers with box office credits. If they care about art-house bona fides, foreground collaborators with Cannes/Venice history. If they care about social impact, foreground team members whose past work aligns.
   - Reference specific past films the team has worked on when they map to the org's taste
   - Use the "namesToForeground" field from the project intelligence as your starting guide — but calibrate to what THIS specific opportunity values
   - If a team member's attachment SPECIFICALLY unlocks this opportunity (e.g., an AMPAS-eligible voter on an AMPAS-adjacent grant), make that connection explicit
   - Do not list every team member equally — strategic emphasis is everything. A single well-positioned Oscar mention can outweigh a long list of credits.
   - In the cover letter, a strong team credential should appear within the first 3 sentences when it's a genuine differentiator.

═══════════════════════════════════════════════════════════
OUTPUT FORMAT (JSON only, no markdown, no backticks)
═══════════════════════════════════════════════════════════
🚨 CRITICAL FORMATTING RULE: Your response must be PLAIN TEXT inside JSON string values. Do NOT include ANY of the following in your output:
• No <cite> tags or citation markup of any kind
• No  or similar XML/HTML citation wrappers
• No footnote-style markers like [1], [2], [^1], or superscripts
• No HTML tags of any kind (<b>, <em>, <a>, <span>, etc.)
• No markdown syntax (**, __, [text](url), etc.)
• No source attributions like "(Source: ...)" embedded in the text

Web search is a RESEARCH TOOL for you to gather facts. Once you have the facts, write them as clean prose in the JSON values. If you want to convey where info came from, mention the source in natural language within the research field itself (e.g., "According to IMDb, she produced..." or "Per Variety's 2024 coverage, the film..."). But NO markup, NO tags, NO citation wrappers. The JSON values are displayed directly in a UI and any markup will render as ugly raw text.

{
  "research": {
    "orgMission": "1-2 sentences on what this organization stands for based on your research",
    "aestheticPrefs": "1-2 sentences on the kinds of projects they historically support",
    "toneVoice": "1-2 sentences describing how the organization itself communicates (formal/activist/literary/commercial/etc.)",
    "keyCriteria": "The top 3-5 things their selection committee likely weighs most heavily, as a bullet list",
    "strategicInsight": "The single most important insight that shaped how this application was written"
  },
  "requirements": {
    "summary": "2-3 sentences describing exactly what this application asks for — reflect what you found in your research about their actual submission form/guidelines",
    "standardSectionsNeeded": "Array of which STANDARD section keys are actually required by this opportunity. Only include the ones they ask for. Possible keys: coverLetter, projectStatement, artistStatement, directorsStatement, personalStatement, logline, shortSynopsis, longSynopsis, budgetJustification, impactStatement, timeline, comparableFilms, targetAudience, distributionStrategy, bios. Example: ['coverLetter', 'projectStatement', 'budgetJustification'] if they only want those three. If the application asks for something that does not map cleanly to these keys, use customSections for it instead — but do NOT leave a required field off the list. Return empty array ONLY if you genuinely cannot determine any requirements.",
    "wordLimits": "Object mapping section keys to word/character limits. E.g., { 'projectStatement': '500 words', 'artistStatement': '300 words' }. Only include keys that have explicit limits.",
    "additionalInstructions": "Any special formatting or content instructions per section"
  },
  "toneStrategy": "2-3 sentences explaining the voice/register/emphasis chosen for this application and WHY it matches this specific opportunity",
  "coverLetter": "Only generate if coverLetter is in standardSectionsNeeded. Otherwise return empty string.",
  "projectStatement": "Only generate if projectStatement is in standardSectionsNeeded. Otherwise return empty string.",
  "artistStatement": "Only generate if artistStatement is in standardSectionsNeeded. Otherwise return empty string.",
  "directorsStatement": "Only generate if directorsStatement is in standardSectionsNeeded. Otherwise return empty string. Director(s) speaking about their vision for the film — typically 500-1000 words, first-person or first-person-plural if co-directed.",
  "personalStatement": "Only generate if personalStatement is in standardSectionsNeeded. Otherwise return empty string. Personal reflection on why this filmmaker is making this film now — typically 500-700 words.",
  "logline": "Only generate if logline is in standardSectionsNeeded. Otherwise return empty string. One sentence, under 50 words.",
  "shortSynopsis": "Only generate if shortSynopsis is in standardSectionsNeeded. Otherwise return empty string. Typically 100-200 words.",
  "longSynopsis": "Only generate if longSynopsis is in standardSectionsNeeded. Otherwise return empty string. Typically 400-800 words, full plot including ending.",
  "budgetJustification": "Only generate if budgetJustification is in standardSectionsNeeded. Otherwise return empty string.",
  "impactStatement": "Only generate if impactStatement is in standardSectionsNeeded. Otherwise return empty string.",
  "timeline": "Only generate if timeline is in standardSectionsNeeded. Otherwise return empty string.",
  "comparableFilms": "Only generate if comparableFilms is in standardSectionsNeeded. Otherwise return empty string. 3-5 specific films with years, distributors, box office or awards where available, and 1 sentence each on why they are relevant comparables.",
  "targetAudience": "Only generate if targetAudience is in standardSectionsNeeded. Otherwise return empty string. Specific description of who the film is for.",
  "distributionStrategy": "Only generate if distributionStrategy is in standardSectionsNeeded. Otherwise return empty string. Festival plan, distributor targets, market positioning.",
  "bios": "Only generate if bios is in standardSectionsNeeded. Otherwise return empty string. Third-person biographies of key creative team, each 75-150 words. Format as 'NAME — ROLE\n\nBio text.' separated by double newlines.",
  "customSections": [
    {
      "key": "camelCaseKey (unique identifier, e.g. 'communityEngagement')",
      "title": "Human-readable section title as the application form calls it, e.g. 'Community Engagement Plan'",
      "wordLimit": "500 words (or whatever the app specifies, or 'unspecified')",
      "content": "The fully written section, tailored to this opportunity"
    }
  ],
  "externalMaterials": [
    {
      "name": "Human-readable name, e.g. 'Key artwork / production still'",
      "requirement": "What the opportunity actually requires, e.g. '300dpi, 16:9 aspect ratio, JPG or PNG'",
      "note": "Brief note on what the user needs to do — these cannot be auto-generated. E.g., 'Upload your best production still or artwork. Contact your production designer for high-res files.'",
      "critical": true
    }
  ],
  "accountsRequired": [
    {
      "name": "Platform / service name, e.g. 'The Black List' or 'Sundance Institute'",
      "reason": "Why this account is needed for this specific application, e.g. 'Script must be hosted on Blacklist with minimum 7.0 score' or 'Account required to access submission portal'",
      "url": "Direct URL to create the account or view requirements, if known",
      "alreadyMet": false,
      "matchedAccount": "If the applicant already holds this account per their connected accounts list, put the matched account name here. Otherwise empty string."
    }
  ],
  "strategicNotes": "INTERNAL ONLY — not for the application itself. Write 3-5 bullet points for the applicant (Ryan) explaining: what angle you chose and why, what you deliberately emphasized or downplayed, any risks or weak spots in the application, and suggestions for what to personalize or supplement before submitting. Include a reminder to gather the external materials listed above."
}

No generic language. No boilerplate. Only write what's actually asked for. Every word must earn its place. Make this application so specific that it could not have been written for any other opportunity.`;

      let messageContent;
      if (projectFiles.length > 0) {
        const blocks = [{ type: "text", text: textPrompt }];
        for (const f of projectFiles) {
          if (f.skipInAI) continue; // Stored for submission only, not sent to AI
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

      const txt = await askClaude(messageContent, true);
      const parsed = extractJSON(txt);
      if (parsed) {
        const cost = parseFee(o.submissionFee);
        const currentPay = payRef.current;
        // Initialize material tracking on any externalMaterials the AI returned
        if (parsed.externalMaterials && Array.isArray(parsed.externalMaterials)) {
          parsed.externalMaterials = parsed.externalMaterials.map(m => ({
            ...m,
            status: "pending",  // pending | requested | received | na
            dueDate: null,
            assignedTo: "",
            notes: ""
          }));
        }
        const newApp = {
          id: Date.now().toString(),
          oppName: o.name,
          oppOrg: o.organization,
          oppUrl: o.url,
          oppType: o.type,
          oppDeadline: o.deadline || null,
          oppAmount: o.amount || null,
          matchStrength: o.matchStrength || "moderate",
          projTitle: p.title,
          hadAnalysis: !!a,
          hadFiles: projectFiles.length > 0,
          deepResearch: true,
          status: "draft",
          outcome: null,  // null | won | rejected | waitlisted | ghosted
          outcomeDate: null,
          outcomeNotes: "",
          postMortem: "",
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
        textPrompt = `You are a world-class grant writer and application strategist. Your success rate is extraordinary because you NEVER write generic applications — every submission is meticulously tailored to the specific opportunity's values, voice, aesthetic, and selection criteria.

═══════════════════════════════════════════════════════════
TASK: REGENERATE a hand-tailored application from scratch using the LATEST project intelligence.
═══════════════════════════════════════════════════════════

OPPORTUNITY DETAILS
• Name: ${app.oppName}
• Organization: ${app.oppOrg}
${o ? "• Type: " + o.type + "\n• Description: " + o.description + "\n• Eligibility: " + (o.eligibility || "Unknown") + "\n• URL: " + (o.url || "N/A") : ""}

APPLICANT
• Company: ${prof.companyName}
• Founders: ${prof.founders}
• Location: ${prof.location}
• Bio: ${prof.bio}
• Credits: ${prof.credits}
• Specialties: ${prof.specialties}

📬 CONTACT FOR RESPONSES (MANDATORY INCLUSION):
• Primary contact: ${prof.contactName || prof.founders}
• Email: ${prof.contactEmail || "Not provided"}
• Phone: ${prof.contactPhone || "Not provided"}
• Website: ${prof.website || "Not provided"}

🚨 These are the EXACT contact details selection committees should use to respond. You MUST include them in the application. Do not use placeholders, do not make up different contact info, do not omit them. The cover letter MUST include these details in a contact block (typically at the top below the letterhead OR at the close). If the application has a dedicated contact field (name/email/phone), use these exact values. If the applicant's company website shows different contact info, use the ones above — they are authoritative.

🔗 CONNECTED ACCOUNTS & MEMBERSHIPS THE APPLICANT ALREADY HOLDS:
${(prof.connectedAccounts && prof.connectedAccounts.length > 0)
  ? prof.connectedAccounts.map(a => "• " + (a.name || "Unnamed") + (a.identifier ? " (" + a.identifier + ")" : "") + (a.notes ? " — " + a.notes : "")).join("\n")
  : "None listed. The applicant may need to create accounts for this opportunity."}

When identifying account prerequisites during your research, cross-reference this list. If the opportunity requires an account the applicant ALREADY holds, note it as met. If they need a new account, flag it clearly in the accountsRequired output field.

PROJECT
• Title: "${p.title}"
• Format: ${p.format}
• Genre: ${p.genre || "?"}
• Stage: ${p.stage}
• Logline: ${p.logline || "?"}
• Synopsis: ${p.synopsis || "?"}
• Themes: ${p.themes || "?"}
• Budget: ${p.budget || "?"}
• Team Notes: ${p.teamNotes || "?"}${analysisContext}

${projectFiles.length > 0 ? "ATTACHED MATERIALS: Review carefully and reference specific scenes, visuals, characters, or moments from them — not vague summaries." : ""}

STEP 1 — RESEARCH (REQUIRED): Use web search to research "${app.oppName}" at "${app.oppOrg}". Find their mission, past recipients, aesthetic preferences, tone, selection criteria, AND — critically — the EXACT application requirements.

**REQUIREMENTS EXTRACTION is the most common failure point.** You MUST:
(a) Fetch the actual submission page — not just press snippets or descriptions.
(b) Enumerate every field the application asks for, by exact name.
(c) Map each field to a standard key OR create a customSection for it — do NOT drop fields on the floor.
(d) Completeness check: for a program of this type and prestige, are there standard fields you might be missing? (Common easily-missed: logline, short synopsis, long synopsis, personal statement, director's statement, bios, comparable films, target audience, distribution plan, budget narrative, screenplay PDF upload.)
(e) Err on the side of over-including — if unsure, include it and flag in additionalInstructions.

Also identify external materials (artwork, letters of rec, pitch videos, etc.) the applicant must provide, and any account/membership prerequisites.

STEP 2 — WRITE: Only generate the sections this opportunity actually requires. Don't write generic boilerplate for sections not asked for. Every section must match the org's voice, respect any word limits, and answer "why THIS project for THIS opportunity."

Respond ONLY with JSON (no markdown).

🚨 CRITICAL FORMATTING RULE: All string values in the JSON must be PLAIN TEXT. Do NOT include <cite> tags,  wrappers, footnote markers [1][2], HTML tags (<b>, <em>, <a>, etc.), or markdown (**bold**, __italic__). Web search is for research — the output must be clean prose ready to appear in a UI. Written sections will be pasted directly into grant applications so ANY markup would be unacceptable.

JSON schema:
{
  "research": {
    "orgMission": "1-2 sentences on what this org stands for",
    "aestheticPrefs": "1-2 sentences on what they historically support",
    "toneVoice": "1-2 sentences on how the org communicates",
    "keyCriteria": "Top 3-5 things their committee weighs, as bullets",
    "strategicInsight": "The single most important insight shaping this application"
  },
  "requirements": {
    "summary": "2-3 sentences describing exactly what this application asks for",
    "standardSectionsNeeded": "Array of standard keys the opp actually requires. Possible keys: coverLetter, projectStatement, artistStatement, directorsStatement, personalStatement, logline, shortSynopsis, longSynopsis, budgetJustification, impactStatement, timeline, comparableFilms, targetAudience, distributionStrategy, bios. Include only the ones they ask for. Use customSections for any field that does not map to these keys.",
    "wordLimits": "Object mapping section keys to limits, e.g. { 'projectStatement': '500 words' }",
    "additionalInstructions": "Any special formatting/content notes"
  },
  "toneStrategy": "2-3 sentences on the voice/emphasis chosen for this app and WHY",
  "coverLetter": "Only if in standardSectionsNeeded, else empty string",
  "projectStatement": "Only if in standardSectionsNeeded, else empty string",
  "artistStatement": "Only if in standardSectionsNeeded, else empty string",
  "directorsStatement": "Only if in standardSectionsNeeded, else empty string",
  "personalStatement": "Only if in standardSectionsNeeded, else empty string",
  "logline": "Only if in standardSectionsNeeded, else empty string",
  "shortSynopsis": "Only if in standardSectionsNeeded, else empty string",
  "longSynopsis": "Only if in standardSectionsNeeded, else empty string",
  "budgetJustification": "Only if in standardSectionsNeeded, else empty string",
  "impactStatement": "Only if in standardSectionsNeeded, else empty string",
  "timeline": "Only if in standardSectionsNeeded, else empty string",
  "comparableFilms": "Only if in standardSectionsNeeded, else empty string",
  "targetAudience": "Only if in standardSectionsNeeded, else empty string",
  "distributionStrategy": "Only if in standardSectionsNeeded, else empty string",
  "bios": "Only if in standardSectionsNeeded, else empty string",
  "customSections": [
    { "key": "camelCaseKey", "title": "Human Title", "wordLimit": "...", "content": "..." }
  ],
  "externalMaterials": [
    { "name": "...", "requirement": "...", "note": "...", "critical": true }
  ],
  "accountsRequired": [
    { "name": "Platform name", "reason": "Why needed", "url": "direct link", "alreadyMet": false, "matchedAccount": "" }
  ],
  "strategicNotes": "Internal bullet points: angle chosen, what was emphasized, risks, personalization suggestions, reminder to gather external materials."
}`;
      } else {
        // Augment mode: surgical update preserving tone and user edits
        textPrompt = `You are a world-class grant writer reviewing an existing application draft against UPDATED project intelligence. The team has new information (new collaborator attached, updated budget, revised script, new credits, etc.). You must decide what — if anything — in the application should be updated.

═══════════════════════════════════════════════════════════
OPPORTUNITY
═══════════════════════════════════════════════════════════
• Name: ${app.oppName}
• Organization: ${app.oppOrg}
${o ? "• Type: " + o.type + "\n• Description: " + o.description : ""}

APPLICANT
• Company: ${prof.companyName} | ${prof.founders} | ${prof.location}
• Bio: ${prof.bio}
• Credits: ${prof.credits}

📬 AUTHORITATIVE CONTACT (must appear in application):
• Name: ${prof.contactName || prof.founders} · Email: ${prof.contactEmail || "Not provided"} · Phone: ${prof.contactPhone || "Not provided"} · Website: ${prof.website || "Not provided"}
If the existing draft has different contact info or uses placeholders, CORRECT IT to use these exact details.

PROJECT (LATEST VERSION)
• Title: "${p.title}"
• Format: ${p.format} · Genre: ${p.genre || "?"} · Stage: ${p.stage}
• Logline: ${p.logline || "?"}
• Synopsis: ${p.synopsis || "?"}
• Themes: ${p.themes || "?"}
• Team Notes: ${p.teamNotes || "?"}${analysisContext}

EXISTING APPLICATION DRAFT:
${JSON.stringify(app.content, null, 2)}

${projectFiles.length > 0 ? "ATTACHED MATERIALS: Review for current details." : ""}

═══════════════════════════════════════════════════════════
REFRESH RESEARCH (REQUIRED)
═══════════════════════════════════════════════════════════
Use web search to re-verify your understanding of "${app.oppName}" at "${app.oppOrg}" — have their criteria or focus shifted? Is there anything new about the org that would affect this application? Read their current materials.

═══════════════════════════════════════════════════════════
CRITICAL AUGMENTATION RULES
═══════════════════════════════════════════════════════════
1. Preserve the writer's voice and any manual edits. Only change sections when the new info GENUINELY strengthens them.
2. If a section is already strong and the new info doesn't meaningfully improve it, return the EXACT original text unchanged.
3. Integrate new information naturally (new producer credits, new themes from fresh analysis). Don't force changes.
4. Preserve any phrasing that works well for this opportunity's tone.
5. If the opportunity's focus has evolved per your research, note it and adjust sparingly.
6. **PRESERVE REQUIREMENTS**: The existing draft has a 'requirements' field showing which sections this opportunity actually asks for, plus 'customSections' and 'externalMaterials'. Preserve these unless your re-research reveals the opportunity's requirements have changed. If they have changed, update them.
7. **DO NOT add standard sections that aren't in requirements.standardSectionsNeeded**. Only update sections the opportunity actually asks for.

Respond ONLY with JSON (no markdown).

🚨 CRITICAL FORMATTING RULE: All string values in the JSON must be PLAIN TEXT. Do NOT include <cite> tags,  wrappers, footnote markers [1][2], HTML tags (<b>, <em>, <a>, etc.), or markdown (**bold**, __italic__). Web search is for research — the output must be clean prose ready to appear in a UI. Written sections will be pasted directly into grant applications so ANY markup would be unacceptable.

JSON schema:
{
  "research": {
    "orgMission": "Updated understanding of the org's mission",
    "aestheticPrefs": "What they support",
    "toneVoice": "How they communicate",
    "keyCriteria": "Top 3-5 committee priorities",
    "strategicInsight": "Key insight that guided this refresh"
  },
  "requirements": {
    "summary": "Preserve from existing unless research reveals changes",
    "standardSectionsNeeded": "Preserve from existing unless research reveals changes",
    "wordLimits": "Preserve from existing unless research reveals changes",
    "additionalInstructions": "Preserve from existing unless research reveals changes"
  },
  "toneStrategy": "Brief statement of how the voice is calibrated",
  "coverLetter": "Preserve or update — only if in standardSectionsNeeded",
  "projectStatement": "Preserve or update — only if in standardSectionsNeeded",
  "artistStatement": "Preserve or update — only if in standardSectionsNeeded",
  "directorsStatement": "Preserve or update — only if in standardSectionsNeeded",
  "personalStatement": "Preserve or update — only if in standardSectionsNeeded",
  "logline": "Preserve or update — only if in standardSectionsNeeded",
  "shortSynopsis": "Preserve or update — only if in standardSectionsNeeded",
  "longSynopsis": "Preserve or update — only if in standardSectionsNeeded",
  "budgetJustification": "Preserve or update — only if in standardSectionsNeeded",
  "impactStatement": "Preserve or update — only if in standardSectionsNeeded",
  "timeline": "Preserve or update — only if in standardSectionsNeeded",
  "comparableFilms": "Preserve or update — only if in standardSectionsNeeded",
  "targetAudience": "Preserve or update — only if in standardSectionsNeeded",
  "distributionStrategy": "Preserve or update — only if in standardSectionsNeeded",
  "bios": "Preserve or update — only if in standardSectionsNeeded",
  "customSections": "Preserve existing custom sections with updated content where needed",
  "externalMaterials": "Preserve existing external materials list, updating only if requirements changed",
  "accountsRequired": "Preserve existing account requirements, updating only if your re-research reveals changes. Cross-reference against the connected accounts list provided.",
  "strategicNotes": "...",
  "changesSummary": "Brief bullet points: what was updated and why, or 'No meaningful changes needed' if the draft already incorporates the latest intelligence well."
}`;
      }

      let messageContent;
      if (projectFiles.length > 0) {
        const blocks = [{ type: "text", text: textPrompt }];
        for (const f of projectFiles) {
          if (f.skipInAI) continue; // Stored for submission only, not sent to AI
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

      const txt = await askClaude(messageContent, true);
      const parsed = extractJSON(txt);

      if (parsed) {
        const currentApps = appsRef.current;
        const updatedApps = currentApps.map(a => {
          if (a.id !== appId) return a;
          const newContent = { ...a.content };
          // Copy over any fields that came back, including research + toneStrategy
          ["projectStatement", "artistStatement", "budgetJustification", "impactStatement", "timeline", "coverLetter", "strategicNotes", "research", "toneStrategy", "requirements", "customSections", "externalMaterials", "accountsRequired"].forEach(k => {
            if (parsed[k]) newContent[k] = parsed[k];
          });
          return {
            ...a,
            content: newContent,
            deepResearch: true,
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

  // Retry an errored job by re-running its original operation
  const retryJob = (jobId) => {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;
    removeJob(jobId);
    // Dispatch based on job kind
    if (job.kind === "analyze" && job.meta?.projectId) {
      runAnalyze(job.meta.projectId);
    } else if (job.kind === "refresh" && job.meta?.appId) {
      runRefreshApp(job.meta.appId, job.meta.mode || "augment");
    } else if (job.kind === "generate") {
      // Generate needs original opp/project indices which aren't stable — user should redo manually
      console.warn("Generate jobs cannot be auto-retried, user should click Generate again");
    } else if (job.kind === "search") {
      console.warn("Search jobs should be retriggered manually from Discover tab");
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
              padding: "10px 12px",
              background: jobs.some(j => j.status === "error") ? C.dn + "15" : C.tl + "15",
              border: "1px solid " + (jobs.some(j => j.status === "error") ? C.dn : C.tl),
              borderRadius: "6px",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}>
              <span style={{
                display: "inline-block",
                width: "8px",
                height: "8px",
                background: jobs.some(j => j.status === "running") ? C.tl : C.dn,
                borderRadius: "50%",
                animation: jobs.some(j => j.status === "running") ? "pulse 1.5s infinite" : "none"
              }} />
              <p style={{
                fontFamily: FN.m,
                fontSize: "11px",
                color: jobs.some(j => j.status === "error") ? C.dn : C.tl,
                fontWeight: 600
              }}>
                {jobs.filter(j => j.status === "running").length} RUNNING
                {jobs.some(j => j.status === "error") && " · " + jobs.filter(j => j.status === "error").length + " ERR"}
              </p>
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
        {jobs.length > 0 && (
          <div style={{
            marginBottom: "24px",
            background: jobs.some(j => j.status === "error") ? C.dn + "10" : C.tl + "10",
            border: "1px solid " + (jobs.some(j => j.status === "error") ? C.dn + "50" : C.tl + "50"),
            borderRadius: "12px",
            padding: "16px 20px",
            position: "sticky",
            top: "16px",
            zIndex: 20,
            backdropFilter: "blur(8px)"
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "10px"
            }}>
              <span style={{
                display: "inline-block",
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background: jobs.some(j => j.status === "running") ? C.tl : C.dn,
                animation: jobs.some(j => j.status === "running") ? "pulse 1.5s infinite" : "none"
              }} />
              <h3 style={{
                fontFamily: FN.d,
                fontSize: "17px",
                fontStyle: "italic",
                color: jobs.some(j => j.status === "error") ? C.dn : C.tl
              }}>
                Background Jobs — {jobs.filter(j => j.status === "running").length} running
                {jobs.some(j => j.status === "error") && ", " + jobs.filter(j => j.status === "error").length + " failed"}
              </h3>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {jobs.map(j => (
                <div key={j.id} style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "12px",
                  padding: "10px 14px",
                  background: C.bg,
                  borderRadius: "8px",
                  borderLeft: "3px solid " + (j.status === "error" ? C.dn : C.tl)
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontSize: "13px",
                      color: j.status === "error" ? C.dn : C.tx,
                      marginBottom: j.error ? "4px" : 0,
                      fontWeight: 500
                    }}>
                      {j.status === "running" ? "⏳ " : "⚠ "}
                      {j.label}
                    </p>
                    {j.error && (
                      <p style={{ fontSize: "11px", color: C.tm, lineHeight: 1.4 }}>
                        {j.error}
                      </p>
                    )}
                  </div>
                  {j.status === "error" && (
                    <div style={{ display: "flex", gap: "6px" }}>
                      {(j.kind === "analyze" || j.kind === "refresh") && (
                        <Btn variant="teal" small onClick={() => retryJob(j.id)}>↻ Retry</Btn>
                      )}
                      <Btn variant="ghost" small onClick={() => dismissJob(j.id)}>Dismiss</Btn>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {jobs.filter(j => j.status === "error").length > 1 && (
              <div style={{ marginTop: "10px", textAlign: "right" }}>
                <Btn
                  variant="ghost"
                  small
                  onClick={() => {
                    jobs.filter(j => j.status === "error").forEach(j => dismissJob(j.id));
                  }}
                >Dismiss All Errors</Btn>
                <Btn
                  variant="teal"
                  small
                  onClick={async () => {
                    const errored = jobs.filter(j => j.status === "error" && (j.kind === "analyze" || j.kind === "refresh"));
                    for (const j of errored) {
                      retryJob(j.id);
                      // Small stagger so we don't immediately hit rate limits
                      await new Promise(r => setTimeout(r, 500));
                    }
                  }}
                  style={{ marginLeft: "8px" }}
                >↻ Retry All</Btn>
              </div>
            )}
          </div>
        )}

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

  // Portfolio strategy calculations (defensive against malformed data)
  const safeApps = Array.isArray(apps) ? apps : [];
  const activeApps = safeApps.filter(a => a && (a.status === "draft" || a.status === "approved" || a.status === "submitted"));
  const mix = {
    reach: activeApps.filter(a => a.matchStrength === "speculative").length,
    target: activeApps.filter(a => a.matchStrength === "moderate").length,
    safety: activeApps.filter(a => a.matchStrength === "strong").length,
    unknown: activeApps.filter(a => !a.matchStrength).length
  };
  const totalMix = mix.reach + mix.target + mix.safety + mix.unknown;

  // Outcome stats for success rate
  const withOutcome = safeApps.filter(a => a && a.outcome).length;
  const wins = safeApps.filter(a => a && a.outcome === "won").length;
  const successRate = withOutcome > 0 ? Math.round((wins / withOutcome) * 100) : null;

  // Fees committed (drafts + approved + submitted not yet received outcomes)
  const feesCommitted = safeApps
    .filter(a => a && (a.status === "draft" || a.status === "approved") && a.cost > 0)
    .reduce((s, a) => s + a.cost, 0);
  const feesSpent = safeApps
    .filter(a => a && a.status === "submitted")
    .reduce((s, a) => s + (a.cost || 0), 0);

  // Upcoming material deadlines across all apps
  const materialDeadlines = [];
  safeApps.forEach(app => {
    if (!app || app.status === "submitted") return;
    if (app.content && Array.isArray(app.content.externalMaterials)) {
      app.content.externalMaterials.forEach(mat => {
        if (!mat) return;
        if (mat.dueDate && mat.status !== "received" && mat.status !== "na") {
          const d = new Date(mat.dueDate);
          if (isNaN(d.getTime())) return;
          const daysUntil = Math.ceil((d - new Date()) / (1000 * 60 * 60 * 24));
          materialDeadlines.push({
            appName: app.oppName || "Unknown",
            projTitle: app.projTitle || "Unknown project",
            matName: mat.name || "Unnamed material",
            assignedTo: mat.assignedTo || "",
            daysUntil,
            dueDate: mat.dueDate
          });
        }
      });
    }
  });
  materialDeadlines.sort((a, b) => a.daysUntil - b.daysUntil);

  // Portfolio warnings
  const warnings = [];
  if (totalMix > 3) {
    if (mix.reach / totalMix > 0.7) {
      warnings.push("Your pipeline is heavily weighted toward long-shots. Consider adding some moderate-match targets to balance risk and burnout.");
    }
    if (mix.safety === 0 && mix.target === 0 && totalMix > 5) {
      warnings.push("No strong-match opportunities in your pipeline. These are your highest-probability wins — search for some in Discover.");
    }
  }
  if (pay && feesCommitted > pay.monthlyBudget * 1.5) {
    warnings.push("You have $" + feesCommitted.toFixed(0) + " in draft/approved fees — that's over your monthly budget. Review before submitting.");
  }
  if (withOutcome >= 5 && successRate !== null && successRate < 20) {
    warnings.push("Success rate is " + successRate + "% across " + withOutcome + " decided applications. Consider reviewing post-mortems to find patterns.");
  }

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
        marginBottom: "16px"
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

      {totalMix > 0 && (
        <Card style={{ marginBottom: "16px", borderColor: C.ac + "30" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "14px" }}>
            <h3 style={{ fontFamily: FN.d, fontSize: "18px", fontStyle: "italic" }}>
              📊 Portfolio Strategy
            </h3>
            {successRate !== null && (
              <p style={{ fontSize: "12px", color: C.tm, fontFamily: FN.m }}>
                SUCCESS RATE: <span style={{ color: successRate >= 30 ? C.ok : (successRate >= 15 ? C.wn : C.dn), fontWeight: 700 }}>{successRate}%</span> ({wins}/{withOutcome} decided)
              </p>
            )}
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "10px",
            marginBottom: "14px"
          }}>
            <div style={{
              background: C.ok + "10",
              padding: "14px",
              borderRadius: "8px",
              borderLeft: "3px solid " + C.ok
            }}>
              <p style={{ ...LS, color: C.ok, marginBottom: "6px" }}>SAFETY / STRONG MATCH</p>
              <p style={{ fontFamily: FN.d, fontSize: "26px", fontStyle: "italic", color: C.ok }}>
                {mix.safety}
              </p>
              <p style={{ fontSize: "10px", color: C.tm, marginTop: "2px" }}>
                Highest probability wins
              </p>
            </div>
            <div style={{
              background: C.wn + "10",
              padding: "14px",
              borderRadius: "8px",
              borderLeft: "3px solid " + C.wn
            }}>
              <p style={{ ...LS, color: C.wn, marginBottom: "6px" }}>TARGET / MODERATE</p>
              <p style={{ fontFamily: FN.d, fontSize: "26px", fontStyle: "italic", color: C.wn }}>
                {mix.target}
              </p>
              <p style={{ fontSize: "10px", color: C.tm, marginTop: "2px" }}>
                Realistic stretch
              </p>
            </div>
            <div style={{
              background: C.pp + "10",
              padding: "14px",
              borderRadius: "8px",
              borderLeft: "3px solid " + C.pp
            }}>
              <p style={{ ...LS, color: C.pp, marginBottom: "6px" }}>REACH / LONG SHOT</p>
              <p style={{ fontFamily: FN.d, fontSize: "26px", fontStyle: "italic", color: C.pp }}>
                {mix.reach}
              </p>
              <p style={{ fontSize: "10px", color: C.tm, marginTop: "2px" }}>
                Aspirational
              </p>
            </div>
          </div>

          <div style={{
            display: "flex",
            gap: "20px",
            padding: "12px 14px",
            background: C.bg,
            borderRadius: "6px",
            marginBottom: warnings.length > 0 ? "12px" : 0
          }}>
            <div>
              <p style={{ ...LS, marginBottom: "4px" }}>FEES COMMITTED</p>
              <p style={{ fontFamily: FN.d, fontSize: "18px", fontStyle: "italic", color: C.wn }}>
                ${feesCommitted.toFixed(0)}
              </p>
              <p style={{ fontSize: "10px", color: C.tm }}>draft + approved</p>
            </div>
            <div>
              <p style={{ ...LS, marginBottom: "4px" }}>FEES SPENT</p>
              <p style={{ fontFamily: FN.d, fontSize: "18px", fontStyle: "italic", color: C.tx }}>
                ${feesSpent.toFixed(0)}
              </p>
              <p style={{ fontSize: "10px", color: C.tm }}>submitted</p>
            </div>
            <div>
              <p style={{ ...LS, marginBottom: "4px" }}>IN PIPELINE</p>
              <p style={{ fontFamily: FN.d, fontSize: "18px", fontStyle: "italic", color: C.ac }}>
                {activeApps.length}
              </p>
              <p style={{ fontSize: "10px", color: C.tm }}>active applications</p>
            </div>
          </div>

          {warnings.map((w, i) => (
            <div key={i} style={{
              padding: "10px 14px",
              background: C.wn + "10",
              border: "1px solid " + C.wn + "40",
              borderRadius: "6px",
              marginTop: "8px"
            }}>
              <p style={{ fontSize: "12px", color: C.tx, lineHeight: 1.5 }}>
                ⚠ {w}
              </p>
            </div>
          ))}
        </Card>
      )}

      {materialDeadlines.length > 0 && (
        <Card style={{ marginBottom: "16px", borderColor: C.wn + "40" }}>
          <h3 style={{ fontFamily: FN.d, fontSize: "18px", fontStyle: "italic", marginBottom: "12px" }}>
            📎 External Materials Due
          </h3>
          <p style={{ fontSize: "11px", color: C.tm, marginBottom: "12px" }}>
            Letters of rec, artwork, videos, etc. that need to be gathered before submitting
          </p>
          {materialDeadlines.slice(0, 5).map((m, i) => (
            <div key={i} style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "10px 14px",
              background: C.bg,
              borderRadius: "6px",
              borderLeft: "3px solid " + (m.daysUntil < 0 ? C.dn : (m.daysUntil <= 7 ? C.wn : C.tl)),
              marginBottom: "6px"
            }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: "13px", fontWeight: 500 }}>{m.matName}</p>
                <p style={{ fontSize: "11px", color: C.tm }}>
                  {m.appName} · {m.projTitle}{m.assignedTo ? " · " + m.assignedTo : ""}
                </p>
              </div>
              <p style={{
                fontFamily: FN.m,
                fontSize: "12px",
                fontWeight: 700,
                color: m.daysUntil < 0 ? C.dn : (m.daysUntil <= 7 ? C.wn : C.tl)
              }}>
                {m.daysUntil < 0 ? Math.abs(m.daysUntil) + "d overdue" : m.daysUntil + "d"}
              </p>
            </div>
          ))}
        </Card>
      )}

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
    const skipped = [];
    for (const file of fileList) {
      if (file.size > MAX_FILE_SIZE) {
        setUploadErr(file.name + " exceeds 10MB limit");
        continue;
      }
      try {
        const mediaType = getMediaType(file.name);
        const isText = mediaType === "text/plain";
        // Heuristic: screenplay PDFs over ~1.5MB are very likely 100+ pages
        // and will fail the Anthropic API's document limit. We still store them
        // (for submission purposes) but skip them when sending to the AI.
        const skipInAI = category === "screenplay" && mediaType === "application/pdf" && file.size > 1_500_000;
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
          uploadedAt: new Date().toISOString(),
          skipInAI: skipInAI
        });
        if (skipInAI) skipped.push(file.name);
      } catch (err) {
        setUploadErr("Failed to read " + file.name);
      }
    }
    if (newFiles.length > 0) {
      setFiles([...files, ...newFiles]);
    }
    if (skipped.length > 0) {
      setUploadErr(
        "📎 " + skipped.join(", ") + " stored for submission. " +
        "PDFs over ~100 pages exceed Anthropic's AI reading limit, so this file WON'T be sent to the AI for analysis — " +
        "but it's safely stored in the app for you to download and submit when the time comes. " +
        "For AI analysis to read your script, also upload a .txt version (open the PDF, copy all text, paste into a .txt file)."
      );
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
              {a && a.analyzedAt && " · Last analyzed " + new Date(a.analyzedAt).toLocaleString()}
              {a && a.basedOnFiles > 0 && " · " + a.basedOnFiles + " file(s)"}
            </p>
          </div>
          <Btn
            variant="teal"
            small
            onClick={() => runAnalyze(p.id)}
            disabled={isAnalyzing(p.id)}
          >{isAnalyzing(p.id) ? "Analyzing..." : "↻ Re-analyze"}</Btn>
        </div>

        {isAnalyzing(p.id) && !a && <Loader text="Running deep analysis with your uploaded materials..." />}

        {isAnalyzing(p.id) && a && (
          <Card style={{
            marginBottom: "16px",
            borderColor: C.tl + "50",
            background: C.tl + "10"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{
                display: "inline-block",
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background: C.tl,
                animation: "pulse 1.5s infinite"
              }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: "14px", fontWeight: 600, color: C.tl }}>
                  Re-analysis in progress
                </p>
                <p style={{ fontSize: "12px", color: C.tm, marginTop: "2px" }}>
                  The existing analysis below stays visible. It'll be replaced when the new one is ready.
                </p>
              </div>
            </div>
          </Card>
        )}

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
                  onClick={async () => {
                    // Run sequentially to avoid rate limits and errors
                    for (const ap of staleForThis) {
                      await runRefreshApp(ap.id, "augment");
                    }
                  }}
                >✨ Augment All (Sequential)</Btn>
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

        {a && (
          <div key={a.analyzedAt || "analysis"}>
            {a.team && (
              <Card style={{ marginBottom: "16px", borderColor: C.ok + "40", background: C.ok + "06" }}>
                <h3 style={{
                  fontFamily: FN.d,
                  fontSize: "20px",
                  fontStyle: "italic",
                  marginBottom: "6px"
                }}>👥 Team Leverage</h3>
                <p style={{ fontSize: "11px", color: C.tm, fontFamily: FN.m, marginBottom: "20px" }}>
                  Deep research on every named collaborator
                </p>
                {a.team.members && a.team.members.length > 0 && (
                  <div style={{ marginBottom: "20px" }}>
                    {a.team.members.map((m, i) => (
                      <div key={i} style={{
                        background: C.bg,
                        borderRadius: "8px",
                        padding: "16px",
                        marginBottom: "10px",
                        borderLeft: "3px solid " + C.ok
                      }}>
                        <div style={{
                          display: "flex",
                          alignItems: "baseline",
                          gap: "10px",
                          marginBottom: "8px",
                          flexWrap: "wrap"
                        }}>
                          <h4 style={{
                            fontFamily: FN.d,
                            fontSize: "18px",
                            fontStyle: "italic",
                            color: C.ok
                          }}>{m.name}</h4>
                          {m.role && (
                            <Bdg color={C.tl}>{m.role}</Bdg>
                          )}
                        </div>
                        {m.researchedCredits && (
                          <div style={{ marginBottom: "10px" }}>
                            <p style={{ ...LS, marginBottom: "4px" }}>CREDITS</p>
                            <p style={{ fontSize: "13px", lineHeight: 1.6 }}>{m.researchedCredits}</p>
                          </div>
                        )}
                        {m.awardsAndHonors && (
                          <div style={{ marginBottom: "10px" }}>
                            <p style={{ ...LS, marginBottom: "4px", color: C.wn }}>🏆 AWARDS & HONORS</p>
                            <p style={{ fontSize: "13px", lineHeight: 1.6, color: C.wn }}>{m.awardsAndHonors}</p>
                          </div>
                        )}
                        {m.industryStanding && (
                          <div style={{ marginBottom: "10px" }}>
                            <p style={{ ...LS, marginBottom: "4px" }}>INDUSTRY STANDING</p>
                            <p style={{ fontSize: "13px", lineHeight: 1.6 }}>{m.industryStanding}</p>
                          </div>
                        )}
                        {m.leveragePoints && (
                          <div style={{ marginBottom: "10px" }}>
                            <p style={{ ...LS, marginBottom: "4px", color: C.ac }}>🎯 LEVERAGE POINTS</p>
                            <p style={{ fontSize: "13px", lineHeight: 1.6, color: C.tx }}>{m.leveragePoints}</p>
                          </div>
                        )}
                        {m.unlockedOpportunities && (
                          <div>
                            <p style={{ ...LS, marginBottom: "4px", color: C.ok }}>🔓 UNLOCKED OPPORTUNITIES</p>
                            <p style={{ fontSize: "13px", lineHeight: 1.6, color: C.ok }}>{m.unlockedOpportunities}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {a.team.collectiveLeverage && (
                  <InfoBlock label="Collective Leverage" content={a.team.collectiveLeverage} color={C.ok} />
                )}
                {a.team.namesToForeground && (
                  <InfoBlock label="Names to Foreground in Applications" content={a.team.namesToForeground} color={C.ok} />
                )}
                {a.team.researchGaps && (
                  <div style={{
                    marginTop: "12px",
                    padding: "10px 12px",
                    background: C.wn + "10",
                    border: "1px solid " + C.wn + "30",
                    borderRadius: "6px"
                  }}>
                    <p style={{ ...LS, color: C.wn, marginBottom: "4px" }}>⚠ RESEARCH GAPS</p>
                    <p style={{ fontSize: "12px", color: C.tx, lineHeight: 1.5 }}>{a.team.researchGaps}</p>
                  </div>
                )}
              </Card>
            )}

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
            Upload supporting materials. The AI analyzes these directly when generating your project intelligence report and applications. Max 10MB per file. <strong style={{ color: C.ac }}>Screenplay PDFs over ~100 pages</strong> are stored for submission use but won't be sent to the AI — upload a .txt version alongside if you want the AI to read the full script.
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
                        <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                          <span style={{ color: C.tx }}>{f.name}</span>
                          <span style={{ color: C.td, fontFamily: FN.m }}>
                            {formatFileSize(f.size)}
                          </span>
                          {f.skipInAI && (
                            <span
                              title="This file is stored for your submission use but not sent to the AI (PDFs over 100 pages exceed the API limit). Upload a .txt version if you want the AI to read the script."
                              style={{
                                fontSize: "10px",
                                color: C.ac,
                                fontFamily: FN.m,
                                padding: "2px 6px",
                                background: C.ac + "15",
                                border: "1px solid " + C.ac + "40",
                                borderRadius: "3px"
                              }}
                            >📎 submission only</span>
                          )}
                        </div>
                        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                          <button
                            onClick={() => {
                              try {
                                let blob;
                                if (f.isText) {
                                  blob = new Blob([f.data], { type: "text/plain" });
                                } else {
                                  const byteStr = atob(f.data);
                                  const bytes = new Uint8Array(byteStr.length);
                                  for (let j = 0; j < byteStr.length; j++) bytes[j] = byteStr.charCodeAt(j);
                                  blob = new Blob([bytes], { type: f.mediaType });
                                }
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement("a");
                                a.href = url;
                                a.download = f.name;
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                                URL.revokeObjectURL(url);
                              } catch (e) {
                                alert("Download failed: " + (e.message || "unknown error"));
                              }
                            }}
                            title="Download"
                            style={{
                              background: "none",
                              border: "none",
                              color: C.ac,
                              cursor: "pointer",
                              fontSize: "14px",
                              padding: "0 4px"
                            }}
                          >⬇</button>
                          <button
                            onClick={() => removeFile(f.id)}
                            title="Remove"
                            style={{
                              background: "none",
                              border: "none",
                              color: C.dn,
                              cursor: "pointer",
                              fontSize: "14px",
                              padding: "0 4px"
                            }}
                          >×</button>
                        </div>
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
                {o.teamAdvantage && (
                  <div style={{
                    background: C.ok + "10",
                    border: "1px solid " + C.ok + "30",
                    borderRadius: "6px",
                    padding: "10px 12px",
                    marginBottom: "10px"
                  }}>
                    <p style={{
                      fontSize: "11px",
                      fontFamily: FN.m,
                      color: C.ok,
                      marginBottom: "4px"
                    }}>🔑 TEAM ADVANTAGE</p>
                    <p style={{ fontSize: "12px", lineHeight: 1.5, color: C.tx }}>{o.teamAdvantage}</p>
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
  const [outcomeMdl, setOutcomeMdl] = useState(null);
  const [outcomeForm, setOutcomeForm] = useState({ outcome: "", notes: "", postMortem: "" });
  const [humanizingKey, setHumanizingKey] = useState(null);
  const [listFilter, setListFilter] = useState("all");

  // Reset opportunity selection when project changes (available list shifts)
  useEffect(() => {
    setSelO(null);
  }, [selP]);

  // Also reset if the currently selected opp has been applied to (e.g., generation just finished)
  useEffect(() => {
    if (selO === null) return;
    const currentProj = projects[selP];
    if (!currentProj) return;
    const opp = opps[selO];
    if (!opp) {
      setSelO(null);
      return;
    }
    const key = (opp.name || "").toLowerCase().trim() + "|" + (opp.organization || "").toLowerCase().trim();
    const alreadyApplied = apps.some(ap =>
      ap.projTitle === currentProj.title &&
      (ap.oppName || "").toLowerCase().trim() + "|" + (ap.oppOrg || "").toLowerCase().trim() === key
    );
    if (alreadyApplied) setSelO(null);
  }, [apps, selO, selP, projects, opps]);

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
    const c = app.content || {};
    // Standard section metadata — kept in sync with the generate prompt's standardSectionsNeeded enum
    const standardSectionMeta = {
      coverLetter: "Cover Letter",
      projectStatement: "Project Statement",
      artistStatement: "Artist Statement",
      directorsStatement: "Director's Statement",
      personalStatement: "Personal Statement",
      logline: "Logline",
      shortSynopsis: "Short Synopsis",
      longSynopsis: "Long Synopsis",
      budgetJustification: "Budget Justification",
      impactStatement: "Impact Statement",
      timeline: "Timeline",
      comparableFilms: "Comparable Films",
      targetAudience: "Target Audience",
      distributionStrategy: "Distribution Strategy",
      bios: "Bios"
    };
    const allStandardKeys = Object.keys(standardSectionMeta);

    // Determine which standard sections are "needed" based on requirements
    // If requirements aren't present (older apps), fall back to showing any section with content
    const needed = c.requirements && Array.isArray(c.requirements.standardSectionsNeeded)
      ? c.requirements.standardSectionsNeeded
      : allStandardKeys.filter(k => c[k]);

    const wordLimits = (c.requirements && c.requirements.wordLimits) || {};

    // Build the required sections list
    const requiredSections = needed
      .map(k => ({
        t: standardSectionMeta[k] + (wordLimits[k] ? " (" + wordLimits[k] + ")" : ""),
        v: c[k],
        k: k,
        isCustom: false
      }))
      .filter(s => s.v);

    // Custom sections from requirements
    const customSectionsList = (Array.isArray(c.customSections) ? c.customSections : []).map(cs => ({
      t: cs.title + (cs.wordLimit && cs.wordLimit !== "unspecified" ? " (" + cs.wordLimit + ")" : ""),
      v: cs.content,
      k: "custom:" + cs.key,
      isCustom: true,
      customKey: cs.key
    })).filter(s => s.v);

    // Sections that were generated but not required by this opportunity
    const extraSections = allStandardKeys
      .filter(k => !needed.includes(k) && c[k])
      .map(k => ({
        t: standardSectionMeta[k],
        v: c[k],
        k: k,
        isCustom: false
      }));

    const sections = [...requiredSections, ...customSectionsList];

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
      const newContent = { ...updated[view].content };
      if (key.startsWith("custom:")) {
        const customKey = key.slice(7);
        newContent.customSections = (newContent.customSections || []).map(cs =>
          cs.key === customKey ? { ...cs, content: draftText } : cs
        );
      } else {
        newContent[key] = draftText;
      }
      updated[view] = {
        ...updated[view],
        content: newContent,
        editedAt: new Date().toISOString(),
        status: updated[view].status === "approved" ? "draft" : updated[view].status,
        checks: updated[view].status === "approved"
          ? { content: false, cost: false, ready: false }
          : updated[view].checks
      };
      save(updated);
      setEditingKey(null);
      setDraftText("");
    };

    const humanizeSection = async (sectionKey, currentText, sectionTitle) => {
      if (!currentText) return;
      setHumanizingKey(sectionKey);
      try {
        const prompt = `You are rewriting a grant application section to remove any AI-detection tells. The reviewer may use AI-detection tools or simply have a trained ear for machine-generated prose. Your job is to rewrite this section so it reads as genuinely human-written while preserving ALL the factual content and strategic emphasis of the original.

SECTION TITLE: ${sectionTitle}
CURRENT TEXT:
${currentText}

REWRITE MANDATES:
1. BAN these words entirely: "compelling", "timely", "important", "vital", "transformative", "resonates", "navigates", "explores", "delves into", "tapestry", "landscape", "journey", "powerful", "profound", "unique perspective", "diverse voices" (as generic phrase), "meaningful", "thought-provoking", "visceral", "nuanced", "at its core", "multifaceted". These are the biggest AI tells. Find synonyms or restructure sentences entirely to avoid them.
2. VARY sentence length dramatically. Mix 4-word sentences with 30-word ones. Avoid the even, balanced rhythm that characterizes LLM output.
3. Cut hedging language: "seeks to explore" → "explores", "aims to" → "does", "attempts to" → "does".
4. Add specificity. Where the current text is abstract ("themes of loss"), reach into the project and replace with specific imagery or scenes (the grandmother's matchbook, the blue neon of the diner sign).
5. Embrace idiosyncrasy. Include unexpected word choices, occasional sentence fragments, personal asides — the tells of actual human writing.
6. Cut filler. Every word must earn its place.
7. DO NOT change the substantive content, strategic emphasis, or factual claims. Preserve all references to team members, credits, and specific project details.
8. DO NOT make it longer. Tighter is better.

Respond with ONLY the rewritten text. No preamble, no explanation, no quotes around it, no markdown. Just the rewritten section.`;

        const rewritten = await askClaude(prompt);
        if (rewritten && rewritten.trim()) {
          const updated = [...apps];
          const newContent = { ...updated[view].content };
          if (sectionKey.startsWith("custom:")) {
            const customKey = sectionKey.slice(7);
            newContent.customSections = (newContent.customSections || []).map(cs =>
              cs.key === customKey ? { ...cs, content: rewritten.trim() } : cs
            );
          } else {
            newContent[sectionKey] = rewritten.trim();
          }
          updated[view] = {
            ...updated[view],
            content: newContent,
            editedAt: new Date().toISOString(),
            humanized: true,
            status: updated[view].status === "approved" ? "draft" : updated[view].status,
            checks: updated[view].status === "approved"
              ? { content: false, cost: false, ready: false }
              : updated[view].checks
          };
          save(updated);
        }
      } catch (e) {
        console.error("Humanize error:", e);
        alert("Humanize failed: " + (e.message || "unknown error"));
      } finally {
        setHumanizingKey(null);
      }
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
              {app.deepResearch ? " · 🔍" : ""}
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
              {app.status === "submitted" && !app.outcome && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
                  <span style={{ fontSize: "13px", color: C.ok, fontFamily: FN.m }}>
                    ✓ Submitted
                  </span>
                  <Btn
                    variant="teal"
                    small
                    onClick={() => {
                      setOutcomeForm({ outcome: "", notes: "", postMortem: "" });
                      setOutcomeMdl(view);
                    }}
                  >Record Outcome</Btn>
                </div>
              )}
              {app.status === "submitted" && app.outcome && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
                  <Bdg color={
                    app.outcome === "won" ? C.ok :
                    app.outcome === "waitlisted" ? C.ac :
                    app.outcome === "rejected" ? C.dn :
                    C.tm
                  }>{
                    app.outcome === "won" ? "🏆 WON" :
                    app.outcome === "waitlisted" ? "⏳ WAITLISTED" :
                    app.outcome === "rejected" ? "✗ REJECTED" :
                    "— GHOSTED"
                  }</Bdg>
                  {app.outcomeDate && (
                    <p style={{ fontSize: "11px", color: C.tm }}>
                      {new Date(app.outcomeDate).toLocaleDateString()}
                    </p>
                  )}
                  <Btn
                    variant="ghost"
                    small
                    onClick={() => {
                      setOutcomeForm({
                        outcome: app.outcome,
                        notes: app.outcomeNotes || "",
                        postMortem: app.postMortem || ""
                      });
                      setOutcomeMdl(view);
                    }}
                  >✎ Edit Outcome</Btn>
                </div>
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

        {c.research && (
          <Card style={{
            marginBottom: "12px",
            borderColor: C.pp + "30",
            background: C.pp + "06"
          }}>
            <h3 style={{
              fontFamily: FN.d,
              fontSize: "18px",
              fontStyle: "italic",
              marginBottom: "4px",
              color: C.pp
            }}>🔍 Opportunity Research</h3>
            <p style={{ fontSize: "11px", color: C.tm, fontFamily: FN.m, marginBottom: "16px" }}>
              What the AI learned about this opportunity before writing
            </p>
            {c.research.orgMission && (
              <InfoBlock label="Organization Mission" content={c.research.orgMission} color={C.pp} />
            )}
            {c.research.aestheticPrefs && (
              <InfoBlock label="Aesthetic Preferences" content={c.research.aestheticPrefs} color={C.pp} />
            )}
            {c.research.toneVoice && (
              <InfoBlock label="Their Voice & Tone" content={c.research.toneVoice} color={C.pp} />
            )}
            {c.research.keyCriteria && (
              <InfoBlock label="Key Selection Criteria" content={c.research.keyCriteria} color={C.pp} />
            )}
            {c.research.strategicInsight && (
              <InfoBlock label="Strategic Insight" content={c.research.strategicInsight} color={C.pp} />
            )}
          </Card>
        )}

        {c.toneStrategy && (
          <Card style={{
            marginBottom: "12px",
            borderColor: C.tl + "30",
            background: C.tl + "06"
          }}>
            <p style={{
              fontFamily: FN.m,
              fontSize: "11px",
              color: C.tl,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              marginBottom: "8px"
            }}>🎯 Tone Strategy</p>
            <p style={{
              fontSize: "13px",
              lineHeight: 1.6,
              whiteSpace: "pre-wrap",
              color: C.tx
            }}>{c.toneStrategy}</p>
          </Card>
        )}

        {(profile.contactEmail || profile.contactPhone) && (
          <Card style={{
            marginBottom: "12px",
            borderColor: C.ok + "40",
            background: C.ok + "06"
          }}>
            <h3 style={{
              fontFamily: FN.d,
              fontSize: "16px",
              fontStyle: "italic",
              color: C.ok,
              marginBottom: "4px"
            }}>📬 Contact for Responses</h3>
            <p style={{ fontSize: "11px", color: C.tm, fontFamily: FN.m, marginBottom: "12px" }}>
              Included in this application — where the committee will reply
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {profile.contactName && (
                <p style={{ fontSize: "13px", color: C.tx }}>
                  <span style={{ color: C.tm, fontFamily: FN.m, fontSize: "11px", marginRight: "8px" }}>NAME</span>
                  {profile.contactName}
                </p>
              )}
              {profile.contactEmail && (
                <p style={{ fontSize: "13px", color: C.tx }}>
                  <span style={{ color: C.tm, fontFamily: FN.m, fontSize: "11px", marginRight: "8px" }}>EMAIL</span>
                  <a href={"mailto:" + profile.contactEmail} style={{ color: C.ac }}>{profile.contactEmail}</a>
                </p>
              )}
              {profile.contactPhone && (
                <p style={{ fontSize: "13px", color: C.tx }}>
                  <span style={{ color: C.tm, fontFamily: FN.m, fontSize: "11px", marginRight: "8px" }}>PHONE</span>
                  {profile.contactPhone}
                </p>
              )}
            </div>
            <p style={{ fontSize: "11px", color: C.tm, marginTop: "10px", lineHeight: 1.5 }}>
              To change, edit your Profile. Changes apply to newly generated or refreshed applications.
            </p>
          </Card>
        )}

        {c.requirements && (c.requirements.summary || (c.requirements.standardSectionsNeeded && c.requirements.standardSectionsNeeded.length > 0)) && (
          <Card style={{
            marginBottom: "12px",
            borderColor: C.ac + "40",
            background: C.ac + "06"
          }}>
            <h3 style={{
              fontFamily: FN.d,
              fontSize: "18px",
              fontStyle: "italic",
              color: C.ac,
              marginBottom: "4px"
            }}>📋 What This Application Requires</h3>
            <p style={{ fontSize: "11px", color: C.tm, fontFamily: FN.m, marginBottom: "10px" }}>
              Based on the AI's research of this opportunity's actual submission guidelines
            </p>
            <div style={{
              padding: "10px 12px",
              background: C.wn + "12",
              border: "1px solid " + C.wn + "40",
              borderRadius: "6px",
              marginBottom: "14px"
            }}>
              <p style={{ fontSize: "11px", color: C.tx, lineHeight: 1.5, fontFamily: FN.m }}>
                ⚠ <strong>Verify before submitting.</strong> The AI's requirements research is not always complete — occasionally it misses fields or mislabels them. Before you submit, open the opportunity's actual application portal and confirm every field is accounted for. If you find a missing field, use Refresh → Regenerate to re-research, or add it as a custom section by editing this application.
              </p>
            </div>
            {c.requirements.summary && (
              <p style={{
                fontSize: "13px",
                lineHeight: 1.6,
                color: C.tx,
                marginBottom: "14px"
              }}>{c.requirements.summary}</p>
            )}
            {sections.length > 0 && (
              <div style={{ marginBottom: "10px" }}>
                <p style={{ ...LS, marginBottom: "6px" }}>REQUIRED SECTIONS</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  {sections.map((s, i) => (
                    <p key={i} style={{ fontSize: "12px", color: C.tx }}>
                      ✓ {s.t}
                    </p>
                  ))}
                </div>
              </div>
            )}
            {c.requirements.additionalInstructions && (
              <div style={{ marginTop: "10px" }}>
                <p style={{ ...LS, marginBottom: "4px" }}>SPECIAL INSTRUCTIONS</p>
                <p style={{ fontSize: "12px", color: C.tx, lineHeight: 1.5 }}>
                  {c.requirements.additionalInstructions}
                </p>
              </div>
            )}
          </Card>
        )}

        {(() => {
          // Video Links card — user-managed list of URLs for pitch videos, reels, past films, etc.
          const videoLinks = Array.isArray(app.videoLinks) ? app.videoLinks : [];
          const updateVideoLinks = (next) => {
            const updated = [...apps];
            updated[view] = {
              ...updated[view],
              videoLinks: next,
              editedAt: new Date().toISOString()
            };
            save(updated);
          };
          const addLink = () => {
            updateVideoLinks([
              ...videoLinks,
              { id: Date.now().toString() + "-" + Math.random().toString(36).slice(2, 6), label: "", url: "", password: "", kind: "pitch", notes: "" }
            ]);
          };
          const updateLink = (idx, patch) => {
            const next = videoLinks.map((l, i) => i === idx ? { ...l, ...patch } : l);
            updateVideoLinks(next);
          };
          const removeLink = (idx) => {
            updateVideoLinks(videoLinks.filter((_, i) => i !== idx));
          };
          const copyToClipboard = async (text) => {
            try {
              await navigator.clipboard.writeText(text);
            } catch (e) {
              // Fallback for older browsers
              const ta = document.createElement("textarea");
              ta.value = text;
              document.body.appendChild(ta);
              ta.select();
              try { document.execCommand("copy"); } catch (e2) {}
              document.body.removeChild(ta);
            }
          };
          return (
            <Card style={{
              marginBottom: "12px",
              borderColor: C.tl + "40",
              background: C.tl + "06"
            }}>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "4px"
              }}>
                <h3 style={{
                  fontFamily: FN.d,
                  fontSize: "18px",
                  fontStyle: "italic",
                  color: C.tl
                }}>🎬 Video Links</h3>
                {videoLinks.length > 0 && (
                  <Bdg color={C.tl}>{videoLinks.length} link{videoLinks.length === 1 ? "" : "s"}</Bdg>
                )}
              </div>
              <p style={{ fontSize: "11px", color: C.tm, fontFamily: FN.m, marginBottom: "14px" }}>
                Store pitch videos, sizzle reels, past film links, and work samples for this application. Paste in URL and password (if password-protected) so it's all in one place when you submit.
              </p>
              {videoLinks.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "14px" }}>
                  {videoLinks.map((link, i) => (
                    <div key={link.id || i} style={{
                      background: C.bg,
                      padding: "12px 14px",
                      borderRadius: "6px",
                      borderLeft: "3px solid " + C.tl
                    }}>
                      <div style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "8px",
                        marginBottom: "8px"
                      }}>
                        <div>
                          <label style={LS}>Label</label>
                          <input
                            value={link.label || ""}
                            placeholder="e.g. Pitch video, Canvas trailer"
                            onChange={e => updateLink(i, { label: e.target.value })}
                          />
                        </div>
                        <div>
                          <label style={LS}>Type</label>
                          <select
                            value={link.kind || "pitch"}
                            onChange={e => updateLink(i, { kind: e.target.value })}
                          >
                            <option value="pitch">🎯 Pitch Video</option>
                            <option value="reel">🎞 Sizzle Reel / Director's Reel</option>
                            <option value="pastFilm">🎬 Past Film / Work Sample</option>
                            <option value="proofOfConcept">💡 Proof of Concept</option>
                            <option value="teaser">▶ Teaser / Trailer</option>
                            <option value="other">📎 Other</option>
                          </select>
                        </div>
                      </div>
                      <div style={{ marginBottom: "8px" }}>
                        <label style={LS}>URL</label>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <input
                            value={link.url || ""}
                            placeholder="https://vimeo.com/... or https://youtube.com/..."
                            onChange={e => updateLink(i, { url: e.target.value })}
                            style={{ flex: 1 }}
                          />
                          {link.url && (
                            <>
                              <Btn
                                variant="ghost"
                                small
                                onClick={() => copyToClipboard(link.url)}
                                title="Copy URL to clipboard"
                              >📋</Btn>
                              <Btn
                                variant="ghost"
                                small
                                onClick={() => window.open(link.url, "_blank")}
                                title="Open in new tab"
                              >↗</Btn>
                            </>
                          )}
                        </div>
                      </div>
                      <div style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr auto",
                        gap: "8px",
                        alignItems: "end"
                      }}>
                        <div>
                          <label style={LS}>Password (if any)</label>
                          <div style={{ display: "flex", gap: "6px" }}>
                            <input
                              value={link.password || ""}
                              placeholder="Leave blank if public"
                              onChange={e => updateLink(i, { password: e.target.value })}
                              style={{ flex: 1 }}
                            />
                            {link.password && (
                              <Btn
                                variant="ghost"
                                small
                                onClick={() => copyToClipboard(link.password)}
                                title="Copy password"
                              >📋</Btn>
                            )}
                          </div>
                        </div>
                        <div>
                          <label style={LS}>Notes (optional)</label>
                          <input
                            value={link.notes || ""}
                            placeholder="e.g. 3 min cut, expires May 1"
                            onChange={e => updateLink(i, { notes: e.target.value })}
                          />
                        </div>
                        <Btn
                          variant="ghost"
                          small
                          onClick={() => {
                            if (confirm("Remove this video link?")) removeLink(i);
                          }}
                          style={{ color: C.dn }}
                        >✗</Btn>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <Btn variant="secondary" small onClick={addLink}>+ Add Video Link</Btn>
            </Card>
          );
        })()}

        {c.accountsRequired && Array.isArray(c.accountsRequired) && c.accountsRequired.length > 0 && (() => {
          const userAccounts = (profile.connectedAccounts || []).map(a => (a.name || "").toLowerCase().trim());
          const withStatus = c.accountsRequired.map(acc => {
            const reqName = (acc.name || "").toLowerCase().trim();
            // Match if exact name matches OR if AI already marked alreadyMet
            const met = acc.alreadyMet || userAccounts.some(u => u === reqName || u.includes(reqName) || reqName.includes(u));
            return { ...acc, _met: met };
          });
          const metCount = withStatus.filter(a => a._met).length;
          const totalCount = withStatus.length;
          const allMet = metCount === totalCount;
          return (
            <Card style={{
              marginBottom: "12px",
              borderColor: allMet ? C.ok + "50" : C.pp + "50",
              background: (allMet ? C.ok : C.pp) + "08"
            }}>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "4px"
              }}>
                <h3 style={{
                  fontFamily: FN.d,
                  fontSize: "18px",
                  fontStyle: "italic",
                  color: allMet ? C.ok : C.pp
                }}>🔗 Account Prerequisites</h3>
                <Bdg color={allMet ? C.ok : C.pp}>
                  {metCount} / {totalCount} met
                </Bdg>
              </div>
              <p style={{ fontSize: "11px", color: C.tm, fontFamily: FN.m, marginBottom: "14px" }}>
                Accounts or memberships required before applying. Cross-referenced with your Profile → Connected Accounts.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {withStatus.map((acc, i) => (
                  <div key={i} style={{
                    background: C.bg,
                    padding: "12px 14px",
                    borderRadius: "6px",
                    borderLeft: "3px solid " + (acc._met ? C.ok : C.pp)
                  }}>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "8px",
                      marginBottom: "6px",
                      flexWrap: "wrap"
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                        <p style={{ fontSize: "14px", fontWeight: 600, color: C.tx }}>
                          {acc.name}
                        </p>
                        {acc._met ? (
                          <Bdg color={C.ok}>✓ YOU HAVE THIS</Bdg>
                        ) : (
                          <Bdg color={C.pp}>⚠ NEEDED</Bdg>
                        )}
                      </div>
                      {acc.url && (
                        <Btn
                          variant="ghost"
                          small
                          onClick={() => window.open(acc.url, "_blank")}
                          style={{ color: C.ac }}
                        >↗ Visit</Btn>
                      )}
                    </div>
                    {acc.reason && (
                      <p style={{ fontSize: "12px", color: C.tm, lineHeight: 1.5, marginBottom: acc.matchedAccount ? "4px" : 0 }}>
                        {acc.reason}
                      </p>
                    )}
                    {acc._met && acc.matchedAccount && (
                      <p style={{ fontSize: "11px", color: C.ok, fontFamily: FN.m }}>
                        ✓ Matched with: {acc.matchedAccount}
                      </p>
                    )}
                    {!acc._met && (
                      <p style={{ fontSize: "11px", color: C.pp, fontFamily: FN.m, marginTop: "4px" }}>
                        → Once you create this account, add it to Profile → Connected Accounts so the AI can cross-reference it for future applications.
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          );
        })()}

        {c.externalMaterials && Array.isArray(c.externalMaterials) && c.externalMaterials.length > 0 && (() => {
          const readyCount = c.externalMaterials.filter(m => m.status === "received" || m.status === "na").length;
          const totalCount = c.externalMaterials.length;
          const allReady = readyCount === totalCount;
          const updateMaterial = (idx, patch) => {
            const updated = [...apps];
            const newMaterials = [...(updated[view].content.externalMaterials || [])];
            newMaterials[idx] = { ...newMaterials[idx], ...patch };
            updated[view] = {
              ...updated[view],
              content: { ...updated[view].content, externalMaterials: newMaterials },
              editedAt: new Date().toISOString()
            };
            save(updated);
          };
          const uploadMaterialFile = async (idx, file) => {
            if (!file) return;
            if (file.size > 10 * 1024 * 1024) {
              alert("File is too large (max 10MB). Compress the PDF or reduce image size.");
              return;
            }
            try {
              const reader = new FileReader();
              reader.onload = () => {
                const result = reader.result;
                // data:application/pdf;base64,XXX → get the base64 part
                const base64 = result.split(",")[1];
                updateMaterial(idx, {
                  uploadedFile: {
                    name: file.name,
                    mediaType: file.type || "application/octet-stream",
                    size: file.size,
                    data: base64,
                    uploadedAt: new Date().toISOString()
                  },
                  // Auto-mark as received when a file is uploaded
                  status: "received"
                });
              };
              reader.readAsDataURL(file);
            } catch (e) {
              alert("Upload failed: " + (e.message || "unknown error"));
            }
          };
          const downloadMaterialFile = (mat) => {
            if (!mat.uploadedFile) return;
            try {
              const byteStr = atob(mat.uploadedFile.data);
              const bytes = new Uint8Array(byteStr.length);
              for (let i = 0; i < byteStr.length; i++) bytes[i] = byteStr.charCodeAt(i);
              const blob = new Blob([bytes], { type: mat.uploadedFile.mediaType });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = mat.uploadedFile.name;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            } catch (e) {
              alert("Download failed: " + (e.message || "unknown error"));
            }
          };
          return (
            <Card style={{
              marginBottom: "12px",
              borderColor: allReady ? C.ok + "50" : C.wn + "50",
              background: (allReady ? C.ok : C.wn) + "08"
            }}>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "4px"
              }}>
                <h3 style={{
                  fontFamily: FN.d,
                  fontSize: "18px",
                  fontStyle: "italic",
                  color: allReady ? C.ok : C.wn
                }}>{allReady ? "✓" : "⚠"} External Materials</h3>
                <Bdg color={allReady ? C.ok : C.wn}>
                  {readyCount} / {totalCount} ready
                </Bdg>
              </div>
              <p style={{ fontSize: "11px", color: C.tm, fontFamily: FN.m, marginBottom: "14px" }}>
                Track what you need to gather before submitting — letters of rec, artwork, videos, etc.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {c.externalMaterials.map((mat, i) => {
                  const isDone = mat.status === "received" || mat.status === "na";
                  const isOverdue = mat.dueDate && new Date(mat.dueDate) < new Date() && !isDone;
                  return (
                    <div key={i} style={{
                      background: C.bg,
                      padding: "12px 14px",
                      borderRadius: "6px",
                      borderLeft: "3px solid " + (isDone ? C.ok : (isOverdue ? C.dn : (mat.critical ? C.dn : C.wn))),
                      opacity: isDone ? 0.7 : 1
                    }}>
                      <div style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "10px",
                        marginBottom: "8px"
                      }}>
                        <input
                          type="checkbox"
                          checked={mat.status === "received"}
                          onChange={() => updateMaterial(i, {
                            status: mat.status === "received" ? "pending" : "received"
                          })}
                          style={{ marginTop: "3px", cursor: "pointer", width: "16px", height: "16px" }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            marginBottom: "4px",
                            flexWrap: "wrap"
                          }}>
                            <p style={{
                              fontSize: "13px",
                              fontWeight: 600,
                              color: C.tx,
                              textDecoration: isDone ? "line-through" : "none"
                            }}>
                              {mat.name}
                            </p>
                            {mat.critical && <Bdg color={C.dn}>REQUIRED</Bdg>}
                            {mat.status === "requested" && <Bdg color={C.ac}>REQUESTED</Bdg>}
                            {isOverdue && <Bdg color={C.dn}>OVERDUE</Bdg>}
                          </div>
                          {mat.requirement && (
                            <p style={{ fontSize: "12px", color: C.tm, marginBottom: "4px", fontFamily: FN.m }}>
                              {mat.requirement}
                            </p>
                          )}
                          {mat.note && (
                            <p style={{ fontSize: "12px", color: C.tx, lineHeight: 1.5, marginBottom: "8px" }}>
                              {mat.note}
                            </p>
                          )}
                          <div style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr 1fr",
                            gap: "6px",
                            marginTop: "8px"
                          }}>
                            <select
                              value={mat.status || "pending"}
                              onChange={e => updateMaterial(i, { status: e.target.value })}
                              style={{ fontSize: "11px", padding: "6px" }}
                            >
                              <option value="pending">⚪ Pending</option>
                              <option value="requested">⏳ Requested</option>
                              <option value="received">✓ Received</option>
                              <option value="na">— N/A</option>
                            </select>
                            <input
                              type="date"
                              value={mat.dueDate ? mat.dueDate.slice(0, 10) : ""}
                              onChange={e => updateMaterial(i, {
                                dueDate: e.target.value ? new Date(e.target.value).toISOString() : null
                              })}
                              style={{ fontSize: "11px", padding: "6px" }}
                              placeholder="Due"
                            />
                            <input
                              type="text"
                              value={mat.assignedTo || ""}
                              placeholder="Who (e.g. Erika)"
                              onChange={e => updateMaterial(i, { assignedTo: e.target.value })}
                              style={{ fontSize: "11px", padding: "6px" }}
                            />
                          </div>
                          <div style={{ marginTop: "10px" }}>
                            {mat.uploadedFile ? (
                              <div style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                padding: "8px 12px",
                                background: C.ok + "10",
                                border: "1px solid " + C.ok + "40",
                                borderRadius: "6px"
                              }}>
                                <span style={{ fontSize: "16px" }}>📎</span>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <p style={{
                                    fontSize: "12px",
                                    color: C.tx,
                                    fontWeight: 600,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap"
                                  }}>{mat.uploadedFile.name}</p>
                                  <p style={{ fontSize: "10px", color: C.tm, fontFamily: FN.m }}>
                                    {(mat.uploadedFile.size / 1024).toFixed(0)} KB · uploaded {new Date(mat.uploadedFile.uploadedAt).toLocaleDateString()}
                                  </p>
                                </div>
                                <Btn
                                  variant="ghost"
                                  small
                                  onClick={() => downloadMaterialFile(mat)}
                                  style={{ color: C.ac }}
                                >⬇ Download</Btn>
                                <Btn
                                  variant="ghost"
                                  small
                                  onClick={() => {
                                    if (confirm("Remove this uploaded file?")) {
                                      updateMaterial(i, { uploadedFile: null });
                                    }
                                  }}
                                  style={{ color: C.dn }}
                                >✗</Btn>
                              </div>
                            ) : (
                              <label style={{
                                display: "inline-block",
                                cursor: "pointer"
                              }}>
                                <span style={{
                                  display: "inline-block",
                                  padding: "8px 14px",
                                  background: "transparent",
                                  border: "1px dashed " + C.bd,
                                  borderRadius: "6px",
                                  color: C.tm,
                                  fontSize: "11px",
                                  fontFamily: FN.m,
                                  cursor: "pointer"
                                }}>📎 Upload file (max 10MB)</span>
                                <input
                                  type="file"
                                  style={{ display: "none" }}
                                  onChange={e => {
                                    const file = e.target.files && e.target.files[0];
                                    if (file) uploadMaterialFile(i, file);
                                    e.target.value = "";
                                  }}
                                />
                              </label>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          );
        })()}

        {sections.length === 0 && (
          <Card style={{
            marginBottom: "12px",
            borderColor: C.tm + "30",
            background: C.bg
          }}>
            <p style={{ fontSize: "13px", color: C.tm, textAlign: "center", padding: "20px" }}>
              No written sections were required for this application. Check the External Materials above for what you need to provide.
            </p>
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
                  <div style={{ display: "flex", gap: "6px" }}>
                    <Btn
                      variant="ghost"
                      small
                      onClick={() => humanizeSection(s.k, s.v, s.t)}
                      disabled={humanizingKey === s.k}
                      style={{ color: C.pp }}
                    >{humanizingKey === s.k ? "✨ Humanizing..." : "✨ Humanize"}</Btn>
                    <Btn
                      variant="ghost"
                      small
                      onClick={() => startEdit(s.k, s.v)}
                      style={{ color: C.tm }}
                    >✎ Edit</Btn>
                  </div>
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

        {extraSections.length > 0 && (
          <details style={{
            marginBottom: "12px",
            background: C.bg,
            border: "1px solid " + C.bd,
            borderRadius: "8px",
            padding: "12px 16px"
          }}>
            <summary style={{
              cursor: "pointer",
              fontSize: "12px",
              color: C.tm,
              fontFamily: FN.m,
              letterSpacing: "0.04em",
              userSelect: "none"
            }}>
              + {extraSections.length} ADDITIONAL SECTION{extraSections.length > 1 ? "S" : ""} GENERATED (NOT REQUIRED BY THIS OPPORTUNITY)
            </summary>
            <p style={{ fontSize: "11px", color: C.tm, marginTop: "10px", marginBottom: "12px", lineHeight: 1.5 }}>
              These sections were generated but this specific opportunity doesn't ask for them. They're kept here in case you want to reference or repurpose them.
            </p>
            {extraSections.map((s, i) => (
              <div key={i} style={{
                marginTop: "10px",
                padding: "12px 14px",
                background: C.sf,
                borderRadius: "6px",
                opacity: 0.75
              }}>
                <p style={{
                  fontFamily: FN.m,
                  fontSize: "11px",
                  color: C.tm,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  marginBottom: "8px"
                }}>{s.t}</p>
                <p style={{
                  fontSize: "13px",
                  lineHeight: 1.7,
                  whiteSpace: "pre-wrap",
                  color: C.tm
                }}>{s.v}</p>
              </div>
            ))}
          </details>
        )}

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

        <Mdl
          open={outcomeMdl !== null}
          onClose={() => setOutcomeMdl(null)}
          title="Record Outcome"
          width="560px"
        >
          {outcomeMdl !== null && apps[outcomeMdl] && (
            <div>
              <p style={{ fontSize: "13px", color: C.tm, lineHeight: 1.6, marginBottom: "16px" }}>
                Track the outcome of <strong style={{ color: C.tx }}>{apps[outcomeMdl].oppName}</strong> so you can learn from wins and losses over time.
              </p>
              <div style={{ marginBottom: "16px" }}>
                <label style={LS}>Outcome</label>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "8px",
                  marginTop: "6px"
                }}>
                  {[
                    { id: "won", label: "🏆 Won / Accepted", color: C.ok },
                    { id: "waitlisted", label: "⏳ Waitlisted", color: C.ac },
                    { id: "rejected", label: "✗ Rejected", color: C.dn },
                    { id: "ghosted", label: "— No response", color: C.tm }
                  ].map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => setOutcomeForm({ ...outcomeForm, outcome: opt.id })}
                      style={{
                        padding: "12px",
                        background: outcomeForm.outcome === opt.id ? opt.color + "20" : C.bg,
                        border: "1px solid " + (outcomeForm.outcome === opt.id ? opt.color : C.bd),
                        borderRadius: "6px",
                        color: outcomeForm.outcome === opt.id ? opt.color : C.tx,
                        fontSize: "13px",
                        cursor: "pointer",
                        fontFamily: FN.b,
                        textAlign: "left"
                      }}
                    >{opt.label}</button>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: "16px" }}>
                <label style={LS}>Notes (what they said, if anything)</label>
                <textarea
                  rows={2}
                  value={outcomeForm.notes}
                  placeholder="Any feedback received, reasons given, next steps offered..."
                  onChange={e => setOutcomeForm({ ...outcomeForm, notes: e.target.value })}
                />
              </div>
              <div style={{ marginBottom: "16px" }}>
                <label style={LS}>Post-mortem (what you learned, for next time)</label>
                <textarea
                  rows={4}
                  value={outcomeForm.postMortem}
                  placeholder="What worked? What didn't? What would you do differently? Which parts of the application should be reused vs. overhauled for next cycle?"
                  onChange={e => setOutcomeForm({ ...outcomeForm, postMortem: e.target.value })}
                />
              </div>
              <div style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px"
              }}>
                <Btn variant="secondary" onClick={() => setOutcomeMdl(null)}>Cancel</Btn>
                <Btn
                  disabled={!outcomeForm.outcome}
                  onClick={() => {
                    const updated = [...apps];
                    updated[outcomeMdl] = {
                      ...updated[outcomeMdl],
                      outcome: outcomeForm.outcome,
                      outcomeDate: updated[outcomeMdl].outcomeDate || new Date().toISOString(),
                      outcomeNotes: outcomeForm.notes,
                      postMortem: outcomeForm.postMortem
                    };
                    save(updated);
                    setOutcomeMdl(null);
                  }}
                >Save Outcome</Btn>
              </div>
            </div>
          )}
        </Mdl>
      </div>
    );
  }
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
            {(() => {
              const currentProj = projects[selP];
              // Build set of "opp-name|opp-org" already applied to with this project
              const appliedKeys = new Set(
                currentProj
                  ? apps
                      .filter(ap => ap.projTitle === currentProj.title)
                      .map(ap => (ap.oppName || "").toLowerCase().trim() + "|" + (ap.oppOrg || "").toLowerCase().trim())
                  : []
              );
              // Track original index so selected value still maps to the right opp in the full `opps` array
              const available = opps
                .map((o, i) => ({ o, i }))
                .filter(({ o }) => {
                  if (!currentProj) return true;
                  const key = (o.name || "").toLowerCase().trim() + "|" + (o.organization || "").toLowerCase().trim();
                  return !appliedKeys.has(key);
                });
              const hiddenCount = opps.length - available.length;
              return (
                <>
                  <select
                    value={selO !== null ? selO : ""}
                    onChange={e => setSelO(e.target.value === "" ? null : parseInt(e.target.value))}
                  >
                    <option value="">Select...</option>
                    {available.map(({ o, i }) => (
                      <option key={i} value={i}>
                        {o.name} — {o.submissionFee || "?"}
                      </option>
                    ))}
                  </select>
                  {hiddenCount > 0 && (
                    <p style={{
                      fontSize: "11px",
                      color: C.tm,
                      marginTop: "4px",
                      fontFamily: FN.m
                    }}>
                      {hiddenCount} opportunit{hiddenCount === 1 ? "y" : "ies"} hidden (already applied to with {currentProj.title})
                    </p>
                  )}
                  {available.length === 0 && opps.length > 0 && (
                    <p style={{
                      fontSize: "11px",
                      color: C.wn,
                      marginTop: "4px",
                      fontFamily: FN.m
                    }}>
                      ⚠ You've already applied to every saved opportunity with this project. Discover new ones in the Discover tab, or switch to a different project.
                    </p>
                  )}
                </>
              );
            })()}
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
            ⏳ {generateJobs.filter(j => j.status === "running").length} application{generateJobs.filter(j => j.status === "running").length === 1 ? "" : "s"} being researched and written in background (2-4 min each). You can keep working.
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
              submitted: apps.filter(a => a.status === "submitted").length,
              won: apps.filter(a => a.outcome === "won").length,
              rejected: apps.filter(a => a.outcome === "rejected").length,
              waitlisted: apps.filter(a => a.outcome === "waitlisted").length,
              ghosted: apps.filter(a => a.outcome === "ghosted").length
            };
            const totalSubmitted = apps
              .filter(a => a.status === "submitted")
              .reduce((s, a) => s + (a.cost || 0), 0);
            const withOutcome = counts.won + counts.rejected + counts.waitlisted + counts.ghosted;
            const successRate = withOutcome > 0 ? ((counts.won / withOutcome) * 100).toFixed(0) : null;
            const filterOptions = [
              { id: "all", label: "All", count: counts.all, color: C.tx },
              { id: "draft", label: "Drafts", count: counts.draft, color: C.wn },
              { id: "approved", label: "Approved", count: counts.approved, color: C.ac },
              { id: "submitted", label: "Submitted", count: counts.submitted, color: C.ok },
              { id: "won", label: "🏆 Won", count: counts.won, color: C.ok },
              { id: "rejected", label: "✗ Rejected", count: counts.rejected, color: C.dn },
              { id: "waitlisted", label: "⏳ Waitlisted", count: counts.waitlisted, color: C.ac }
            ];
            return (
              <div>
                <Card style={{ marginBottom: "14px" }}>
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(5, 1fr)",
                    gap: "12px"
                  }}>
                    <div>
                      <p style={{ ...LS, marginBottom: "4px" }}>TOTAL</p>
                      <p style={{ fontFamily: FN.d, fontSize: "22px", fontStyle: "italic", color: C.tx }}>
                        {counts.all}
                      </p>
                    </div>
                    <div>
                      <p style={{ ...LS, marginBottom: "4px" }}>SUBMITTED</p>
                      <p style={{ fontFamily: FN.d, fontSize: "22px", fontStyle: "italic", color: C.ok }}>
                        {counts.submitted}
                      </p>
                    </div>
                    <div>
                      <p style={{ ...LS, marginBottom: "4px" }}>SPENT</p>
                      <p style={{ fontFamily: FN.d, fontSize: "22px", fontStyle: "italic", color: C.wn }}>
                        ${totalSubmitted.toFixed(0)}
                      </p>
                    </div>
                    <div>
                      <p style={{ ...LS, marginBottom: "4px" }}>WON</p>
                      <p style={{ fontFamily: FN.d, fontSize: "22px", fontStyle: "italic", color: C.ok }}>
                        {counts.won}
                      </p>
                    </div>
                    <div>
                      <p style={{ ...LS, marginBottom: "4px" }}>SUCCESS %</p>
                      <p style={{ fontFamily: FN.d, fontSize: "22px", fontStyle: "italic", color: successRate !== null ? C.ok : C.tm }}>
                        {successRate !== null ? successRate + "%" : "—"}
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
              : (["won", "rejected", "waitlisted", "ghosted"].includes(listFilter))
                ? apps.filter(a => a.outcome === listFilter)
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
                    {app.deepResearch && <span title="Deep opportunity research">🔍</span>}
                    {Array.isArray(app.videoLinks) && app.videoLinks.length > 0 && (
                      <span title={app.videoLinks.length + " video link" + (app.videoLinks.length === 1 ? "" : "s")}>🎬</span>
                    )}
                    {isStale(app) && <Bdg color={C.wn}>STALE</Bdg>}
                    {app.outcome === "won" && <Bdg color={C.ok}>🏆 WON</Bdg>}
                    {app.outcome === "rejected" && <Bdg color={C.dn}>✗ REJECTED</Bdg>}
                    {app.outcome === "waitlisted" && <Bdg color={C.ac}>⏳ WAITLISTED</Bdg>}
                    {app.outcome === "ghosted" && <Bdg color={C.tm}>— GHOSTED</Bdg>}
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
  const [backupBusy, setBackupBusy] = useState(false);
  const [backupMsg, setBackupMsg] = useState("");
  const [cleanupBusy, setCleanupBusy] = useState(false);
  const [cleanupMsg, setCleanupMsg] = useState("");

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
          <div style={{ gridColumn: "1 / -1", marginTop: "8px" }}>
            <div style={{
              padding: "14px 16px",
              background: C.ac + "08",
              border: "1px solid " + C.ac + "30",
              borderRadius: "8px"
            }}>
              <p style={{
                fontFamily: FN.m,
                fontSize: "10px",
                color: C.ac,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: "4px"
              }}>✉ Contact for Responses</p>
              <p style={{ fontSize: "11px", color: C.tm, marginBottom: "12px", lineHeight: 1.5 }}>
                This is where opportunities will direct their responses. Included in every generated application so selection committees know exactly who and how to contact.
              </p>
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px"
              }}>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={LS}>Contact Name</label>
                  <input
                    value={form.contactName || ""}
                    placeholder="Ryan Guiterman"
                    onChange={e => setForm({ ...form, contactName: e.target.value })}
                  />
                </div>
                <div>
                  <label style={LS}>Contact Email *</label>
                  <input
                    type="email"
                    value={form.contactEmail || ""}
                    placeholder="ryan@precariatproductions.com"
                    onChange={e => setForm({ ...form, contactEmail: e.target.value })}
                  />
                </div>
                <div>
                  <label style={LS}>Contact Phone</label>
                  <input
                    type="tel"
                    value={form.contactPhone || ""}
                    placeholder="(917) 544-0654"
                    onChange={e => setForm({ ...form, contactPhone: e.target.value })}
                  />
                </div>
              </div>
            </div>
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

      <Card style={{ marginTop: "20px", borderColor: C.pp + "40" }}>
        <h3 style={{
          fontFamily: FN.d,
          fontSize: "20px",
          fontStyle: "italic",
          marginBottom: "6px"
        }}>🔗 Connected Accounts & Memberships</h3>
        <p style={{ fontSize: "12px", color: C.tm, marginBottom: "10px", lineHeight: 1.5 }}>
          A reference list of platforms where you already hold an account (Blacklist, Sundance Institute, Film Independent, IMDb Pro, FilmFreeway, Coverfly, Stage 32, etc.). The AI cross-references this list when researching opportunities — if a grant requires a Blacklist account and you've listed one here, it won't flag that as a missing prerequisite.
        </p>
        <div style={{
          padding: "10px 12px",
          background: C.pp + "10",
          border: "1px solid " + C.pp + "30",
          borderRadius: "6px",
          marginBottom: "16px"
        }}>
          <p style={{ fontSize: "11px", color: C.tx, lineHeight: 1.5 }}>
            🔒 <strong>Never enter passwords here.</strong> This is a knowledge list, not a password manager. Click the ↗ Login button to open the platform in a new tab, then sign in there. Use 1Password, Bitwarden, or your browser's password manager for credentials.
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "14px" }}>
          {(form.connectedAccounts || []).map((acc, i) => (
            <div key={i} style={{
              background: C.bg,
              border: "1px solid " + C.bd,
              borderRadius: "6px",
              padding: "12px 14px"
            }}>
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "8px",
                marginBottom: "8px"
              }}>
                <div>
                  <label style={LS}>Platform / Account Name</label>
                  <input
                    value={acc.name || ""}
                    placeholder="e.g. The Black List, Sundance Institute"
                    onChange={e => {
                      const next = [...(form.connectedAccounts || [])];
                      next[i] = { ...next[i], name: e.target.value };
                      setForm({ ...form, connectedAccounts: next });
                    }}
                  />
                </div>
                <div>
                  <label style={LS}>Username / Identifier</label>
                  <input
                    value={acc.identifier || ""}
                    placeholder="e.g. ryan_guiterman"
                    onChange={e => {
                      const next = [...(form.connectedAccounts || [])];
                      next[i] = { ...next[i], identifier: e.target.value };
                      setForm({ ...form, connectedAccounts: next });
                    }}
                  />
                </div>
              </div>
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr auto",
                gap: "8px",
                alignItems: "end"
              }}>
                <div>
                  <label style={LS}>URL (optional)</label>
                  <input
                    value={acc.url || ""}
                    placeholder="https://..."
                    onChange={e => {
                      const next = [...(form.connectedAccounts || [])];
                      next[i] = { ...next[i], url: e.target.value };
                      setForm({ ...form, connectedAccounts: next });
                    }}
                  />
                </div>
                <div>
                  <label style={LS}>Notes (tier, status, etc.)</label>
                  <input
                    value={acc.notes || ""}
                    placeholder="e.g. 7.5 evaluation, Top List"
                    onChange={e => {
                      const next = [...(form.connectedAccounts || [])];
                      next[i] = { ...next[i], notes: e.target.value };
                      setForm({ ...form, connectedAccounts: next });
                    }}
                  />
                </div>
                <Btn
                  variant="ghost"
                  small
                  onClick={() => {
                    // Known platform login URLs — more reliable than user-pasted profile URLs
                    const loginMap = [
                      { match: /blacklist|black\s*list|blcklst/i, url: "https://blcklst.com/login" },
                      { match: /sundance/i, url: "https://collab.sundance.org/s/login/" },
                      { match: /film\s*independent|filmindependent/i, url: "https://www.filmindependent.org/login/" },
                      { match: /imdb\s*pro|imdbpro/i, url: "https://pro.imdb.com/login" },
                      { match: /film\s*freeway|filmfreeway/i, url: "https://filmfreeway.com/login" },
                      { match: /coverfly/i, url: "https://writers.coverfly.com/login" },
                      { match: /stage\s*32|stage32/i, url: "https://www.stage32.com/login" },
                      { match: /wga|writers\s*guild/i, url: "https://www.wga.org/members/login" },
                      { match: /tracking\s*board/i, url: "https://www.trackingb.com/login" },
                      { match: /final\s*draft/i, url: "https://www.finaldraft.com/account/login/" },
                      { match: /withoutabox/i, url: "https://www.withoutabox.com/login" }
                    ];
                    const name = (acc.name || "").trim();
                    const url = (acc.url || "").trim();

                    // 1. Try a known-platform match on the name
                    const known = loginMap.find(p => p.match.test(name));
                    if (known) {
                      window.open(known.url, "_blank", "noopener,noreferrer");
                      return;
                    }
                    // 2. Fall back to user-provided URL
                    if (url) {
                      // Normalize: add https:// if missing
                      const normalized = /^https?:\/\//i.test(url) ? url : "https://" + url;
                      window.open(normalized, "_blank", "noopener,noreferrer");
                      return;
                    }
                    // 3. Nothing to open
                    alert("No URL saved for this account, and the platform name isn't recognized. Add a URL to the account to use the Login button.");
                  }}
                  title="Open login page in a new tab"
                  disabled={!acc.name && !acc.url}
                  style={{ color: C.ac }}
                >↗ Login</Btn>
                <Btn
                  variant="ghost"
                  small
                  onClick={() => {
                    const next = (form.connectedAccounts || []).filter((_, j) => j !== i);
                    setForm({ ...form, connectedAccounts: next });
                  }}
                  style={{ color: C.dn }}
                >✗ Remove</Btn>
              </div>
            </div>
          ))}
        </div>
        <Btn
          variant="secondary"
          onClick={() => {
            const next = [...(form.connectedAccounts || []), { name: "", identifier: "", url: "", notes: "" }];
            setForm({ ...form, connectedAccounts: next });
          }}
        >+ Add Account</Btn>
        <p style={{ fontSize: "11px", color: C.tm, marginTop: "10px" }}>
          Don't forget to click "Save All" at the top after editing.
        </p>
      </Card>

      <Card style={{ marginTop: "20px", borderColor: C.wn + "40" }}>
        <h3 style={{
          fontFamily: FN.d,
          fontSize: "20px",
          fontStyle: "italic",
          marginBottom: "6px"
        }}>🧹 Clean Up Citation Tags</h3>
        <p style={{ fontSize: "12px", color: C.tm, marginBottom: "16px", lineHeight: 1.5 }}>
          Older analyses and applications may contain <code style={{ background: C.bg, padding: "1px 6px", borderRadius: "3px", fontSize: "11px" }}>&lt;cite&gt;</code> tags, footnote markers <code style={{ background: C.bg, padding: "1px 6px", borderRadius: "3px", fontSize: "11px" }}>[1]</code>, or other markup that leaked in from web search research. New generations are automatically sanitized — but this button retroactively cleans every project analysis and application section already stored in your browser. Safe to run: it only strips markup, never touches actual content.
        </p>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
          <Btn
            disabled={cleanupBusy}
            onClick={async () => {
              if (!confirm("This will scan every project analysis and application in your browser and strip out cite tags, footnote markers, and HTML markup. Content text will be preserved. Export a backup first if you want a rollback option. Continue?")) {
                return;
              }
              setCleanupBusy(true);
              setCleanupMsg("");
              try {
                let projectsCleaned = 0;
                let appsCleaned = 0;
                let oppsCleaned = 0;

                // Clean projects (analysis field)
                const projsResult = await window.storage.get(SK.PROJECTS);
                if (projsResult && projsResult.value) {
                  const projs = JSON.parse(projsResult.value);
                  const cleanedProjs = projs.map(p => {
                    if (!p.analysis) return p;
                    const before = JSON.stringify(p.analysis);
                    const cleaned = sanitizeStrings(p.analysis);
                    const after = JSON.stringify(cleaned);
                    if (before !== after) projectsCleaned++;
                    return { ...p, analysis: cleaned };
                  });
                  await window.storage.set(SK.PROJECTS, JSON.stringify(cleanedProjs));
                }

                // Clean applications (all fields, but especially content)
                const appsResult = await window.storage.get(SK.APPS);
                if (appsResult && appsResult.value) {
                  const appsData = JSON.parse(appsResult.value);
                  const cleanedApps = appsData.map(a => {
                    const before = JSON.stringify(a);
                    const cleaned = sanitizeStrings(a);
                    const after = JSON.stringify(cleaned);
                    if (before !== after) appsCleaned++;
                    return cleaned;
                  });
                  await window.storage.set(SK.APPS, JSON.stringify(cleanedApps));
                }

                // Clean opportunities
                const oppsResult = await window.storage.get(SK.OPPS);
                if (oppsResult && oppsResult.value) {
                  const oppsData = JSON.parse(oppsResult.value);
                  const cleanedOpps = oppsData.map(o => {
                    const before = JSON.stringify(o);
                    const cleaned = sanitizeStrings(o);
                    const after = JSON.stringify(cleaned);
                    if (before !== after) oppsCleaned++;
                    return cleaned;
                  });
                  await window.storage.set(SK.OPPS, JSON.stringify(cleanedOpps));
                }

                const total = projectsCleaned + appsCleaned + oppsCleaned;
                if (total === 0) {
                  setCleanupMsg("✓ Nothing to clean — your data was already tidy.");
                } else {
                  setCleanupMsg("✓ Cleaned " + projectsCleaned + " project analyses, " + appsCleaned + " applications, " + oppsCleaned + " opportunities. Reloading in 2 seconds to refresh the display...");
                  setTimeout(() => window.location.reload(), 2000);
                }
              } catch (e) {
                setCleanupMsg("✗ Cleanup failed: " + (e.message || "unknown error"));
              } finally {
                setCleanupBusy(false);
              }
            }}
          >{cleanupBusy ? "Cleaning..." : "🧹 Scan & Clean All Data"}</Btn>
          {cleanupMsg && (
            <p style={{
              fontSize: "12px",
              color: cleanupMsg.startsWith("✓") ? C.ok : C.dn,
              fontFamily: FN.m,
              marginLeft: "8px"
            }}>{cleanupMsg}</p>
          )}
        </div>
      </Card>

      <Card style={{ marginTop: "20px", borderColor: C.tl + "40" }}>
        <h3 style={{
          fontFamily: FN.d,
          fontSize: "20px",
          fontStyle: "italic",
          marginBottom: "6px"
        }}>💾 Backup & Restore</h3>
        <p style={{ fontSize: "12px", color: C.tm, marginBottom: "16px", lineHeight: 1.5 }}>
          All your data lives in this browser. Export a full backup (projects, analysis, opportunities, applications, outcomes, payment settings, and attached files) to a JSON file you can save anywhere. Restore from a backup on a new device or after clearing browser data.
        </p>
        <div style={{
          padding: "12px 14px",
          background: C.wn + "10",
          border: "1px solid " + C.wn + "30",
          borderRadius: "6px",
          marginBottom: "16px"
        }}>
          <p style={{ fontSize: "12px", color: C.tx, lineHeight: 1.5 }}>
            ⚠ <strong>Strongly recommended:</strong> Export a backup after every major session. All data is stored locally in IndexedDB — if you clear your browser or switch devices without a backup, everything is lost.
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
          <Btn
            variant="teal"
            disabled={backupBusy}
            onClick={async () => {
              setBackupBusy(true);
              setBackupMsg("");
              try {
                const bundle = await exportAllData();
                const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                const dateStr = new Date().toISOString().slice(0, 10);
                a.download = "precariat-backup-" + dateStr + ".json";
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                const projCount = bundle.data.PROJECTS ? bundle.data.PROJECTS.length : 0;
                const appCount = bundle.data.APPS ? bundle.data.APPS.length : 0;
                setBackupMsg("✓ Exported " + projCount + " projects, " + appCount + " applications");
              } catch (e) {
                setBackupMsg("✗ Export failed: " + (e.message || "unknown error"));
              } finally {
                setBackupBusy(false);
              }
            }}
          >{backupBusy ? "Exporting..." : "⬇ Export All Data"}</Btn>

          <label style={{
            display: "inline-block",
            cursor: backupBusy ? "not-allowed" : "pointer"
          }}>
            <span style={{
              display: "inline-block",
              padding: "10px 18px",
              background: "transparent",
              border: "1px solid " + C.bd,
              borderRadius: "6px",
              color: C.tx,
              fontSize: "13px",
              fontFamily: FN.m,
              cursor: backupBusy ? "not-allowed" : "pointer",
              opacity: backupBusy ? 0.5 : 1
            }}>⬆ Import Backup</span>
            <input
              type="file"
              accept="application/json,.json"
              disabled={backupBusy}
              style={{ display: "none" }}
              onChange={async (e) => {
                const file = e.target.files && e.target.files[0];
                if (!file) return;
                if (!confirm("Importing a backup will REPLACE all current data in this browser. Make sure you've exported a current backup first if you want to keep what's here. Continue?")) {
                  e.target.value = "";
                  return;
                }
                setBackupBusy(true);
                setBackupMsg("");
                try {
                  const text = await file.text();
                  const bundle = JSON.parse(text);
                  await importAllData(bundle);
                  setBackupMsg("✓ Import successful — reloading in 2 seconds...");
                  setTimeout(() => window.location.reload(), 2000);
                } catch (err) {
                  setBackupMsg("✗ Import failed: " + (err.message || "invalid file"));
                  setBackupBusy(false);
                }
                e.target.value = "";
              }}
            />
          </label>

          {backupMsg && (
            <p style={{
              fontSize: "12px",
              color: backupMsg.startsWith("✓") ? C.ok : C.dn,
              fontFamily: FN.m,
              marginLeft: "8px"
            }}>{backupMsg}</p>
          )}
        </div>
      </Card>
    </div>
  );
}


export default function App() {
  return (
    <ErrorBoundary>
      <AppMain />
    </ErrorBoundary>
  );
}

