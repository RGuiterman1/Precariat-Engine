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
  FILES: "pre-files",
  FIELD_LIB: "pre-field-library",
  REJECTED: "pre-rejected"
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
  connectedAccounts: [],  // [{ name, identifier, url, notes }]
  voiceDirectiveEnabled: true  // Apply Ryan's voice profile to generated apps. Default on.
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

// Eligibility attributes for discovery verification. Each attribute is a stable
// key; the label is shown in the project edit form. "team" attributes describe
// the filmmakers; "themes" attributes describe the project's subject matter.
// Both are used to filter opportunities that have demographic/thematic gates.
const ELIGIBILITY_ATTRIBUTES = [
  { key: "bipoc-team",      label: "BIPOC filmmaker(s)",         group: "team"   },
  { key: "lgbtq-team",      label: "LGBTQ+ filmmaker(s)",        group: "team"   },
  { key: "women-led",       label: "Women-led",                  group: "team"   },
  { key: "jewish-team",     label: "Jewish filmmaker(s)",        group: "team"   },
  { key: "disabled-team",   label: "Disabled filmmaker(s)",      group: "team"   },
  { key: "veteran-team",    label: "Veteran(s) on team",         group: "team"   },
  { key: "immigrant-team",  label: "Immigrant / first-gen team", group: "team"   },
  { key: "bipoc-themes",    label: "BIPOC stories / subjects",   group: "themes" },
  { key: "lgbtq-themes",    label: "LGBTQ+ stories / subjects",  group: "themes" },
  { key: "women-themes",    label: "Women-centered stories",     group: "themes" },
  { key: "jewish-themes",   label: "Jewish themes / subjects",   group: "themes" },
  { key: "disability-themes", label: "Disability themes",        group: "themes" },
  { key: "veteran-themes",  label: "Military / veteran themes",  group: "themes" },
  { key: "immigrant-themes", label: "Immigration themes",        group: "themes" }
];

// Script status options — optional per project. Distinguishes where the SCRIPT
// itself is, independent of the project's production stage (which conflates
// "script being written" with "script done but film not made yet").
const SCRIPT_STATUS_OPTIONS = [
  { key: "outline",     label: "Outline / Treatment" },
  { key: "in-progress", label: "Draft in progress" },
  { key: "first-draft", label: "Completed first draft" },
  { key: "polished",    label: "Completed and polished" },
  { key: "locked",      label: "Locked shooting script" }
];

// VOICE DIRECTIVE — condensed from Ryan Guiterman's Voice Profile v1.1.
// Injected into every Generate/Regenerate/Augment prompt when the user
// has voice mode enabled (default: on). The full Voice Profile lives in
// Ryan_Guiterman_Voice_Profile_v1.1.docx as a standalone reference document.
//
// This condensed version captures the operational rules — the "what to do"
// and "what to avoid" — without requiring the model to process the whole
// 2700-word profile on every call.
const VOICE_DIRECTIVE = `═══════════════════════════════════════════════════════════
🎙 WRITING VOICE — NON-NEGOTIABLE
═══════════════════════════════════════════════════════════
You are writing in Ryan Guiterman's voice, not a generic grant voice. Every sentence must pass the following filters.

THE ARTISTIC ETHIC:
"I don't like when things are unearned, either in life or in language — but when something is earned, there are very few things that move me more." Every strong word must pay its own rent. A reach for elevated language is fine if the argument earns it; reaching for effect without substance is a violation.

REGISTER:
This is a blend of formal (Director's Statement register) and professional-relational (industry email register). Architectural and spare in structure, but warm and specific in voice. One idea per short paragraph. No connective tissue like "furthermore" or "additionally." Reaches for slightly elevated vocabulary (complicity, rectify, myriad) when the material earns it.

BANNED WORDS — never use these, they are AI tells and grant-speak:
compelling, timely, vital, transformative, resonates, navigates, explores, delves into, tapestry, landscape, journey, powerful, profound, meaningful, thought-provoking, visceral, nuanced, at its core, multifaceted, amazing, incredible, in this cultural moment, especially relevant today, my truth, my voice, my perspective as a filmmaker.

REPLACE HEDGING — "seeks to explore" becomes "explores"; "aims to" becomes "does"; "attempts to" becomes "does."

WHEN DESCRIBING HORROR/FEAR: use physical language. "Crawls through the audience's spines," "makes their heart rates rise," "jolts them in the theater," "keeps the lights on at home." Fear is a thing happening in bodies, not an abstract emotional state. If the opportunity is a horror project, the honest word is SCARY — own it, not "unsettling" or "atmospheric."

WHAT MUST NEVER APPEAR:
- Aspirational casting not yet attached (e.g., don't name actors unless confirmed attached).
- Filmmaker's political identity or personal political positions, unless the specific opportunity requires political disclosure.
- Personal vulnerabilities framed as credentials (mental health history, personal trauma, etc. — thematic outcomes of lived experience are fine, biography deployed as credential is not).
- Fad-chasing language ("timely," "in this cultural moment," "especially relevant today"). The film's relevance is permanent, not seasonal.
- Pre-feature résumé recitation when the application is for a feature filmmaker. Assume the jury knows the filmmaker's feature credits unless specifically asked.

SENTINEL CHECKS — before finalizing, verify:
1. Every strong word earns its place.
2. Claims are anchored to specific scenes, institutions, or collaborators — not vague gestures.
3. No soft-relativist framing ("my truth," "my perspective").
4. No pre-apologies, no hedges, no performed modesty.
5. No sentence performs an effect instead of substantiating it.
6. No aspirational casting, no unrelated political content, no biography deployed as credential.
7. If reading aloud would make Ryan wince, rewrite it.`;

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
    // Both web_search and web_fetch are enabled together. Web_search finds candidate
    // URLs; web_fetch reads full page contents when the model needs depth beyond
    // search snippets. Critical for availability verification where the 2026 cycle
    // info lives on pages deeper than the search snippet landing page.
    // max_uses: 15 gives the model budget to fetch 5-10 pages across multiple
    // domains for thorough research. Each fetch costs tokens but catches stale data.
    body.tools = [
      { type: "web_search_20250305", name: "web_search" },
      { type: "web_fetch_20250910", name: "web_fetch", max_uses: 15 }
    ];
  }
  let res;
  try {
    res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-beta": "web-fetch-2025-09-10",
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

function extractJSON(text) {
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
  const s = String(str).trim();
  // Explicit non-date status strings
  if (["Rolling", "TBD", "Varies", "Ongoing", "Unknown"].includes(s)) return null;
  // Recognize verbose availability-gate output: "discontinued", "on hold", etc → null
  const lower = s.toLowerCase();
  if (lower.startsWith("discontinued") || lower.startsWith("on hold") || lower.startsWith("on-hold") ||
      lower.startsWith("paused") || lower.includes("no longer offered") || lower.includes("permanently ended") ||
      lower.startsWith("truly rolling") || lower.startsWith("rolling") || lower.startsWith("continuous")) {
    return null;
  }
  // Try to extract date portion from verbose strings like "April 2, 2026 at 3pm ET (already passed...)"
  // Strip parenthetical commentary, trailing time qualifiers
  const cleanStr = s.replace(/\([^)]*\)/g, "").replace(/at \d+[:\d]*\s*(am|pm|ET|PT|CT|MT|UTC|EST|PST|CST|MST|GMT)?/gi, "").trim();
  const d = new Date(cleanStr.replace(/,/g, "").trim());
  if (!isNaN(d.getTime()) && d.getFullYear() > 2020 && d.getFullYear() < 2100) return d;
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

// checkDeadlineStatus — deterministic JavaScript date classification.
// Takes any deadline text and returns a structured status used by the
// availability verification layer. This removes arithmetic from the LLM's
// job — JS does the math, the LLM only answers "is this program active?"
//
// Returns one of:
//   { status: "future", date: Date, daysUntil: number, originalText: string }
//   { status: "past",   date: Date, daysAgo:   number, originalText: string }
//   { status: "rolling",                               originalText: string }
//   { status: "unparseable",                           originalText: string }
function checkDeadlineStatus(deadlineString) {
  const originalText = deadlineString || "";
  if (!originalText || !originalText.trim()) {
    return { status: "unparseable", originalText };
  }
  const lower = originalText.toLowerCase().trim();

  // Rolling detection — explicit language indicating no fixed deadline
  const rollingMarkers = [
    "rolling",
    "ongoing",
    "continuous",
    "year-round",
    "year round",
    "always open",
    "accepts applications at any time",
    "no deadline"
  ];
  if (rollingMarkers.some(m => lower === m || lower.startsWith(m + " ") || lower.includes(" " + m))) {
    return { status: "rolling", originalText };
  }

  // Try to parse via existing parseDate (handles messy formats)
  const parsed = parseDate(originalText);
  if (!parsed) {
    return { status: "unparseable", originalText };
  }

  // Compare to today at start of day, both UTC-aligned
  const now = new Date();
  const startOfTodayMs = new Date(now.toISOString().slice(0, 10)).getTime();
  const parsedMs = parsed.getTime();
  const oneDayMs = 86400000;

  if (parsedMs >= startOfTodayMs) {
    return {
      status: "future",
      date: parsed,
      daysUntil: Math.ceil((parsedMs - startOfTodayMs) / oneDayMs),
      originalText
    };
  }
  return {
    status: "past",
    date: parsed,
    daysAgo: Math.floor((startOfTodayMs - parsedMs) / oneDayMs),
    originalText
  };
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
  // Strip commas FROM WITHIN numbers before extracting — handles "$1,500" or "$5,000 – $10,000"
  // First normalize: replace "5,000" with "5000" by removing commas between digits
  const normalized = s.replace(/(\d),(\d)/g, "$1$2").replace(/(\d),(\d)/g, "$1$2");
  const matches = normalized.match(/\d+(?:\.\d+)?/g);
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
  // Same comma-normalization as parseFee
  const normalized = fee.replace(/(\d),(\d)/g, "$1$2").replace(/(\d),(\d)/g, "$1$2");
  const matches = normalized.match(/\d+(?:\.\d+)?/g);
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

  // Field library: remembered form field lists per opportunity so the engine
  // doesn't have to re-discover fields each time. Structure:
  //   { "opportunity-name|organization": {
  //       fields: [{ fieldName, wordLimit, description, sourceUrl }],
  //       savedAt: ISO string,
  //       verified: boolean,
  //       notes: string
  //     }, ... }
  const [fieldLibrary, setFieldLibrary] = useState({});

  // Rejected opportunities — user-declared "don't surface this again."
  // Array of: { name, organization, reason, rejectedAt }
  // Used in discovery to exclude previously-rejected opps before verification runs.
  const [rejectedOpps, setRejectedOpps] = useState([]);

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
  const fieldLibraryRef = React.useRef(fieldLibrary);
  const rejectedOppsRef = React.useRef(rejectedOpps);

  useEffect(() => { projectsRef.current = projects; }, [projects]);
  useEffect(() => { appsRef.current = apps; }, [apps]);
  useEffect(() => { payRef.current = pay; }, [pay]);
  useEffect(() => { profileRef.current = profile; }, [profile]);
  useEffect(() => { oppsRef.current = opps; }, [opps]);
  useEffect(() => { fieldLibraryRef.current = fieldLibrary; }, [fieldLibrary]);
  useEffect(() => { rejectedOppsRef.current = rejectedOpps; }, [rejectedOpps]);

  useEffect(() => {
    (async () => {
      try {
        const keys = [SK.PROFILE, SK.PROJECTS, SK.OPPS, SK.APPS, SK.PAY, SK.FIELD_LIB, SK.REJECTED];
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
        if (results[5] && results[5].value) setFieldLibrary(JSON.parse(results[5].value));
        if (results[6] && results[6].value) {
          const loaded = JSON.parse(results[6].value);
          if (Array.isArray(loaded)) setRejectedOpps(loaded);
        }
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
  const sFieldLibrary = makeSaver(SK.FIELD_LIB, setFieldLibrary);
  const sRejectedOpps = makeSaver(SK.REJECTED, setRejectedOpps);

  // Reject an opportunity so it won't be re-surfaced by future discovery runs.
  const rejectOpportunity = (name, organization, reason) => {
    const current = rejectedOppsRef.current || [];
    const keyExists = current.some(r =>
      (r.name || "").toLowerCase().trim() === (name || "").toLowerCase().trim() &&
      (r.organization || "").toLowerCase().trim() === (organization || "").toLowerCase().trim()
    );
    if (keyExists) return;
    sRejectedOpps([...current, {
      name,
      organization,
      reason: reason || "",
      rejectedAt: new Date().toISOString()
    }]);
  };

  // Undo a rejection (e.g., from a "rejected opportunities" management view).
  const unrejectOpportunity = (name, organization) => {
    const current = rejectedOppsRef.current || [];
    sRejectedOpps(current.filter(r =>
      !((r.name || "").toLowerCase().trim() === (name || "").toLowerCase().trim() &&
        (r.organization || "").toLowerCase().trim() === (organization || "").toLowerCase().trim())
    ));
  };

  // Normalize an opportunity name+org pair into a stable library key.
  // Case-insensitive, whitespace-collapsed, with a | separator.
  const libKey = (name, org) => {
    return ((name || "").toLowerCase().trim().replace(/\s+/g, " ") +
            "|" +
            (org || "").toLowerCase().trim().replace(/\s+/g, " "));
  };

  // Save a field list to the library for a specific opportunity
  const saveFieldsToLibrary = (oppName, oppOrg, fields, verified) => {
    const key = libKey(oppName, oppOrg);
    const currentLib = fieldLibraryRef.current || {};
    const existing = currentLib[key];
    const entry = {
      oppName,
      oppOrg,
      fields: fields.map(f => ({
        fieldName: f.fieldName || "",
        wordLimit: f.wordLimit || "unspecified",
        description: f.description || "",
        sourceUrl: f.sourceUrl || ""
      })),
      savedAt: new Date().toISOString(),
      verified: !!verified,
      notes: existing ? existing.notes : ""
    };
    sFieldLibrary({ ...currentLib, [key]: entry });
  };

  // Look up a field list from the library for a specific opportunity
  const getFieldsFromLibrary = (oppName, oppOrg) => {
    const key = libKey(oppName, oppOrg);
    const currentLib = fieldLibraryRef.current || {};
    return currentLib[key] || null;
  };

  // Delete a library entry
  const deleteFieldLibraryEntry = (oppName, oppOrg) => {
    const key = libKey(oppName, oppOrg);
    const currentLib = fieldLibraryRef.current || {};
    const updated = { ...currentLib };
    delete updated[key];
    sFieldLibrary(updated);
  };

  // Update notes on a library entry
  const updateFieldLibraryNotes = (oppName, oppOrg, notes) => {
    const key = libKey(oppName, oppOrg);
    const currentLib = fieldLibraryRef.current || {};
    if (!currentLib[key]) return;
    sFieldLibrary({ ...currentLib, [key]: { ...currentLib[key], notes } });
  };

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

      // Build script status and eligibility attribute context
      const an_scriptStatusLabel = (SCRIPT_STATUS_OPTIONS.find(o => o.key === p.scriptStatus) || {}).label || null;
      const an_scriptStatusLine = an_scriptStatusLabel
        ? `\nScript Status: ${an_scriptStatusLabel}`
        : "";
      const an_attrLabels = (p.eligibilityAttributes || [])
        .map(k => ELIGIBILITY_ATTRIBUTES.find(ea => ea.key === k))
        .filter(Boolean)
        .map(ea => ea.label);
      const an_attrsLine = an_attrLabels.length > 0
        ? `\nDeclared Eligibility Attributes: ${an_attrLabels.join(", ")}`
        : "";

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
Stage: ${p.stage}${an_scriptStatusLine}
Logline: ${p.logline || "Not provided"}
Synopsis: ${p.synopsis || "Not provided"}
Budget: ${p.budget || "Not specified"}
Runtime: ${p.runtime || "Not specified"}
Target Audience: ${p.targetAudience || "Not specified"}
Themes: ${p.themes || "Not specified"}
Team Notes: ${p.teamNotes || "Not specified"}${an_attrsLine}

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
      "Development": "Return opportunities for projects in the DEVELOPMENT phase (script-focused, not yet in production). This includes: screenwriting grants, script development funds, writers labs, development fellowships, screenplay competitions, early-stage incubators, development residencies, and packaging/financing programs that help move a script toward production. These typically want a COMPLETED or polished screenplay (see the project's Script Status if declared).\n\nSERVICE-FIT EXCLUSIONS — DO NOT return programs whose offered SERVICE cannot be used by a development-stage project:\n• Equipment support / camera packages / lighting grants (these help productions that are actively shooting, not scripts in development — the project has no use for cameras if it isn't shooting)\n• Post-production services (sound mix, color, finishing, VFX finishing) — a development-stage project has nothing to post-produce\n• Distribution grants, festival submission fee waivers, release support — nothing to distribute or release yet\n• Film festivals that require finished films\n• Completed-film awards, jury prizes for finished features\n• Production insurance discount programs, crew training on-set — these require an active shoot\n• Film stock grants, raw stock donations — require filming in progress\n• TAX CREDIT programs (state and federal film production tax credits) — these offset production costs for films actively shooting or in post-production. A development-stage project has no production costs to offset and cannot use a tax credit until it has moved into pre-production or production with confirmed shoot dates.\n• Any program requiring principal photography within a specific window (e.g., 'must begin principal photography within 180 days') — a development-stage project is not close to shooting.\nThe test: 'can a film with only a screenplay and no footage meaningfully USE what this program provides?' If no, exclude it.",
      "Pre-Production": "Only return opportunities that accept projects in PRE-PRODUCTION (script is locked, preparing to shoot, crew assembling). This includes: production financing grants, pre-production labs, production fellowships, producer labs, packaging/financing programs, casting labs, and pre-production insurance/legal support.\n\nSERVICE-FIT EXCLUSIONS — DO NOT return:\n• Development-only grants / script labs (the script is already locked, past that phase)\n• Post-production services (no footage yet)\n• Distribution grants, festival submission support (no film to distribute)\n• Completed-film festivals\n• Equipment support that requires an active shoot date that isn't yet set",
      "Production": "Only return opportunities that accept projects currently IN PRODUCTION (actively shooting). This includes: production grants, in-progress financing, equipment and location support for active shoots, labs accepting projects mid-production, and production insurance.\n\nSERVICE-FIT EXCLUSIONS — DO NOT return:\n• Development-only grants or script labs\n• Post-production services (wait until footage exists)\n• Distribution grants\n• Completed-film festivals\n• Pre-production-only labs",
      "Post-Production": "Only return opportunities that accept projects in POST-PRODUCTION (shot but not finished). This includes: finishing funds, post-production grants, work-in-progress showcases, rough-cut labs, WIP festivals, sound/color/VFX finishing grants, and editor/post-production residencies.\n\nSERVICE-FIT EXCLUSIONS — DO NOT return:\n• Development grants, script labs\n• Pre-production or production-only grants (past those phases)\n• Distribution grants requiring a finished, locked cut (unless they accept WIP)\n• Completed-film festivals requiring a final cut (unless they have a WIP section)\n• Equipment support for shoots",
      "Completed": "Only return opportunities for FINISHED films with a locked final cut. This includes: film festivals (premiere and subsequent), distribution grants, completed-film awards, theatrical/streaming release support, publicity/marketing grants for released films, and impact campaigns.\n\nSERVICE-FIT EXCLUSIONS — DO NOT return:\n• Development grants, script labs\n• Pre-production, production, or post-production grants (all past phases)\n• Equipment support\n• Finishing funds\n• Opportunities explicitly requiring in-progress work (these want unfinished work, not completed)"
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

    // Add user-rejected opportunities to exclusion context (global rejection — user has said don't surface these again for ANY project)
    const rejectedList = (rejectedOppsRef.current || []).map(r => r.name + " — " + r.organization);
    let rejectionContext = "";
    if (rejectedList.length > 0) {
      rejectionContext = "\n\n❌ USER HAS REJECTED THESE OPPORTUNITIES — DO NOT INCLUDE THEM IN RESULTS:\n"
        + rejectedList.map(n => "- " + n).join("\n")
        + "\n\nThe user has explicitly rejected the opportunities above (past-deadline, wrong fit, or otherwise unwanted). Do not surface them again regardless of how strong a match they might otherwise seem.";
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
    const todayISO = new Date().toISOString().slice(0, 10);
    const todayReadable = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

    // Build project context sections for Pass 1 prompt
    const p_scriptStatusLabel = (SCRIPT_STATUS_OPTIONS.find(o => o.key === p.scriptStatus) || {}).label || null;
    const p_scriptStatusLine = p_scriptStatusLabel
      ? `Script Status: ${p_scriptStatusLabel}`
      : "";
    const p_attrs = (p.eligibilityAttributes || [])
      .map(k => ELIGIBILITY_ATTRIBUTES.find(a => a.key === k))
      .filter(Boolean)
      .map(a => a.label);
    const p_attrsLine = p_attrs.length > 0
      ? `Eligibility Attributes: ${p_attrs.join(", ")}`
      : "";

    const prompt = `You are an expert film industry researcher. Search for REAL, currently open or upcoming ${tf} for this project. Your job is to find opportunities where this SPECIFIC team's credentials give the highest probability of success.

📅 TODAY'S DATE: ${todayReadable} (${todayISO})

COMPANY: ${prof.companyName} | ${prof.bio} | ${prof.location}
PROJECT: "${p.title}"
Format: ${p.format}
Genre: ${p.genre || "?"}
Stage: ${p.stage}${p_scriptStatusLine ? "\n" + p_scriptStatusLine : ""}
Logline: ${p.logline || "?"}
Themes: ${p.themes || "?"}${p_attrsLine ? "\n" + p_attrsLine : ""}
Team Notes: ${p.teamNotes || "?"}${analysisContext}${teamContext}${exclusionContext}${rejectionContext}
${query && query.trim() ? "\nAdditional focus: " + query : ""}

🚨 CRITICAL STAGE REQUIREMENT (NON-NEGOTIABLE):
This project is currently in "${p.stage}" stage. ${stageRule}

Before returning ANY opportunity, verify it explicitly accepts projects in "${p.stage}" stage. If an opportunity requires a different stage, EXCLUDE IT. It is better to return fewer results than to include mismatched opportunities.

📝 TERMINOLOGY AWARENESS (do not misinterpret stage labels):
"Development" refers to the PROJECT'S phase, NOT the script being unfinished. ${p_scriptStatusLabel ? `This project's Script Status is "${p_scriptStatusLabel}" — treat the screenplay accordingly when matching opportunities. A "completed and polished" or "locked" script is READY for labs/competitions that want finished screenplays, even while the overall project stage is "Development."` : `If you're looking for screenplay labs/competitions, include ones that want completed or polished screenplays — projects in "Development" stage commonly have completed scripts.`}

For demographic/thematic-specific opportunities: recognize these as equivalent:
- "Women-led" ≈ "woman filmmaker" ≈ "female filmmaker" ≈ "women writers/directors" ≈ "woman-identifying"
- "BIPOC" ≈ "filmmakers of color" ≈ "people of color" ≈ "underrepresented filmmakers"
- "LGBTQ+" ≈ "queer" ≈ "LGBTQIA+" ≈ "LGBT"
- "Jewish" ≈ "Jewish filmmaker" ≈ "of Jewish heritage"
If this project declares an attribute (see Eligibility Attributes above), match it against synonyms, not exact strings.

🗓 DEADLINE REQUIREMENT (NON-NEGOTIABLE):
Today is ${todayReadable}. Only return opportunities whose deadline is TODAY OR LATER. If the deadline has already passed, EXCLUDE THE OPPORTUNITY entirely — do not return it even if it would normally be a strong match.

🚨 MANDATORY DATE COMPARISON — FOR EACH CANDIDATE, DO THIS STEP BEFORE INCLUDING IT:
Before declaring ANY deadline as "past" or including/excluding an opportunity, compute explicitly:

STEP 1: Parse the deadline into MONTH, DAY, YEAR.
STEP 2: Parse today (${todayReadable}) into MONTH, DAY, YEAR.
STEP 3: The deadline is in the FUTURE (has NOT passed) if:
  (deadline year) > (today year), OR
  (deadline year) == (today year) AND (deadline month) > (today month), OR
  (deadline year) == (today year) AND (deadline month) == (today month) AND (deadline day) >= (today day)

If any of those three conditions are true, the deadline is valid — INCLUDE the opportunity. Only if all three are false has the deadline actually passed.

WORKED EXAMPLE: Today is April 22, 2026. Deadline is May 12, 2026.
- Year: 2026 == 2026. Not past on year alone.
- Month: May (5) > April (4). Deadline is in the FUTURE. Include.

WORKED EXAMPLE: Today is April 22, 2026. Deadline is April 2, 2026.
- Year: 2026 == 2026.
- Month: April (4) == April (4).
- Day: 2 < 22. Deadline HAS PASSED. Exclude (unless future cycle exists).

🚨 TRAINING-DATA STALENESS WARNING:
Your training data predates today. You may remember programs having 2024 or 2025 deadlines as the "most recent." Those memories are STALE. Annual programs are still running annually — a program that had a 2025 deadline almost certainly has a 2026 deadline now. When searching:
- Explicitly search for the CURRENT year's cycle (e.g., "Sundance Screenwriters Lab 2026 deadline," "Gotham Week 2026 extended deadline")
- Trust CURRENT web results over your training memory
- If you only find older-cycle information, search harder with queries like "[program] current application 2026" or "[program] upcoming deadline"
- A program being active in 2024/2025 is STRONG evidence it's active now. Do not exclude based on "no 2026 info in my training data" — that's staleness, not evidence of discontinuation

If an opportunity is cyclical and this year's deadline has passed (verified via MANDATORY DATE COMPARISON above), either find the NEXT cycle's deadline or exclude it if you cannot find any current or future cycle via fresh web search.

"Rolling" deadline has a STRICT definition. Only use deadline: "rolling" when the grant explicitly states "applications accepted on a rolling basis," "continuous intake," "year-round submissions," or equivalent language. DO NOT use "rolling" when:
- The grant has an annual deadline (even if the relationship with awardees spans multiple years)
- The grant engages winners over a multi-year period after award (e.g., "5-year relationship with awardees" is NOT rolling — that describes post-award engagement, not application intake)
- The grant has cohort-based cycles
- You can't find a fixed deadline and are guessing

If you cannot confirm a specific future deadline AND cannot confirm continuous year-round intake, EXCLUDE the opportunity. Do not default to "rolling" as a fallback.

Common mistake to avoid: a grant that says "we engage awardees for 5 years" or "our cycle runs every two years" is NOT rolling — those describe the AWARD structure, not the APPLICATION INTAKE. An annual grant whose deadline has passed should be EXCLUDED regardless of how long the award period is.

🎭 MULTI-TRACK FESTIVALS & ORGANIZATIONS (CRITICAL):
Many festivals and institutes run MULTIPLE distinct competitions, labs, or grants under a single umbrella, each with its own eligibility. Do not collapse them into one opportunity. Examples:
- Austin Film Festival runs: Screenplay Competition (screenplays), Second Rounders (screenplays), Valhalla Entertainment Award (completed films), Fiction Podcast Competition (audio), etc.
- Sundance Institute runs: Screenwriters Lab (scripts), Directors Lab, Documentary Film Program, Episodic Lab, Producers Lab, Native Lab
- Film Independent runs: the Festival (completed films), Screenwriters Lab, Documentary Lab, Project Involve, Fiscal Sponsorship
- SFFILM runs: Festival (completed films), Rainin Grants (development/production screenplays)
- Tribeca runs: Tribeca Festival + Tribeca Film Institute grants
- Berlin IFF runs: Main competition + Berlinale Talents + World Cinema Fund + Berlinale Co-Production Market

For each opportunity you return, identify the SPECIFIC TRACK/PROGRAM — not the umbrella organization. Name it like "Austin Film Festival — Screenplay Competition" or "Sundance Institute — Screenwriters Lab." If a festival has multiple tracks that could fit this project's stage, include the best-fitting one. If a different track at the same festival would fit BETTER than the one you surfaced, include THAT one instead.

NOTE: A second verification pass will rigorously check each candidate's eligibility against this project's stage, genre/format, and demographic/thematic requirements. Your job is to cast a reasonably broad but relevant net. Include candidates where you are reasonably confident about stage fit; the verification pass will confirm or reject.

Respond ONLY with a JSON array. Each object must have:
- "name" (the specific track/program, not just the umbrella — e.g. "Screenplay Competition" not just "Austin Film Festival")
- "organization" (the umbrella, e.g. "Austin Film Festival")
- "type" ("Grant"|"Festival"|"Lab"|"Fellowship"|"Residency")
- "deadline" (specific date in "Month Day, Year" format when available, or "rolling" / "ongoing" for continuous intake — must be today or later)
- "amount", "submissionFee", "url"
- "description" (2-3 sentences describing THIS SPECIFIC TRACK, not the umbrella organization)
- "matchReason" (why this fits THIS specific project — reference the analysis AND team credentials if relevant)
- "teamAdvantage" (optional — if a specific team member's credentials give this project an edge for this opportunity, explain how. E.g., "Erika Hampson's Oscar win makes this project eligible for AMPAS Gold programs" — leave empty if team credentials don't specifically apply)
- "matchStrength" ("strong"|"moderate"|"speculative")
- "eligibility" (other key requirements beyond stage)

Find 12-18 real opportunities with CURRENT, FUTURE deadlines. The verification pass will filter, so err slightly on the side of inclusion when you're reasonably confident. Prioritize opportunities where team credentials give maximum leverage.`;

    try {
      const txt = await askClaude(prompt, true);
      const parsed = extractJSON(txt);
      if (parsed && Array.isArray(parsed)) {
        // Hard client-side filter: drop any that already exist as submitted apps FOR THIS PROJECT
        const submittedSet = new Set(
          projectApps
            .filter(ap => ap.status === "submitted")
            .map(ap => (ap.oppName || "").toLowerCase().trim() + "|" + (ap.oppOrg || "").toLowerCase().trim())
        );
        // Also filter out user-rejected opportunities (they said "don't surface again")
        const rejectedSet = new Set(
          (rejectedOppsRef.current || []).map(r =>
            (r.name || "").toLowerCase().trim() + "|" + (r.organization || "").toLowerCase().trim()
          )
        );
        const dedupedCandidates = parsed.filter(o => {
          const key = (o.name || "").toLowerCase().trim() + "|" + (o.organization || "").toLowerCase().trim();
          if (submittedSet.has(key)) return false;
          if (rejectedSet.has(key)) {
            console.log("Discovery: dropped user-rejected opp:", o.name);
            return false;
          }
          return true;
        });

        // Filter out candidates whose deadline has already passed.
        // Handles common formats: "June 15, 2026", "2026-06-15", "rolling", "ongoing".
        // When parsing fails, we keep the opp (uncertain — let verification handle it).
        // This uses the same checkDeadlineStatus function as Pass 2, so both passes
        // agree on what "past" means.
        const freshCandidates = dedupedCandidates.filter(o => {
          const status = checkDeadlineStatus(o.deadline);
          // Keep: future, rolling, unparseable. Drop only definitive past.
          if (status.status === "past") {
            console.log("Discovery: dropped past-deadline opp:", o.name, "(deadline:", o.deadline, ", " + status.daysAgo + " days ago)");
            return false;
          }
          return true;
        });
        const droppedPastDeadline = dedupedCandidates.length - freshCandidates.length;

        // Update job label so user sees we're now verifying
        updateJob(jobId, { label: "Verifying " + freshCandidates.length + " candidates..." + (droppedPastDeadline > 0 ? " (" + droppedPastDeadline + " past-deadline dropped)" : "") });

        // Helper: check if this search run is still the active one. If a newer
        // search has started, its jobId replaced ours, so we should stop writing.
        const isStillActive = () => new Promise(resolve => {
          setJobs(current => {
            resolve(current.some(j => j.id === jobId));
            return current;
          });
        });

        // Show preliminary results so the user knows something's happening
        if (await isStillActive()) {
          setSearchResults(freshCandidates.map(c => ({ ...c, verification: { overallVerdict: "pending" } })));
        }

        // PASS 2 — Verify each candidate in parallel
        const verifiedResults = await Promise.all(
          freshCandidates.map(async (candidate) => {
            try {
              const verification = await verifyOpportunityFit(candidate, p);
              return { ...candidate, verification };
            } catch (err) {
              console.error("Verification error for " + candidate.name + ":", err);
              return {
                ...candidate,
                verification: {
                  overallVerdict: "uncertain",
                  error: err.message || "verification failed",
                  stageGate: null,
                  genreGate: null,
                  demographicGate: null
                }
              };
            }
          })
        );

        // If a newer search ran while we were verifying, abandon these results
        if (!(await isStillActive())) {
          return;
        }

        // Filter: drop "fail" entirely, keep "verified" and "uncertain"
        const surviving = verifiedResults.filter(r =>
          r.verification && r.verification.overallVerdict !== "fail"
        );

        // Sort: verified first (by matchStrength), then uncertain (by matchStrength)
        const strengthOrder = { strong: 0, moderate: 1, speculative: 2 };
        const verdictOrder = { verified: 0, uncertain: 1, pending: 2 };
        const sorted = [...surviving].sort((a, b) => {
          const av = verdictOrder[a.verification.overallVerdict] ?? 3;
          const bv = verdictOrder[b.verification.overallVerdict] ?? 3;
          if (av !== bv) return av - bv;
          return (strengthOrder[a.matchStrength] || 2) - (strengthOrder[b.matchStrength] || 2);
        });

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

  // PASS 2 — Eligibility verification. For each candidate from Pass 1 discovery,
  // run a focused web search to check the opportunity's guidelines against the
  // project's stage, genre/format, and demographic/thematic eligibility attributes.
  // Returns structured verification with per-gate evidence and source URLs.
  const verifyOpportunityFit = async (candidate, project) => {
    const attrs = project.eligibilityAttributes || [];
    const attrLabels = attrs
      .map(k => ELIGIBILITY_ATTRIBUTES.find(a => a.key === k))
      .filter(Boolean)
      .map(a => a.label);
    const attrSection = attrLabels.length > 0
      ? "PROJECT'S ELIGIBILITY ATTRIBUTES (filmmaker has declared these apply):\n" + attrLabels.map(l => "- " + l).join("\n")
      : "PROJECT'S ELIGIBILITY ATTRIBUTES: (none declared by user — filmmaker hasn't checked any attributes in project settings)";

    const scriptStatusLabel = (SCRIPT_STATUS_OPTIONS.find(o => o.key === project.scriptStatus) || {}).label || null;
    const scriptStatusLine = scriptStatusLabel
      ? `Script Status: ${scriptStatusLabel}`
      : `Script Status: (not declared)`;

    const verifyTodayReadable = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    const verifyTodayISO = new Date().toISOString().slice(0, 10);
    const candidateDeadline = candidate.deadline || "(not provided)";

    // JavaScript has already done the date math. The model will read this,
    // not re-do arithmetic. This removes a whole class of availability failures
    // caused by LLM date-comparison errors.
    const deadlineStatus = checkDeadlineStatus(candidate.deadline);
    let deadlineContextForPrompt = "";
    if (deadlineStatus.status === "future") {
      deadlineContextForPrompt = `JS DATE CHECK: The candidate's claimed deadline ("${candidateDeadline}") parses to ${deadlineStatus.date.toISOString().slice(0, 10)}, which is ${deadlineStatus.daysUntil} days from now. The deadline is IN THE FUTURE. Do not re-do this math. Your job is only to verify the program is currently active on its own site.`;
    } else if (deadlineStatus.status === "past") {
      deadlineContextForPrompt = `JS DATE CHECK: The candidate's claimed deadline ("${candidateDeadline}") parses to ${deadlineStatus.date.toISOString().slice(0, 10)}, which was ${deadlineStatus.daysAgo} days ago. That specific date has passed. However, this does NOT automatically mean the program is closed — the program may have a newer cycle announced. Your job is to check the program's own official site to see if a future cycle exists or if the program is genuinely closed/discontinued.`;
    } else if (deadlineStatus.status === "rolling") {
      deadlineContextForPrompt = `JS DATE CHECK: The candidate's claimed deadline ("${candidateDeadline}") indicates a ROLLING/CONTINUOUS intake. Your job is only to verify this claim — check the program's own official site for language confirming rolling intake.`;
    } else {
      deadlineContextForPrompt = `JS DATE CHECK: The candidate's claimed deadline ("${candidateDeadline}") could not be parsed into a specific date. Your job is to find the current deadline on the program's own official site.`;
    }

    const prompt = `You are verifying whether a specific film opportunity is a genuine fit for a specific project. You will evaluate FIVE gates and return structured JSON with evidence.

📅 TODAY'S DATE: ${verifyTodayReadable} (${verifyTodayISO})

═══════════════════════════════════════════
OPPORTUNITY
═══════════════════════════════════════════
Name: ${candidate.name}
Organization: ${candidate.organization}
Type: ${candidate.type}
URL: ${candidate.url || "(none provided)"}
Description: ${candidate.description || ""}
Claimed deadline: ${candidateDeadline}

═══════════════════════════════════════════
PROJECT
═══════════════════════════════════════════
Title: ${project.title}
Stage: ${project.stage}
${scriptStatusLine}
Format: ${project.format}
Genre: ${project.genre || "unspecified"}
Logline: ${project.logline || "?"}
Themes: ${project.themes || "?"}
${attrSection}

═══════════════════════════════════════════
🚨 CRITICAL TERMINOLOGY GUIDANCE — READ BEFORE EVALUATING
═══════════════════════════════════════════

**STAGE TERMINOLOGY — do not misinterpret:**

"Development" stage is the MOST commonly misinterpreted. It refers to the PROJECT'S overall phase (not yet shot or produced), NOT to the script being unfinished. A project in "Development" stage very commonly has a COMPLETED, POLISHED screenplay that is ready to submit to labs and competitions. Check the Script Status field above to resolve ambiguity:

- Stage "Development" + Script Status "Completed and polished" → screenplay is DONE. Opportunities asking for "completed scripts," "polished screenplays," "feature-length screenplays," or "a draft of your screenplay" should PASS stage gate.
- Stage "Development" + Script Status "Draft in progress" → screenplay is still being written. Only opportunities explicitly accepting works-in-progress should pass.
- Stage "Development" + Script Status "Locked shooting script" → screenplay is final. Same as polished for most grant purposes.
- Stage "Completed" = the FILM is completed (finished, distributable). NOT the screenplay.
- Stage "Pre-Production" / "Production" / "Post-Production" refer to the film's production phase, not the script.

If the opportunity asks for a "completed screenplay" or "finished script," look at Script Status, NOT at the project stage. If Script Status is "polished" or "locked," PASS. Do not fail a project because its Stage says "Development" when its Script Status says the script is done.

**DEMOGRAPHIC/ELIGIBILITY LABEL SYNONYMS — recognize these as equivalent:**

Grant and fellowship language varies but these categories are treated as equivalent for eligibility purposes. Do NOT demand exact label matches.

- "Women-led" ≈ "woman filmmaker" ≈ "women filmmakers" ≈ "woman-identifying filmmaker(s)" ≈ "female filmmaker(s)" ≈ "women writers" ≈ "women directors" ≈ "women creators" ≈ "women in film" ≈ "woman creator/artist." If the project declares "Women-led," it satisfies opportunities requiring any of these.
- "BIPOC filmmaker(s)" ≈ "filmmakers of color" ≈ "people of color" ≈ "POC" ≈ "filmmakers from underrepresented communities" ≈ "underrepresented filmmakers" ≈ "diverse creators" ≈ "Black, Indigenous, and People of Color."
- "LGBTQ+ filmmaker(s)" ≈ "LGBTQ+" ≈ "queer" ≈ "LGBT" ≈ "LGBTQIA+" ≈ "queer filmmakers" ≈ "gay, lesbian, bisexual, transgender, queer."
- "Jewish filmmaker(s)" ≈ "Jewish" ≈ "Jewish creator" ≈ "of Jewish descent" ≈ "Jewish heritage."
- "Disabled filmmaker(s)" ≈ "filmmakers with disabilities" ≈ "disability community" ≈ "disabled artists."
- "Veteran(s) on team" ≈ "veteran filmmakers" ≈ "military veterans."
- "Immigrant / first-gen team" ≈ "immigrant filmmakers" ≈ "first-generation American filmmakers" ≈ "diaspora filmmakers."

For THEMES, similar synonyms apply:
- "BIPOC stories / subjects" ≈ "stories centering people of color" ≈ "Black stories" ≈ "Latino stories" ≈ etc.
- "LGBTQ+ stories / subjects" ≈ "queer stories" ≈ "gay-themed films" ≈ "trans narratives" ≈ etc.
- "Women-centered stories" ≈ "female-driven narratives" ≈ "stories about women."
- "Jewish themes / subjects" ≈ "Jewish stories" ≈ "Jewish heritage/culture themes" ≈ "stories about Jewish identity."

When the project declares an attribute and the opportunity asks for a synonym of that attribute, the demographic gate PASSES.

**UMBRELLA ORGANIZATIONS vs. SPECIFIC TRACKS — be strict:**

Many festivals run multiple tracks/competitions. Austin Film Festival runs the Valhalla Entertainment Award (completed films), Screenplay Competition (screenplays), Second Rounders (screenplays), etc. Each has its OWN eligibility — do not conflate them.

When evaluating this opportunity: "${candidate.name}" at "${candidate.organization}":
- Verify eligibility for the SPECIFIC track named "${candidate.name}", not for the umbrella organization.
- If you can ONLY find umbrella-level information (e.g., "Austin Film Festival accepts screenplays and films") but cannot find information specific to "${candidate.name}", return UNCERTAIN with a clear note that you couldn't find track-specific info.
- Do NOT pass stage gate based on "the umbrella accepts this somewhere." The evidence must be for the specific track.
- Example: if asked about "Austin FF — Valhalla Award" and you only find that Austin FF "accepts screenplays in its Screenplay Competition," that is NOT evidence Valhalla accepts screenplays. Return uncertain.

═══════════════════════════════════════════
YOUR TASK
═══════════════════════════════════════════
Use web search to find the opportunity's official eligibility / submission guidelines page for THIS SPECIFIC TRACK. Read it carefully. Then evaluate FIVE gates:

GATE 1 — STAGE:
Does this opportunity explicitly accept projects at the "${project.stage}" stage ${scriptStatusLabel ? "with script status \"" + scriptStatusLabel + "\"" : ""}? Apply the STAGE TERMINOLOGY guidance above. Look for language in THIS specific track's guidelines like "must be a completed feature," "screenplays in development only," "accepting rough cuts," "projects entering post-production," etc.

GATE 2 — GENRE/FORMAT:
Does this opportunity accept "${project.format}" ${project.genre ? "in the \"" + project.genre + "\" genre" : ""}? Look for format restrictions (narrative vs. documentary vs. animation vs. experimental vs. hybrid) and genre restrictions or preferences. A narrative horror project should FAIL a documentary-only grant. A feature-film-only grant should FAIL a short film.

GATE 3 — DEMOGRAPHIC / THEMATIC:
Does this opportunity have a demographic or thematic eligibility requirement (e.g., "for Jewish filmmakers," "BIPOC-led projects," "LGBTQ+ stories," "women directors")? 
- If NO such requirement exists (opportunity is demographic/theme-neutral), return null for this gate.
- If YES: check whether the project qualifies based on the eligibility attributes listed above. Apply the SYNONYM guidance above — declared attributes cover equivalent requirements. If the project's declared attributes include (directly OR as a synonym) what the opportunity requires, pass.
- If the opportunity requires an attribute that the project does NOT declare AND isn't satisfied by synonyms, this is still NOT necessarily a fail — the filmmaker may simply not have checked that box even though it applies. In this case, return UNCERTAIN with a clear concern note like: "⚠ This requires [X]. Your project doesn't declare [X] in eligibility attributes. If [X] applies to you, edit your project to check it and re-audit."
- Only fail if the opportunity clearly requires an attribute the project explicitly cannot satisfy (e.g., opportunity requires "first-time filmmaker only" and the project team has prior credits visible in the materials).

GATE 4 — AVAILABILITY:
JavaScript has already done the date arithmetic for you. Do NOT re-check dates or compare months. Your job is narrower: determine whether the program is currently accepting applications, by doing DEEP multi-page research on the program's own official site.

${deadlineContextForPrompt}

🚨 MANDATORY THOROUGH RESEARCH — READ THIS BEFORE YOU START:

Film program websites are layered. A landing page may show stale 2025 information while the ACTUAL current-cycle info is two or three clicks deeper — on the application page, FAQ, deadlines page, or a "how to apply" sub-page. Program calendars are often separate pages. Sometimes the current-cycle open-call announcement is only on a news/press page that IS authoritative (distinct from generic blog posts).

You have generous tool budget: up to 15 web_fetch calls and multiple web_search queries. USE THEM. A verdict based on 1-2 page reads is almost certainly shallow. A verdict based on 5-8 page reads across the program's own site is thorough.

FOLLOW THIS RESEARCH PATTERN:

STEP 1 — Locate the program's own domain via web_search. Multiple search queries if needed:
  • "[program name] [current year] deadline"
  • "[program name] application [current year]"
  • "[program name] FAQ submission"
  • "[program name] guidelines"
Cast a wide net. 2-4 searches is reasonable.

STEP 2 — Read the ACTUAL pages, not just snippets. Use web_fetch to read the full content of:
  a. The main program page on the program's own domain
  b. The application/submission page (look for "apply," "submit," "application")
  c. The FAQ or guidelines page
  d. The deadlines/calendar page if it exists
  e. If the site has a "news" or "announcements" section, the most recent current-cycle announcement

Don't stop at 2 pages. If those 2 don't have definitive current-cycle info, keep fetching: the site navigation, the "about the program" page, the "past recipients" page (which often mentions recent cycle years), the handbook/PDF if linked. BE THOROUGH.

STEP 3 — Synthesize across pages. If the main page says "2025" but the application page says "2027 open call now accepting," the application page WINS. Current-cycle announcements on dedicated pages trump stale main-page text.

STEP 4 — Only after doing steps 1-3, render a verdict. Base it on the MOST SPECIFIC AND MOST CURRENT page you found, not the first page you landed on.

HALLMARKS OF SHALLOW RESEARCH (avoid these — they produce wrong verdicts):
  • Relying on a single search snippet instead of fetching the actual page
  • Reading only the program's main landing page
  • Citing a blog post or news article as primary evidence
  • Concluding "no 2026 cycle" from absence of info in first 2 results
  • Treating Submittable archive pages as current-cycle data

HALLMARKS OF THOROUGH RESEARCH (aim for these):
  • Fetched 4+ pages on the program's own domain
  • Read the actual application page, not just the main page
  • Synthesized across pages when they disagreed
  • Named the specific URL where current-cycle evidence lives
  • Acknowledged pages you couldn't fetch or that were ambiguous

SOURCE HIERARCHY (in order of authority):
  1. The program's CURRENT APPLICATION PAGE on its own domain (most authoritative)
  2. The program's FAQ or guidelines page
  3. The program's deadlines or calendar page
  4. The program's main program page
  5. Press releases or news articles ON the program's own domain (dated from current year)
  6. Aggregators and third-party listings (use only as signal to search further, never as primary evidence)

VERDICTS:
- PASS: You fetched the program's application page (or FAQ) and it shows a current or upcoming open cycle. You can quote specific current-cycle language from a specific URL.
- FAIL: You fetched the program's application page (or FAQ) and it explicitly states the program is discontinued, on permanent hiatus, or no future cycle is planned. The evidence is from the program's own current pages, not from a historical article.
- UNCERTAIN: You did thorough research but could not find definitive current-cycle evidence, OR the pages you found contradict each other ambiguously. This is an HONEST uncertain — not a lazy cop-out. State in your concern what you searched, what you fetched, and what remains unclear.

🚨 PAST CYCLES vs CURRENT CYCLES — CRITICAL DISTINCTION:

Program pages often list BOTH past and current cycle information on the same page. For example:
  "Applications for 2026 were April 15 – May 14, 2025."
  "The 2027 cycle will open April 14, 2026 through May 12, 2026."

If you see BOTH on the same page, the CURRENT/UPCOMING cycle is what determines the verdict. Past cycle info is context (proves the program runs annually). Current cycle info is the verdict-relevant evidence.

Apply this test: Does the page list a cycle whose deadline is TODAY OR LATER (${verifyTodayReadable})? If yes → PASS. The fact that a PREVIOUS cycle is listed on the same page is not a FAIL signal. It's just history.

Do NOT anchor on past cycle dates and ignore current cycle dates. If you correctly identify in your own evidence that "X cycle is still in the future from today's date," your verdict MUST be PASS. Do not write "in the future from today" and then return FAIL — that's a direct contradiction.

When FAILing, ALWAYS populate the \`failureType\` field with one of: "discontinued" (program has ended), "on-hold" (paused pending funding/restructuring), "past-deadline" (most recent cycle ended with no future cycle). If unsure which, use "past-deadline" as the default.

DEFAULT BIAS: A FAIL verdict tells the user to delete their draft; a false FAIL destroys real work. UNCERTAIN simply asks the user to verify. Require explicit closure language on the program's application or FAQ page before FAILing. If you only looked at one page, or only at blog/news pages, UNCERTAIN.

EVIDENCE REQUIREMENTS:
- Your evidence must quote the EXACT phrase from the application or FAQ page.
- Your sourceUrl must be the SPECIFIC page where the evidence lives — not the program's homepage, and not a blog post.
- If you quote from a blog post or news article as your primary evidence, your verdict MUST be UNCERTAIN, not FAIL.
- The concern field should state which pages you fetched and what you found/couldn't find.

GATE 5 — SERVICE-STAGE FIT:
Does the SERVICE this program offers actually help a project at the "${project.stage}" stage? This is NOT about whether the applicant is eligible — that's stage gate. This is about whether the program's OFFERED HELP matches what a project at this stage actually needs.

The test to apply: "If this project won this opportunity right now, at its current stage, could it meaningfully USE what the program provides?"

Examples of service-stage MISMATCH (these should FAIL this gate even if the stage gate passes):
- An equipment-support program (cameras, lighting, production gear) awarded to a Development-stage project. The project has no shoot date and no use for production gear. Even if the program "accepts" indie features in a general sense, a screenplay cannot use cameras.
- A post-production finishing fund awarded to a Development-stage project. Nothing to post-produce.
- A distribution grant awarded to a Development or Production-stage project. Nothing finished to distribute.
- A script development lab awarded to a Completed-stage project. The script is finished and the film is made — the lab's service is past.
- A publicity/marketing grant for released films, awarded to a film in pre-production. No film to publicize yet.
- A production insurance grant to a development-stage project with no shoot scheduled.
- A TAX CREDIT PROGRAM awarded to a Development-stage project. Tax credits offset production costs — if there are no production costs yet (still in script development), the credit has nothing to offset. Even if the program "accepts applications" from development-stage projects, it CANNOT be meaningfully used until the project is actually shooting. Tax credits, production financing (when tied to shoot dates), and any program requiring proof-of-shoot or principal-photography-within-X-days are FAIL for Development-stage projects.
- Any program requiring principal photography within a specific window (e.g., "shooting must begin within 180 days") awarded to a Development-stage project. The project is nowhere near shooting.

Examples of service-stage FIT (these PASS this gate):
- A screenwriting fellowship for a Development-stage project with a completed screenplay.
- A production financing grant for a Pre-Production or Production-stage project.
- A finishing fund for a Post-Production project with rough cut.
- A distribution grant for a Completed film.
- A packaging/financing program for a Development-stage project preparing for production.

Verdicts:
- PASS: The program's offered service (funding type, equipment, post-production, distribution, mentorship, lab experience, etc.) is something a "${project.stage}"-stage project can actually USE right now.
- FAIL: The program's service is fundamentally tied to a different stage of filmmaking — the project cannot meaningfully use it at its current stage. Name WHICH service/stage mismatch in the evidence.
- UNCERTAIN: You can't clearly determine what service the program provides, or the program's scope is unclear.

For the evidence, quote the program's description of its offered service (e.g., "provides free camera packages for films shooting on 16mm"). For the concern field, state the mismatch plainly (e.g., "Program offers production equipment. Project is in development stage with no shoot date — cannot use equipment").

═══════════════════════════════════════════
RULES — READ CAREFULLY
═══════════════════════════════════════════
1. "Uncertain" is a VALID and IMPORTANT answer. Do NOT fabricate. If you cannot locate the track-specific eligibility page, return uncertain with a note explaining what you couldn't find.
2. "Fail" requires CONFIDENT evidence the project does not qualify. Not a hunch, not a missing attribute check.
3. "Pass" requires CONFIDENT evidence the project DOES qualify. Not an assumption from umbrella-level info.
4. Evidence must be a SPECIFIC phrase or clear paraphrase from the actual guidelines for this TRACK — NOT general knowledge, NOT umbrella-level language.
5. A team member's adjacent experience does NOT make a project eligible for a different genre/format. A documentary producer on a horror feature does not make the horror feature eligible for a documentary grant.
6. Always include the sourceUrl where you found the evidence. Use the most specific URL possible (the track's eligibility page, not the umbrella homepage).
7. Apply the TERMINOLOGY guidance above before making a call — don't be hyper-literal.

═══════════════════════════════════════════
OUTPUT FORMAT
═══════════════════════════════════════════
Respond ONLY with JSON (no markdown, no commentary):
{
  "stageGate": {
    "verdict": "pass" | "fail" | "uncertain",
    "evidence": "exact phrase or paraphrase from guidelines",
    "sourceUrl": "URL where you found this evidence",
    "concern": "explanation if fail or uncertain, else empty string"
  },
  "genreGate": {
    "verdict": "pass" | "fail" | "uncertain",
    "evidence": "...",
    "sourceUrl": "...",
    "concern": "..."
  },
  "demographicGate": null,
  "availabilityGate": {
    "verdict": "pass" | "fail" | "uncertain",
    "evidence": "exact phrase from guidelines/FAQ showing status (deadline text, discontinuation notice, pause notice, or rolling-intake confirmation)",
    "sourceUrl": "URL",
    "concern": "explanation if fail or uncertain, else empty",
    "failureType": "'past-deadline' | 'discontinued' | 'on-hold' | null — null when verdict is pass or uncertain",
    "actualDeadline": "the real deadline or status — e.g., 'April 2, 2026 at 3pm ET (already passed, next cycle not yet announced)' or 'March 15, 2027' or 'truly rolling — no fixed deadline' or 'Discontinued: fellowship no longer offered per 2026 FAQ' or 'On hold pending funding'"
  },
  "serviceFitGate": {
    "verdict": "pass" | "fail" | "uncertain",
    "evidence": "exact phrase from guidelines describing the service/help the program offers (e.g., 'free camera packages for films shooting on 16mm', 'development funding up to $50k for screenplays', 'theatrical release support')",
    "sourceUrl": "URL",
    "concern": "if fail: state the stage-service mismatch plainly (e.g., 'Program offers production equipment. Project is in development stage with no shoot date — cannot use equipment'). Empty if pass.",
    "offeredService": "what the program actually provides (e.g., 'script development funding', 'post-production finishing', 'equipment', 'distribution support', 'mentorship + lab residency')"
  },
  "overallVerdict": "verified" | "fail" | "uncertain"
}

If there is a demographic/thematic gate, replace null with the same object shape as the other gates.

overallVerdict rules:
- "verified" if all non-null gates (including availabilityGate and serviceFitGate) return "pass"
- "fail" if ANY gate returns "fail" — INCLUDING availabilityGate or serviceFitGate. A closed, discontinued, or stage-service-mismatched opportunity is a definitive fail.
- "uncertain" if no gate fails but at least one gate is "uncertain"`;

    const response = await askClaude(prompt, true); // use web search
    const result = extractJSON(response);

    // Defensive shape check
    if (!result || typeof result !== "object") {
      return {
        overallVerdict: "uncertain",
        error: "could not parse verification response",
        stageGate: null,
        genreGate: null,
        demographicGate: null,
        availabilityGate: null,
        serviceFitGate: null
      };
    }

    // Back-compat: if the model returned the old field name "deadlineGate", use it as availabilityGate
    if (result.deadlineGate && !result.availabilityGate) {
      result.availabilityGate = result.deadlineGate;
    }

    // SAFETY CHECK: catch model-vs-JS disagreement on availability.
    //
    // Philosophy: a FAIL verdict tells the user to delete their draft. We should
    // only trust FAIL when the model cites explicit closure (discontinued, on-hold,
    // hiatus) via its failureType field. If the model returned FAIL for any other
    // reason — arithmetic error, trusted a stale source, read only a blog post —
    // downgrade to UNCERTAIN (or upgrade to PASS when evidence explicitly supports it).
    //
    // This is deliberately biased toward UNCERTAIN/PASS because false FAILs are
    // destructive (deleted drafts) while false UNCERTAINs just add a review step.
    if (result.availabilityGate && result.availabilityGate.verdict === "fail") {
      const failType = (result.availabilityGate.failureType || "").toLowerCase();
      const isExplicitClosureFail = failType.includes("discontinued") ||
        failType.includes("on-hold") || failType.includes("on hold") ||
        failType.includes("hiatus") || failType.includes("paused") ||
        failType.includes("permanently");

      // Check if model's OWN evidence contradicts its FAIL verdict.
      // This catches cases like Sundance where the model correctly researched,
      // correctly described the active cycle, and then contradictorily said FAIL.
      // Only trigger on UNAMBIGUOUS contradiction phrases that cannot be negated
      // (avoid substrings like "will open" that might match "will NOT open").
      const evidenceBlob = ((result.availabilityGate.evidence || "") + " " +
                            (result.availabilityGate.concern || "") + " " +
                            (result.availabilityGate.actualDeadline || "")).toLowerCase();
      const evidenceContradictsFail =
        evidenceBlob.includes("in the future from today") ||
        evidenceBlob.includes("still in the future") ||
        evidenceBlob.includes("currently accepting") ||
        evidenceBlob.includes("now accepting applications") ||
        evidenceBlob.includes("applications are open") ||
        evidenceBlob.includes("currently open for submissions") ||
        evidenceBlob.includes("open for submissions now") ||
        evidenceBlob.includes("is open") && deadlineStatus.status === "future" ||
        (evidenceBlob.includes("deadline has not passed") && deadlineStatus.status === "future");

      if (isExplicitClosureFail) {
        // Model cited explicit closure. Trust it (with note if JS disagrees on the date).
        if (deadlineStatus.status === "future") {
          const origConcern = result.availabilityGate.concern || "";
          result.availabilityGate.concern =
            "Note: JS detected a future deadline (" + deadlineStatus.date.toISOString().slice(0, 10) + "), " +
            "but AI cited " + failType + " — FAIL stands on the closure evidence. " +
            "AI reasoning: " + (origConcern || "(none)");
        }
        // Otherwise, explicit closure fail — no override needed.
      } else if (evidenceContradictsFail) {
        // Model's own evidence explicitly contradicts its FAIL verdict.
        // Upgrade to PASS — the model did the research, got the right answer in the evidence,
        // then wrote the wrong verdict. Trust the evidence, not the verdict label.
        const origConcern = result.availabilityGate.concern || "";
        const origEvidence = result.availabilityGate.evidence || "";
        result.availabilityGate.verdict = "pass";
        result.availabilityGate.concern =
          "✓ AUTO-UPGRADED to PASS. The AI's own evidence (\"" +
          origEvidence.slice(0, 200) + (origEvidence.length > 200 ? "..." : "") +
          "\") confirms an active or upcoming cycle, but its verdict field said FAIL. " +
          "Trusting the evidence over the verdict label. " +
          "AI's original concern text: " + (origConcern || "(none)");
        result._jsOverride = "evidence-contradicts-fail-upgraded-to-pass";
      } else {
        // Model did NOT cite explicit closure, and evidence doesn't clearly contradict the fail.
        // Downgrade to UNCERTAIN — could be wrong for many reasons (stale source, shallow research, etc).
        const origConcern = result.availabilityGate.concern || "";
        let downgradeReason;
        if (deadlineStatus.status === "future") {
          downgradeReason = "JS date check: deadline is " + deadlineStatus.daysUntil + " days in the future (" +
            deadlineStatus.date.toISOString().slice(0, 10) + "). ";
        } else if (deadlineStatus.status === "rolling") {
          downgradeReason = "Candidate claimed rolling intake. ";
        } else if (deadlineStatus.status === "unparseable") {
          downgradeReason = "JS could not verify the deadline (unparseable format). ";
        } else {
          // past
          downgradeReason = "JS date check: claimed deadline (" + deadlineStatus.date.toISOString().slice(0, 10) +
            ") was " + deadlineStatus.daysAgo + " days ago, but a new cycle may exist. ";
        }
        result.availabilityGate.verdict = "uncertain";
        result.availabilityGate.concern =
          "⚠ " + downgradeReason +
          "AI returned FAIL without citing discontinuation, hiatus, or permanent closure. " +
          "Auto-downgraded to UNCERTAIN — verify manually via the program's current application page. " +
          "AI's original reasoning: " + (origConcern || "(none)");
        result._jsOverride = "non-closure-fail-" + deadlineStatus.status;
      }
    }
    // Also attach the JS status to the gate for UI display
    if (result.availabilityGate) {
      result.availabilityGate._jsStatus = deadlineStatus.status;
    }

    // Ensure overallVerdict is present and valid
    const validVerdicts = ["verified", "fail", "uncertain"];
    if (!validVerdicts.includes(result.overallVerdict)) {
      // Derive from gates if missing (include availabilityGate and serviceFitGate)
      const gates = [result.stageGate, result.genreGate, result.demographicGate, result.availabilityGate, result.serviceFitGate].filter(g => g && g.verdict);
      if (gates.some(g => g.verdict === "fail")) result.overallVerdict = "fail";
      else if (gates.every(g => g.verdict === "pass") && gates.length > 0) result.overallVerdict = "verified";
      else result.overallVerdict = "uncertain";
    }

    // Re-derive overallVerdict if availability got downgraded by the safety check
    if (result._jsOverride) {
      const gates = [result.stageGate, result.genreGate, result.demographicGate, result.availabilityGate, result.serviceFitGate].filter(g => g && g.verdict);
      if (gates.some(g => g.verdict === "fail")) result.overallVerdict = "fail";
      else if (gates.every(g => g.verdict === "pass") && gates.length > 0) result.overallVerdict = "verified";
      else result.overallVerdict = "uncertain";
    }

    result.verifiedAt = new Date().toISOString();
    return result;
  };

  // SIBLING TRACK FINDER — When a verification fails because of stage mismatch
  // (e.g., "Valhalla Award requires completed films" but project is a screenplay),
  // many festivals/institutes offer OTHER tracks at the same org that would fit.
  // This finds those sibling tracks via a focused web search.
  const findSiblingTracks = async (failedOppName, failedOppOrg, project) => {
    const todayReadable = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    // Same context-building as verifyOpportunityFit and Pass 1 so siblings are evaluated with full awareness
    const sib_scriptStatusLabel = (SCRIPT_STATUS_OPTIONS.find(o => o.key === project.scriptStatus) || {}).label || null;
    const sib_scriptStatusLine = sib_scriptStatusLabel
      ? `Script Status: ${sib_scriptStatusLabel}`
      : "";
    const sib_attrs = (project.eligibilityAttributes || [])
      .map(k => ELIGIBILITY_ATTRIBUTES.find(a => a.key === k))
      .filter(Boolean)
      .map(a => a.label);
    const sib_attrsLine = sib_attrs.length > 0
      ? `Eligibility Attributes: ${sib_attrs.join(", ")}`
      : "";

    const prompt = `You are helping a filmmaker find the RIGHT track at an organization where they picked the wrong one.

═══════════════════════════════════════════
CONTEXT
═══════════════════════════════════════════
The filmmaker attempted to apply to "${failedOppName}" at "${failedOppOrg}" for their project, but that specific track turned out to be ineligible (usually a stage mismatch — e.g., the track requires a completed film but their project is a screenplay, or vice versa).

Many festivals and institutes run MULTIPLE tracks/programs/competitions under one umbrella, each with its own eligibility. Your job: find the OTHER tracks at "${failedOppOrg}" (and ONLY that organization — not other festivals) that WOULD accept this filmmaker's project.

═══════════════════════════════════════════
PROJECT
═══════════════════════════════════════════
Title: ${project.title}
Stage: ${project.stage}${sib_scriptStatusLine ? "\n" + sib_scriptStatusLine : ""}
Format: ${project.format}
Genre: ${project.genre || "unspecified"}
Logline: ${project.logline || "?"}
Themes: ${project.themes || "?"}${sib_attrsLine ? "\n" + sib_attrsLine : ""}

📅 TODAY'S DATE: ${todayReadable}

═══════════════════════════════════════════
📝 TERMINOLOGY AWARENESS (READ BEFORE MATCHING)
═══════════════════════════════════════════

STAGE: "Development" refers to the PROJECT'S overall phase, NOT to the script being unfinished. ${sib_scriptStatusLabel ? `Check Script Status above: this project's script is "${sib_scriptStatusLabel}." Treat the screenplay accordingly — a "completed and polished" or "locked" script is READY for labs, competitions, and screenplay-focused tracks, even while the overall project stage is "Development."` : `Projects in "Development" stage commonly have completed scripts ready for screenplay labs/competitions.`}

DEMOGRAPHIC SYNONYMS (recognize as equivalent):
- "Women-led" ≈ "woman filmmaker(s)" ≈ "women writers/directors" ≈ "female filmmaker" ≈ "woman-identifying"
- "BIPOC filmmaker(s)" ≈ "filmmakers of color" ≈ "people of color" ≈ "underrepresented filmmakers"
- "LGBTQ+ filmmaker(s)" ≈ "queer" ≈ "LGBTQIA+" ≈ "LGBT"
- "Jewish filmmaker(s)" ≈ "Jewish" ≈ "of Jewish heritage"
- "Disabled" ≈ "filmmakers with disabilities" ≈ "disability community"

If this project declares an attribute (see Eligibility Attributes above), treat it as matching synonyms.

═══════════════════════════════════════════
YOUR TASK — THOROUGH RESEARCH REQUIRED
═══════════════════════════════════════════

You have generous tool budget: up to 15 web_fetch calls and multiple web_search queries. USE THEM. A shallow answer based on 1-2 search snippets will miss most of the programs at "${failedOppOrg}".

RESEARCH PATTERN:

STEP 1 — Cast a wide web_search net. Run multiple queries:
  • "${failedOppOrg} programs ${new Date().getFullYear()}"
  • "${failedOppOrg} competitions deadlines"
  • "${failedOppOrg} screenplay lab" (or "film lab" / "grant" — whichever matches the project)
  • "${failedOppOrg} application" 
Look for the organization's main programs page, submissions page, or "apply" section.

STEP 2 — Fetch the actual pages on "${failedOppOrg}"'s own domain. Start with their main programs or apply page, then navigate to specific track pages. USE web_fetch to read full page contents, not just snippets.

  Key pages to look for:
  • The "Programs" or "Labs" index page (lists all competitions/programs)
  • Individual track pages (one per competition)
  • Current-cycle application pages
  • FAQ or "how to apply" pages

  Many festivals and institutes have a dedicated "/programs/" or "/apply/" or "/competitions/" URL path that lists everything. Find it and read it.

STEP 3 — For each track you find, verify on its OWN page:
  • Does it accept "${project.stage}" stage${sib_scriptStatusLabel ? ` (with script status "${sib_scriptStatusLabel}")` : ""} in "${project.format}" format?
  • Is the current or upcoming cycle's deadline TODAY OR LATER (${todayReadable})?
  • Does it match the project's genre and eligibility attributes?

STEP 4 — Return ONLY tracks at "${failedOppOrg}" that pass ALL checks. Exclude:
  • The original failed track ("${failedOppName}")
  • Tracks from OTHER organizations (even if relevant)
  • Past-deadline tracks with no announced future cycle
  • Tracks where eligibility doesn't match

CRITICAL EXAMPLES OF WHAT TO FIND:

"${failedOppOrg}" often runs MULTIPLE tracks. For example:
  • Austin Film Festival runs BOTH the Valhalla Entertainment Award (completed films) AND the Screenplay Competition (screenplays) AND Second Rounders (screenplays). These live on DIFFERENT pages.
  • Sundance Institute runs Screenwriters Lab, Directors Lab, Producers Lab, Episodic Lab, Documentary Film Program, and more. Each has its own page.
  • Film Independent runs Screenwriting Lab, Documentary Lab, Fiscal Sponsorship, Project Involve, Producers Lab, and the Film Independent Spirit Awards. Each has its own page.

You must find these sibling tracks by navigating the program's own site, not by relying on general knowledge. FETCH the programs index page. FETCH individual track pages.

If "${failedOppOrg}" genuinely has no other tracks that fit, return an empty array. But be thorough first — most major festivals and institutes have multiple tracks, and the right one for this project is likely there if you dig.

Apply the TERMINOLOGY guidance above — don't be hyper-literal about stage labels or demographic phrasing. A "Screenplay Competition" for a Development-stage project with a polished script is a FIT.

═══════════════════════════════════════════
OUTPUT FORMAT
═══════════════════════════════════════════
Respond ONLY with a JSON array (no markdown):
[
  {
    "name": "Specific track name (e.g. 'Screenplay Competition', not just 'Austin Film Festival')",
    "organization": "${failedOppOrg}",
    "type": "Grant" | "Festival" | "Lab" | "Fellowship" | "Residency",
    "deadline": "Month Day, Year" or "rolling",
    "amount": "prize/funding amount if known",
    "submissionFee": "$XX" or "Free",
    "url": "direct URL to this track's page, not the umbrella homepage",
    "description": "2-3 sentences about this SPECIFIC track",
    "whyThisFits": "1-2 sentences explaining why this track fits ${project.title} (stage, format, genre alignment)",
    "matchStrength": "strong" | "moderate"
  }
]

Return 0-5 tracks. Quality over quantity. If no sibling tracks fit, return [].`;

    try {
      const response = await askClaude(prompt, true);
      const result = extractJSON(response);
      if (!Array.isArray(result)) return [];
      return result;
    } catch (err) {
      console.error("findSiblingTracks error:", err);
      return [];
    }
  };

  // AUDIT — Verify eligibility of all draft/approved applications against their projects.
  // Runs verifyOpportunityFit for each draft app, in batches of 5 to respect rate limits.
  // Calls onProgress(done, total) after each batch so the UI can show progress.
  // Calls onDone(results) when finished.
  // Returns a cancellation function — call it to abort further batches (in-flight calls will still complete).
  const runAuditDrafts = (onProgress, onDone) => {
    const allApps = appsRef.current;
    const allProjects = projectsRef.current;
    // Target: draft + approved applications (not submitted — those are settled)
    const targets = allApps.filter(a => a.status === "draft" || a.status === "approved");

    if (targets.length === 0) {
      if (onDone) onDone([]);
      return () => {};
    }

    let cancelled = false;
    const results = [];

    (async () => {
      // Concurrency tuned for thorough research: each verification now makes
      // multiple search + web_fetch tool calls, so parallel batches of 5 were
      // blowing through Anthropic rate limits. 2 is conservative but reliable.
      const BATCH_SIZE = 2;
      // Inter-batch delay gives the rate-limit window room to breathe.
      const INTER_BATCH_DELAY_MS = 3000;

      for (let i = 0; i < targets.length; i += BATCH_SIZE) {
        if (cancelled) break;
        const batch = targets.slice(i, i + BATCH_SIZE);
        const batchResults = await Promise.all(
          batch.map(async (app) => {
            const project = allProjects.find(p => p.title === app.projTitle);
            if (!project) {
              return {
                appId: app.id,
                oppName: app.oppName,
                oppOrg: app.oppOrg,
                projTitle: app.projTitle,
                verification: {
                  overallVerdict: "uncertain",
                  error: "project not found — can't verify",
                  stageGate: null,
                  genreGate: null,
                  demographicGate: null
                }
              };
            }
            // Construct a candidate object from the app's data for verification
            const candidate = {
              name: app.oppName,
              organization: app.oppOrg,
              type: app.oppType,
              url: app.oppUrl,
              deadline: app.oppDeadline,
              description: (app.content && app.content.requirements && app.content.requirements.summary) || ""
            };
            try {
              const verification = await verifyOpportunityFit(candidate, project);
              return {
                appId: app.id,
                oppName: app.oppName,
                oppOrg: app.oppOrg,
                projTitle: app.projTitle,
                verification
              };
            } catch (err) {
              return {
                appId: app.id,
                oppName: app.oppName,
                oppOrg: app.oppOrg,
                projTitle: app.projTitle,
                verification: {
                  overallVerdict: "uncertain",
                  error: err.message || "verification failed",
                  stageGate: null,
                  genreGate: null,
                  demographicGate: null
                }
              };
            }
          })
        );
        if (cancelled) break;
        results.push(...batchResults);

        // Persist audit results onto the apps immediately (so if user closes modal mid-audit, progress is saved)
        const current = appsRef.current;
        const updated = current.map(a => {
          const hit = batchResults.find(r => r.appId === a.id);
          if (!hit) return a;
          return {
            ...a,
            auditResult: hit.verification,
            auditedAt: new Date().toISOString(),
            auditFlagDismissed: false // reset any prior dismissal on re-audit
          };
        });
        sApps(updated);

        if (onProgress) onProgress(Math.min(i + BATCH_SIZE, targets.length), targets.length);

        // Pause between batches to avoid hitting rate limits.
        // Skip the pause after the final batch.
        if (i + BATCH_SIZE < targets.length && !cancelled) {
          await new Promise(r => setTimeout(r, INTER_BATCH_DELAY_MS));
        }
      }
      if (!cancelled && onDone) onDone(results);
    })();

    return () => { cancelled = true; };
  };

  // Background: Generate an application
  // manualFields (optional): array of { fieldName, wordLimit } if user pre-specified the field list
  const runGenerate = async (oppIdx, projectIdx, manualFields) => {
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

      // Build script status and eligibility attribute context
      const gen_scriptStatusLabel = (SCRIPT_STATUS_OPTIONS.find(o => o.key === p.scriptStatus) || {}).label || null;
      const gen_scriptStatusLine = gen_scriptStatusLabel
        ? `\n• Script Status: ${gen_scriptStatusLabel}`
        : "";
      const gen_attrLabels = (p.eligibilityAttributes || [])
        .map(k => ELIGIBILITY_ATTRIBUTES.find(ea => ea.key === k))
        .filter(Boolean)
        .map(ea => ea.label);
      const gen_attrsLine = gen_attrLabels.length > 0
        ? `\n• Eligibility Attributes: ${gen_attrLabels.join(", ")}`
        : "";

      // Voice directive — inject if profile has it enabled
      const gen_voiceBlock = (prof.voiceDirectiveEnabled !== false) ? ("\n\n" + VOICE_DIRECTIVE + "\n") : "";

      const textPrompt = `You are a world-class grant writer and application strategist who has helped films win Sundance, Tribeca, Cinereach, SFFILM, Sundance Institute labs, and dozens of major grants. Your success rate is extraordinary because you NEVER write generic applications — every single submission is meticulously tailored to the specific opportunity's values, voice, aesthetic preferences, selection criteria, and the unique things their committees respond to.
${gen_voiceBlock}

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
• Stage: ${p.stage}${gen_scriptStatusLine}${gen_attrsLine}
• Logline: ${p.logline || "?"}
• Synopsis: ${p.synopsis || "?"}
• Themes: ${p.themes || "?"}
• Budget: ${p.budget || "?"}
• Team Notes: ${p.teamNotes || "?"}${analysisContext}

${gen_scriptStatusLabel ? `📝 IMPORTANT — SCRIPT STATUS CONTEXT:
The screenplay is "${gen_scriptStatusLabel}". When writing about the project's readiness, use this to your advantage — "Development" stage does NOT mean the script is incomplete. Speak about the screenplay accurately: if polished or locked, describe it as a completed work ready for the next phase. If in progress, describe the creative direction and work remaining. Do NOT default to vague "in development" language that could undersell a finished script.
` : ""}${gen_attrLabels.length > 0 ? `🌟 IMPORTANT — TEAM & THEMATIC ATTRIBUTES:
This project has the following declared eligibility attributes: ${gen_attrLabels.join(", ")}. When the opportunity you're writing for aligns with these attributes (e.g., applying to a Jewish film grant when the team/themes are Jewish, or a women-led grant when the project is women-led), FOREGROUND these authentically in the application. Do not manufacture claims that aren't declared — but do use what IS declared to its full advantage.
` : ""}
${projectFiles.length > 0 ? "ATTACHED MATERIALS: Review the attached files (screenplay, pitch deck, look book, etc.) carefully. Reference SPECIFIC scenes, visuals, characters, or moments from them — not vague summaries. This specificity is what separates winning applications from generic ones." : ""}

${(manualFields && manualFields.length > 0) ? `
🟢🟢🟢 MANUAL FIELD OVERRIDE — AUTHORITATIVE 🟢🟢🟢

The user has provided the exact form field list for this opportunity. You do NOT need to search for or discover the field list — it is given below. Use these fields VERBATIM as the \`formFieldsFound\` array. Do not rename them. Do not add to them. Do not drop any of them. Every field below MUST have corresponding content in your output.

PROVIDED FIELDS:
${manualFields.map((f, i) => `${i + 1}. "${f.fieldName}" — word limit: ${f.wordLimit || "unspecified"}`).join("\n")}

You must still research the opportunity's tone, past recipients, selection criteria, aesthetic preferences, and org mission — the manual override applies ONLY to the field list. Research everything else normally.

Populate \`formFieldsFound\` with one entry per provided field. For each, set \`sourceUrl\` to "user-provided" and \`mappedTo\` based on whether the field matches a standard key (coverLetter/projectStatement/artistStatement/budgetJustification/impactStatement/timeline) or should go to customSections. When in doubt, use customSections.
` : ""}

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

🔴🔴🔴 STEP 1B — THE FORM FIELD LIST (MOST CRITICAL PART OF STEP 1) 🔴🔴🔴

You MUST find the actual list of form fields this application asks for. Not a summary. Not a vibe. The literal list of fields the applicant will see when they open the submission form.

Find it by searching for:
- "[Opportunity name] application guidelines"
- "[Opportunity name] FAQ"
- "[Opportunity name] how to apply"
- "[Opportunity name] submission requirements"
- Links to the application form itself (Submittable, FilmFreeway, Gotham's own portal, etc.)
- Past-year applications screenshots or guidebooks shared by alumni
- Info session recordings or transcripts

Every field you find must be captured with its EXACT NAME AS THE FORM USES IT and the EXACT WORD/CHARACTER LIMIT. If the form calls it "Artistic Statement" do NOT rename it to "Artist Statement." If the limit is "500 words" use "500 words," not "about half a page."

If you CANNOT find the actual field list after diligent searching (and there is no manual override above):
- Do NOT hallucinate one. Do NOT fall back to a generic template.
- Return an empty \`formFieldsFound\` array and explicitly note this in the \`requirements.summary\` field: "Field list could not be confirmed through public research. This draft uses a generic template; the user must verify the actual form requirements before submitting."
- Still flag any external materials and account prerequisites you can identify.

🔴 COMMON FAILURE MODE TO AVOID: Some applications (Gotham Week, Sundance labs, many fellowships) have detailed field lists that live INSIDE a login-gated Submittable or custom portal. The marketing page only shows vague descriptions. If you land on a marketing page that says "submit your project" without field details, KEEP SEARCHING — look for guidelines PDFs, FAQ pages, alumni posts, third-party coverage. Do not settle for the marketing page.

Additional research items beyond field discovery:

- **External materials the user must provide themselves** (artwork, production stills, trailer/sizzle reel, pitch video, letters of recommendation, W9s, budget spreadsheets, work samples, IMDb links, etc.)
- **Account / membership prerequisites** — does this opportunity require the applicant to have an account or active membership with a specific platform? Common examples: Blacklist hosted evaluation, Sundance Institute account, Film Independent membership, FilmFreeway account, Coverfly profile, IMDb Pro listing, WGA registration, Stage 32 membership, Tracking Board, fiscal sponsor affiliation, 501(c)(3) status. Check the applicant's connected accounts list (provided in context) and flag which are met vs. which the applicant needs to create.

Search broadly. Read multiple pages. Do NOT skip this step.

═══════════════════════════════════════════════════════════
STEP 2 — WRITE THE APPLICATION
═══════════════════════════════════════════════════════════
Armed with your research, write each section with these mandates:

▸ **GENERATE CONTENT FOR EVERY FIELD IN formFieldsFound — NO EXCEPTIONS**: The fields you identified in Step 1B are the ground truth of this application. You must produce content for every single one. If \`formFieldsFound\` contains 8 entries, your output must contain 8 pieces of content (distributed across the standard keys and \`customSections\` based on which keys match). If you skip a field, the applicant cannot submit. Before finalizing your response, count your output fields against \`formFieldsFound\` and confirm they match. Do NOT generate boilerplate for generic sections the opportunity did NOT ask for.

▸ **TONE MATCHING**: The voice must match how this specific organization communicates. If they're academic and critical, be academic and critical. If they're activist and urgent, be activist and urgent. If they're literary and meditative, be literary and meditative. If they're industry-insider and commercial, be industry-insider and commercial. Match their register exactly.

▸ **LANGUAGE MIRRORING**: Echo the specific vocabulary and framings the organization uses. If they say "underrepresented voices," use that framing. If they emphasize "craft" or "vision" or "formal innovation" — make those words present.

▸ **RESPECT WORD LIMITS STRICTLY**: Every field in \`formFieldsFound\` has a \`wordLimit\`. You must respect it. For a "25 words max" field, write 20-25 words, never 30. For a "60 words" field, write 55-60. For a "500 words" field, 460-500. Before finalizing each piece of content, COUNT the words and verify it fits. Committees cut long answers without reading them; short answers read as underdeveloped. Hit the target band.

▸ **PRESERVE EXACT FIELD NAMES**: When you identify a field as "Accountability Statement" or "Artistic Statement" or "Director's Vision," use that EXACT name as the \`title\` in \`customSections\` (or match it to the standard key if one applies). Do NOT rename fields to what you think they should be called. The applicant will paste your output into a form with those exact field names; if your titles don't match, they can't use your output.

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

The structure below makes \`formFieldsFound\` + \`customSections\` the PRIMARY output. The legacy standard keys (\`coverLetter\`, \`projectStatement\`, etc.) are CONVENIENCE ALIASES — use them only when the opportunity actually asks for a section with that exact meaning. For anything that doesn't map cleanly, use \`customSections\` with the form's actual field name. When in doubt, use \`customSections\`. Do NOT force-fit unusual fields into the standard keys.

{
  "research": {
    "orgMission": "1-2 sentences on what this organization stands for based on your research",
    "aestheticPrefs": "1-2 sentences on the kinds of projects they historically support",
    "toneVoice": "1-2 sentences describing how the organization itself communicates (formal/activist/literary/commercial/etc.)",
    "keyCriteria": "The top 3-5 things their selection committee likely weighs most heavily, as a bullet list",
    "strategicInsight": "The single most important insight that shaped how this application was written"
  },
  "formFieldsFound": [
    {
      "fieldName": "Exact name as the application form uses it, e.g. 'Accountability Statement' or 'Logline'",
      "wordLimit": "Exact limit as stated, e.g. '25 words' or '500 words' or '1500 characters' or 'unspecified'",
      "description": "1-sentence description of what the field asks for, derived from the application's own language",
      "sourceUrl": "The URL where you found this field's requirements (NOT the opportunity's homepage — the guidelines/FAQ/application page where the field is listed)",
      "mappedTo": "Either a standard key ('coverLetter', 'projectStatement', 'artistStatement', 'budgetJustification', 'impactStatement', 'timeline') OR 'customSections'. If ambiguous, default to customSections."
    }
  ],
  "requirements": {
    "summary": "2-3 sentences describing exactly what this application asks for, based on formFieldsFound. If field discovery failed, say so explicitly here.",
    "standardSectionsNeeded": "Array of standard keys ('coverLetter', 'projectStatement', 'artistStatement', 'budgetJustification', 'impactStatement', 'timeline') that have an exact match in formFieldsFound. Include ONLY keys that appear in at least one formFieldsFound entry's mappedTo value. Return empty array if no standard keys match.",
    "wordLimits": "Object mapping standard section keys to word/character limits, e.g. { 'projectStatement': '500 words' }. Only include keys that both (a) are in standardSectionsNeeded and (b) have explicit limits in formFieldsFound.",
    "additionalInstructions": "Any special formatting or content instructions from the application guidelines"
  },
  "toneStrategy": "2-3 sentences explaining the voice/register/emphasis chosen for this application and WHY it matches this specific opportunity",
  "coverLetter": "Generate only if 'coverLetter' is in standardSectionsNeeded. Otherwise empty string.",
  "projectStatement": "Generate only if 'projectStatement' is in standardSectionsNeeded. Otherwise empty string.",
  "artistStatement": "Generate only if 'artistStatement' is in standardSectionsNeeded. Otherwise empty string.",
  "budgetJustification": "Generate only if 'budgetJustification' is in standardSectionsNeeded. Otherwise empty string.",
  "impactStatement": "Generate only if 'impactStatement' is in standardSectionsNeeded. Otherwise empty string.",
  "timeline": "Generate only if 'timeline' is in standardSectionsNeeded. Otherwise empty string.",
  "customSections": [
    {
      "key": "camelCaseKey (unique identifier derived from fieldName, e.g. 'accountabilityStatement')",
      "title": "The EXACT field name as the application form uses it — do not rephrase or 'clean it up'",
      "wordLimit": "Exact limit as stated in formFieldsFound, e.g. '500 words' or 'unspecified'",
      "content": "The fully written field content, tailored to this opportunity, respecting the word limit strictly"
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

═══════════════════════════════════════════════════════════
FINAL SELF-CHECK BEFORE RETURNING RESPONSE
═══════════════════════════════════════════════════════════

Before returning the JSON, verify:

1. Every entry in \`formFieldsFound\` has a corresponding piece of content somewhere in the output — either in a standard key (if mappedTo is a standard key AND that key is in standardSectionsNeeded) OR in \`customSections\` (if mappedTo is 'customSections'). Count the fields. Count the content pieces. They must match.

2. Every piece of content respects its word limit. Count the words. If over, trim. If far under, expand to the band.

3. Every \`customSections\` entry uses the EXACT field name from the form (not a paraphrase).

4. If \`formFieldsFound\` is empty (discovery failed), the \`requirements.summary\` explicitly says so and you have not hallucinated a generic set of sections.

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
        // Auto-save discovered/overridden fields to the library for reuse on future generations
        if (parsed.formFieldsFound && Array.isArray(parsed.formFieldsFound) && parsed.formFieldsFound.length > 0) {
          // If the user provided manual fields, mark the library entry as verified.
          // Otherwise mark as unverified — user should review and confirm.
          const wasManualOverride = !!(manualFields && manualFields.length > 0);
          saveFieldsToLibrary(o.name, o.organization, parsed.formFieldsFound, wasManualOverride);
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
  // manualFields (optional): array of { fieldName, wordLimit } to override field discovery.
  //   If not provided, the library is checked; if a library entry exists, its fields are used.
  const runRefreshApp = async (appId, mode, manualFields) => {
    const app = appsRef.current.find(a => a.id === appId);
    if (!app || app.status === "submitted") return;

    const allProjects = projectsRef.current;
    const p = allProjects.find(x => x.title === app.projTitle) || allProjects[0];
    if (!p) return;

    // If no manual override passed, check if this opp has a saved library entry
    let effectiveFields = manualFields;
    if (!effectiveFields || effectiveFields.length === 0) {
      const libEntry = getFieldsFromLibrary(app.oppName, app.oppOrg);
      if (libEntry && libEntry.fields && libEntry.fields.length > 0) {
        effectiveFields = libEntry.fields;
      }
    }

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

      // Build script status and eligibility attribute context (used by both regenerate and augment modes)
      const ref_scriptStatusLabel = (SCRIPT_STATUS_OPTIONS.find(opt => opt.key === p.scriptStatus) || {}).label || null;
      const ref_scriptStatusLine = ref_scriptStatusLabel
        ? `\n• Script Status: ${ref_scriptStatusLabel}`
        : "";
      const ref_attrLabels = (p.eligibilityAttributes || [])
        .map(k => ELIGIBILITY_ATTRIBUTES.find(ea => ea.key === k))
        .filter(Boolean)
        .map(ea => ea.label);
      const ref_attrsLine = ref_attrLabels.length > 0
        ? `\n• Eligibility Attributes: ${ref_attrLabels.join(", ")}`
        : "";
      const ref_attributeGuidance = (ref_scriptStatusLabel || ref_attrLabels.length > 0)
        ? `\n${ref_scriptStatusLabel ? `📝 Script Status "${ref_scriptStatusLabel}" — a completed/polished script is READY for labs/competitions, don't undersell with vague "in development" language.\n` : ""}${ref_attrLabels.length > 0 ? `🌟 Declared attributes: ${ref_attrLabels.join(", ")}. Foreground these authentically when the opportunity aligns.\n` : ""}`
        : "";

      // Voice directive — inject if profile has it enabled
      const ref_voiceBlock = (prof.voiceDirectiveEnabled !== false) ? ("\n\n" + VOICE_DIRECTIVE + "\n") : "";

      let textPrompt;
      if (mode === "regenerate") {
        textPrompt = `You are a world-class grant writer and application strategist. Your success rate is extraordinary because you NEVER write generic applications — every submission is meticulously tailored to the specific opportunity's values, voice, aesthetic, and selection criteria.
${ref_voiceBlock}

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
• Stage: ${p.stage}${ref_scriptStatusLine}${ref_attrsLine}
• Logline: ${p.logline || "?"}
• Synopsis: ${p.synopsis || "?"}
• Themes: ${p.themes || "?"}
• Budget: ${p.budget || "?"}
• Team Notes: ${p.teamNotes || "?"}${analysisContext}
${ref_attributeGuidance}
${projectFiles.length > 0 ? "ATTACHED MATERIALS: Review carefully and reference specific scenes, visuals, characters, or moments from them — not vague summaries." : ""}

${(effectiveFields && effectiveFields.length > 0) ? `
🟢🟢🟢 MANUAL FIELD OVERRIDE — AUTHORITATIVE 🟢🟢🟢

The user has provided the exact form field list for this opportunity (either manually or from a saved library entry). You do NOT need to search for or discover the field list. Use these fields VERBATIM as the \`formFieldsFound\` array. Do not rename them. Do not add to them. Do not drop any of them. Every field below MUST have corresponding content in your output.

PROVIDED FIELDS:
${effectiveFields.map((f, i) => `${i + 1}. "${f.fieldName}" — word limit: ${f.wordLimit || "unspecified"}`).join("\n")}

You must still research the opportunity's tone, past recipients, selection criteria, aesthetic preferences, and org mission — the manual override applies ONLY to the field list. Research everything else normally.

Populate \`formFieldsFound\` with one entry per provided field. For each, set \`sourceUrl\` to "user-provided" and \`mappedTo\` based on whether the field matches a standard key (coverLetter/projectStatement/artistStatement/budgetJustification/impactStatement/timeline) or should go to customSections. When in doubt, use customSections.
` : ""}

STEP 1 — RESEARCH (REQUIRED): Use web search to research "${app.oppName}" at "${app.oppOrg}". Find mission, past recipients, aesthetic preferences, tone, and selection criteria.

🔴 STEP 1B — THE FORM FIELD LIST (CRITICAL): You must find the literal list of form fields this application asks for — the exact fields the applicant sees on the submission form. Capture each with its EXACT NAME and EXACT WORD/CHARACTER LIMIT. Search application guidelines, FAQ pages, Submittable/FilmFreeway listings, alumni screenshots, info session recordings. If you cannot find the actual field list, return an empty formFieldsFound array and note this in requirements.summary — do NOT hallucinate a generic template.

STEP 2 — WRITE: Generate content for EVERY field in formFieldsFound — no exceptions. Count fields, count output pieces, confirm they match. Respect every word limit strictly (count words before finalizing). Preserve the exact field names in customSections titles. Do NOT write generic boilerplate sections the opportunity doesn't ask for.

Respond ONLY with JSON (no markdown):
{
  "research": {
    "orgMission": "1-2 sentences on what this org stands for",
    "aestheticPrefs": "1-2 sentences on what they historically support",
    "toneVoice": "1-2 sentences on how the org communicates",
    "keyCriteria": "Top 3-5 things their committee weighs, as bullets",
    "strategicInsight": "The single most important insight shaping this application"
  },
  "formFieldsFound": [
    {
      "fieldName": "Exact name as the form uses it",
      "wordLimit": "Exact limit, e.g. '500 words' or 'unspecified'",
      "description": "1-sentence description of what the field asks for",
      "sourceUrl": "URL where this field was found (NOT the opportunity homepage)",
      "mappedTo": "Standard key ('coverLetter','projectStatement','artistStatement','budgetJustification','impactStatement','timeline') or 'customSections'"
    }
  ],
  "requirements": {
    "summary": "2-3 sentences describing exactly what this application asks for. If field discovery failed, say so explicitly.",
    "standardSectionsNeeded": "Array of standard keys that appear in at least one formFieldsFound entry's mappedTo. Empty array if none.",
    "wordLimits": "Object mapping standard section keys to limits (only keys in standardSectionsNeeded with explicit limits)",
    "additionalInstructions": "Any special formatting/content notes"
  },
  "toneStrategy": "2-3 sentences on the voice/emphasis chosen for this app and WHY",
  "coverLetter": "Only if in standardSectionsNeeded, else empty string",
  "projectStatement": "Only if in standardSectionsNeeded, else empty string",
  "artistStatement": "Only if in standardSectionsNeeded, else empty string",
  "budgetJustification": "Only if in standardSectionsNeeded, else empty string",
  "impactStatement": "Only if in standardSectionsNeeded, else empty string",
  "timeline": "Only if in standardSectionsNeeded, else empty string",
  "customSections": [
    { "key": "camelCaseKey", "title": "EXACT field name from form", "wordLimit": "...", "content": "..." }
  ],
  "externalMaterials": [
    { "name": "...", "requirement": "...", "note": "...", "critical": true }
  ],
  "accountsRequired": [
    { "name": "Platform name", "reason": "Why needed", "url": "direct link", "alreadyMet": false, "matchedAccount": "" }
  ],
  "strategicNotes": "Internal bullet points: angle chosen, what was emphasized, risks, personalization suggestions, reminder to gather external materials."
}

FINAL SELF-CHECK: Before returning, verify every formFieldsFound entry has corresponding content, every content piece respects its word limit, and every customSections title uses the exact form field name.`;
      } else {
        // Augment mode: surgical update preserving tone and user edits
        textPrompt = `You are a world-class grant writer reviewing an existing application draft against UPDATED project intelligence. The team has new information (new collaborator attached, updated budget, revised script, new credits, etc.). You must decide what — if anything — in the application should be updated.
${ref_voiceBlock}

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
• Format: ${p.format} · Genre: ${p.genre || "?"} · Stage: ${p.stage}${ref_scriptStatusLine}${ref_attrsLine}
• Logline: ${p.logline || "?"}
• Synopsis: ${p.synopsis || "?"}
• Themes: ${p.themes || "?"}
• Team Notes: ${p.teamNotes || "?"}${analysisContext}
${ref_attributeGuidance}
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

Respond ONLY with JSON (no markdown):
{
  "research": {
    "orgMission": "Updated understanding of the org's mission",
    "aestheticPrefs": "What they support",
    "toneVoice": "How they communicate",
    "keyCriteria": "Top 3-5 committee priorities",
    "strategicInsight": "Key insight that guided this refresh"
  },
  "formFieldsFound": "Preserve existing formFieldsFound array from the draft unchanged, unless your re-research reveals the form's field list has materially changed. If changed, return the updated list with the same schema: { fieldName, wordLimit, description, sourceUrl, mappedTo }.",
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
  "budgetJustification": "Preserve or update — only if in standardSectionsNeeded",
  "impactStatement": "Preserve or update — only if in standardSectionsNeeded",
  "timeline": "Preserve or update — only if in standardSectionsNeeded",
  "customSections": "Preserve existing custom sections with updated content where needed. Titles must remain exact matches to form field names.",
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
          // Copy over any fields that came back, including research + toneStrategy + formFieldsFound
          ["projectStatement", "artistStatement", "budgetJustification", "impactStatement", "timeline", "coverLetter", "strategicNotes", "research", "toneStrategy", "requirements", "formFieldsFound", "customSections", "externalMaterials", "accountsRequired"].forEach(k => {
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
    // Prefer the verified actualDeadline from Pass 2 over the claimed one from Pass 1
    const avail = o.verification?.availabilityGate || o.verification?.deadlineGate;
    const effectiveDeadline = (avail && avail.actualDeadline) || o.deadline;
    const pd = parseDate(effectiveDeadline);
    const dl = daysLeft(pd);
    const ug = urgency(dl);
    const matchingApp = apps.find(a => a.oppName === o.name);
    const appSt = matchingApp ? matchingApp.status : null;
    return { ...o, pd, dl, ug, appSt, effectiveDeadline };
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
            rejectedOpps={rejectedOpps}
            rejectOpportunity={rejectOpportunity}
            unrejectOpportunity={unrejectOpportunity}
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
            saveOpps={sOpps}
            pay={pay}
            jobs={jobs}
            runGenerate={runGenerate}
            dismissJob={dismissJob}
            runRefreshApp={runRefreshApp}
            runAuditDrafts={runAuditDrafts}
            findSiblingTracks={findSiblingTracks}
            fieldLibrary={fieldLibrary}
            getFieldsFromLibrary={getFieldsFromLibrary}
            saveFieldsToLibrary={saveFieldsToLibrary}
            deleteFieldLibraryEntry={deleteFieldLibraryEntry}
            updateFieldLibraryNotes={updateFieldLibraryNotes}
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
    scriptStatus: "",  // Optional: where the script itself is, independent of production stage
    budget: "",
    runtime: "",
    targetAudience: "",
    themes: "",
    teamNotes: "",
    eligibilityAttributes: []  // array of stable keys like "bipoc-team", "jewish-themes", etc.
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
            {/* Script Status — optional, distinguishes where the script itself is */}
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={LS}>Script Status (Optional)</label>
              <p style={{ fontSize: "11px", color: C.tm, lineHeight: 1.5, marginBottom: "8px" }}>
                Where is the screenplay itself? Helps discovery and audit tell the difference between "project in development" (could mean many things) and "script is done and ready to submit."
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {SCRIPT_STATUS_OPTIONS.map(opt => {
                  const selected = form.scriptStatus === opt.key;
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setForm({
                        ...form,
                        scriptStatus: selected ? "" : opt.key  // toggle off if clicking same one
                      })}
                      style={{
                        fontFamily: FN.m,
                        fontSize: "12px",
                        padding: "5px 10px",
                        borderRadius: "14px",
                        border: "1px solid " + (selected ? C.ac : C.bd),
                        background: selected ? C.ac + "20" : "transparent",
                        color: selected ? C.ac : C.tm,
                        cursor: "pointer",
                        transition: "all 0.15s"
                      }}
                    >
                      {selected ? "✓ " : ""}{opt.label}
                    </button>
                  );
                })}
              </div>
              <p style={{ fontSize: "11px", color: C.td, marginTop: "6px", fontStyle: "italic" }}>
                Leave blank if this doesn't apply (e.g. documentary, non-script-based project). Click again to deselect.
              </p>
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

            {/* Eligibility Attributes — used by discovery verification to filter demographic/thematic grants */}
            <div style={{ gridColumn: "1 / -1", marginTop: "4px" }}>
              <label style={LS}>Eligibility Attributes (Optional)</label>
              <p style={{ fontSize: "11px", color: C.tm, lineHeight: 1.5, marginBottom: "10px" }}>
                Help discovery find grants that fund teams or stories like this one, and filter out ones that require attributes you don't have. Leave blank if none apply.
              </p>
              {(() => {
                const attrs = form.eligibilityAttributes || [];
                const toggle = (key) => {
                  const current = form.eligibilityAttributes || [];
                  const updated = current.includes(key)
                    ? current.filter(k => k !== key)
                    : [...current, key];
                  setForm({ ...form, eligibilityAttributes: updated });
                };
                const teamAttrs = ELIGIBILITY_ATTRIBUTES.filter(a => a.group === "team");
                const themeAttrs = ELIGIBILITY_ATTRIBUTES.filter(a => a.group === "themes");
                const renderGroup = (label, group) => (
                  <div style={{ marginBottom: "12px" }}>
                    <p style={{
                      fontFamily: FN.m,
                      fontSize: "10px",
                      color: C.td,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      marginBottom: "6px"
                    }}>{label}</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      {group.map(a => {
                        const on = attrs.includes(a.key);
                        return (
                          <button
                            key={a.key}
                            type="button"
                            onClick={() => toggle(a.key)}
                            style={{
                              fontFamily: FN.m,
                              fontSize: "12px",
                              padding: "5px 10px",
                              borderRadius: "14px",
                              border: "1px solid " + (on ? C.ac : C.bd),
                              background: on ? C.ac + "20" : "transparent",
                              color: on ? C.ac : C.tm,
                              cursor: "pointer",
                              transition: "all 0.15s"
                            }}
                          >
                            {on ? "✓ " : ""}{a.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
                return (
                  <div>
                    {renderGroup("Team includes", teamAttrs)}
                    {renderGroup("Project involves", themeAttrs)}
                  </div>
                );
              })()}
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
                    {p.scriptStatus && (() => {
                      const label = (SCRIPT_STATUS_OPTIONS.find(o => o.key === p.scriptStatus) || {}).label;
                      return label ? <Bdg color={C.tl}>📝 {label}</Bdg> : null;
                    })()}
                    {Array.isArray(p.eligibilityAttributes) && p.eligibilityAttributes.length > 0 && (
                      <Bdg color={C.ac}>🌟 {p.eligibilityAttributes.length} attr{p.eligibilityAttributes.length === 1 ? "" : "s"}</Bdg>
                    )}
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
  searchError, setSearchError,
  rejectedOpps, rejectOpportunity, unrejectOpportunity
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

  // Manage-rejections modal state
  const [manageRejMdl, setManageRejMdl] = useState(false);

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
          {(() => {
            const verified = results.filter(r => r.verification?.overallVerdict === "verified").length;
            const uncertain = results.filter(r => r.verification?.overallVerdict === "uncertain").length;
            const pending = results.filter(r => r.verification?.overallVerdict === "pending").length;
            const unverified = results.filter(r => !r.verification).length;
            const parts = [];
            if (verified > 0) parts.push({ color: C.ok, text: verified + " verified" });
            if (uncertain > 0) parts.push({ color: C.wn, text: uncertain + " uncertain" });
            if (pending > 0) parts.push({ color: C.tl, text: pending + " verifying" });
            if (unverified > 0) parts.push({ color: C.tm, text: unverified + " unverified" });
            const rejectedCount = (rejectedOpps || []).length;
            return (
              <div style={{ marginBottom: "14px" }}>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "12px",
                  flexWrap: "wrap"
                }}>
                  <div>
                    <p style={{
                      fontFamily: FN.m,
                      fontSize: "11px",
                      color: C.td,
                      marginBottom: "4px"
                    }}>{results.length} FOUND · SORTED BY VERIFICATION + MATCH</p>
                    {parts.length > 0 && (
                      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", fontSize: "11px", fontFamily: FN.m }}>
                        {parts.map((p, i) => (
                          <span key={i} style={{ color: p.color }}>● {p.text}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  {rejectedCount > 0 && (
                    <button
                      type="button"
                      onClick={() => setManageRejMdl(true)}
                      style={{
                        background: "transparent",
                        border: "1px solid " + C.bd,
                        borderRadius: "4px",
                        padding: "4px 10px",
                        fontSize: "11px",
                        fontFamily: FN.m,
                        color: C.tm,
                        cursor: "pointer"
                      }}
                      title="Manage rejected opportunities"
                    >
                      {rejectedCount} rejected · Manage
                    </button>
                  )}
                </div>
              </div>
            );
          })()}
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
                      {o.verification && o.verification.overallVerdict === "verified" && (
                        <Bdg color={C.ok}>✓ VERIFIED</Bdg>
                      )}
                      {o.verification && o.verification.overallVerdict === "uncertain" && (
                        <Bdg color={C.wn}>⚠ VERIFY</Bdg>
                      )}
                      {o.verification && o.verification.overallVerdict === "pending" && (
                        <Bdg color={C.tl}>⏳ VERIFYING</Bdg>
                      )}
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
                    <Btn
                      variant="ghost"
                      small
                      onClick={() => {
                        if (rejectOpportunity) {
                          rejectOpportunity(o.name, o.organization, "User rejected from discovery");
                          // Also remove from current results so it disappears immediately
                          if (setSearchResults) {
                            setSearchResults(searchResults.filter(r =>
                              !((r.name || "").toLowerCase().trim() === (o.name || "").toLowerCase().trim() &&
                                (r.organization || "").toLowerCase().trim() === (o.organization || "").toLowerCase().trim())
                            ));
                          }
                        }
                      }}
                      style={{ color: C.dn }}
                      title="Don't show this again"
                    >✕</Btn>
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
                {o.verification && o.verification.overallVerdict !== "pending" && (() => {
                  const v = o.verification;
                  // Normalize legacy field name: old audits used deadlineGate, new use availabilityGate
                  const availKey = v.availabilityGate ? "availabilityGate" : (v.deadlineGate ? "deadlineGate" : "availabilityGate");
                  const gates = [
                    { key: "stageGate", label: "Stage", icon: "🎬" },
                    { key: "genreGate", label: "Genre / Format", icon: "🎭" },
                    { key: "demographicGate", label: "Demographic / Thematic", icon: "👥" },
                    { key: availKey, label: "Availability", icon: "📅" },
                    { key: "serviceFitGate", label: "Service Fit", icon: "🎯" }
                  ].filter(g => v[g.key]); // skip nulls
                  const isOk = v.overallVerdict === "verified";
                  const borderCol = isOk ? C.ok : (v.overallVerdict === "uncertain" ? C.wn : C.dn);
                  return (
                    <details style={{
                      background: borderCol + "08",
                      border: "1px solid " + borderCol + "30",
                      borderRadius: "6px",
                      padding: "8px 12px",
                      marginBottom: "10px"
                    }}>
                      <summary style={{
                        fontSize: "11px",
                        fontFamily: FN.m,
                        color: borderCol,
                        cursor: "pointer",
                        letterSpacing: "0.04em"
                      }}>
                        {isOk ? "✓ ELIGIBILITY VERIFIED" :
                          v.overallVerdict === "uncertain" ? "⚠ ELIGIBILITY UNCERTAIN — review evidence" :
                          "✗ ELIGIBILITY FAILED"} — click to see evidence
                      </summary>
                      <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "10px" }}>
                        {gates.map(g => {
                          const gate = v[g.key];
                          const vc = gate.verdict === "pass" ? C.ok : gate.verdict === "fail" ? C.dn : C.wn;
                          const vsym = gate.verdict === "pass" ? "✓" : gate.verdict === "fail" ? "✗" : "⚠";
                          return (
                            <div key={g.key} style={{
                              padding: "8px 10px",
                              background: C.bg,
                              borderLeft: "3px solid " + vc,
                              borderRadius: "3px"
                            }}>
                              <p style={{
                                fontFamily: FN.m,
                                fontSize: "11px",
                                color: vc,
                                marginBottom: "4px",
                                letterSpacing: "0.04em"
                              }}>
                                {vsym} {g.label.toUpperCase()}: {(gate.verdict || "").toUpperCase()}
                              </p>
                              {gate._jsStatus && (
                                <p style={{
                                  fontFamily: FN.m,
                                  fontSize: "10px",
                                  color: C.tm,
                                  marginBottom: "4px"
                                }}>
                                  JS date check: {gate._jsStatus}
                                </p>
                              )}
                              {gate.evidence && (
                                <p style={{ fontSize: "12px", color: C.tx, lineHeight: 1.5, marginBottom: "4px" }}>
                                  {gate.evidence}
                                </p>
                              )}
                              {gate.concern && (
                                <p style={{ fontSize: "11px", color: C.tm, lineHeight: 1.5, marginBottom: "4px", fontStyle: "italic" }}>
                                  {gate.concern}
                                </p>
                              )}
                              {gate.sourceUrl && (
                                <a href={gate.sourceUrl} target="_blank" rel="noopener noreferrer" style={{
                                  color: C.tl,
                                  fontSize: "10px",
                                  fontFamily: FN.m,
                                  wordBreak: "break-all"
                                }}>source: {gate.sourceUrl}</a>
                              )}
                            </div>
                          );
                        })}
                        {v.error && (
                          <p style={{ fontSize: "11px", color: C.dn, fontStyle: "italic" }}>
                            Verification error: {v.error}
                          </p>
                        )}
                      </div>
                    </details>
                  );
                })()}
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
                    <strong style={{ color: C.tx }}>Deadline:</strong> {(() => {
                      // Prefer verified actualDeadline from Pass 2 availability gate.
                      // Falls back through legacy deadlineGate and finally the claimed deadline from Pass 1.
                      const v = o.verification;
                      const avail = v?.availabilityGate || v?.deadlineGate;
                      if (avail && avail.actualDeadline) return avail.actualDeadline;
                      return o.deadline || "unspecified";
                    })()}
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

      {/* MANAGE REJECTED OPPORTUNITIES MODAL */}
      <Mdl
        open={manageRejMdl}
        onClose={() => setManageRejMdl(false)}
        title="Rejected Opportunities"
        width="600px"
      >
        <div>
          <p style={{ fontSize: "13px", color: C.tm, lineHeight: 1.6, marginBottom: "16px" }}>
            These opportunities won't appear in discovery for any project. Click Undo to allow them to re-surface.
          </p>
          {(!rejectedOpps || rejectedOpps.length === 0) ? (
            <p style={{
              padding: "16px",
              background: C.bg,
              border: "1px solid " + C.bd,
              borderRadius: "6px",
              fontSize: "13px",
              color: C.tm,
              textAlign: "center"
            }}>
              No rejected opportunities.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
              {rejectedOpps.map((r, i) => (
                <div key={i} style={{
                  padding: "10px 12px",
                  background: C.bg,
                  border: "1px solid " + C.bd,
                  borderRadius: "6px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "10px",
                  flexWrap: "wrap"
                }}>
                  <div style={{ flex: 1, minWidth: "200px" }}>
                    <p style={{ fontSize: "13px", color: C.tx, marginBottom: "2px" }}>
                      {r.name}
                    </p>
                    <p style={{ fontSize: "11px", color: C.tm, fontFamily: FN.m }}>
                      {r.organization}
                      {r.rejectedAt && " · rejected " + new Date(r.rejectedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Btn
                    variant="ghost"
                    small
                    onClick={() => {
                      if (unrejectOpportunity) {
                        unrejectOpportunity(r.name, r.organization);
                      }
                    }}
                  >
                    ↶ Undo
                  </Btn>
                </div>
              ))}
            </div>
          )}
          <div style={{
            display: "flex",
            justifyContent: "flex-end",
            paddingTop: "12px",
            borderTop: "1px solid " + C.bd
          }}>
            <Btn variant="secondary" onClick={() => setManageRejMdl(false)}>Close</Btn>
          </div>
        </div>
      </Mdl>
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

function AppsView({ profile, projects, opps, apps, save, saveOpps, pay, jobs, runGenerate, dismissJob, runRefreshApp, runAuditDrafts, findSiblingTracks, fieldLibrary, getFieldsFromLibrary, saveFieldsToLibrary, deleteFieldLibraryEntry, updateFieldLibraryNotes }) {
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
  // Manual field override — for when user has the actual form field list in hand.
  // manualText holds the pending/current field list as textarea-format string.
  // When populated (from library auto-load or modal edit), it gets passed to the
  // generate call so the engine uses these exact fields.
  const [manualText, setManualText] = useState("");
  // Edit Structure modal (replaces the inline editor)
  const [structureMdl, setStructureMdl] = useState(null); // holds opp index when open
  const [structureFile, setStructureFile] = useState(null); // { name, mediaType, data, size }
  const [structureExtracting, setStructureExtracting] = useState(false);
  const [structureExtractError, setStructureExtractError] = useState(null);
  // When set, saving the Edit Structure modal also triggers regenerate on this app.
  // Used by the "Edit structure & regenerate" flow from the draft detail view.
  const [structureRegenerateAppId, setStructureRegenerateAppId] = useState(null);

  // AUDIT state — verifies eligibility of all draft/approved apps against their projects.
  // auditStep: "idle" (nothing running, no results) | "confirm" (confirmation modal) |
  //            "running" (audit in progress) | "done" (showing results)
  const [auditStep, setAuditStep] = useState("idle");
  const [auditProgress, setAuditProgress] = useState({ done: 0, total: 0 });
  const [auditResults, setAuditResults] = useState([]);
  const [auditCancelFn, setAuditCancelFn] = useState(null);

  // Sibling tracks modal — shown when user clicks "Find right track" on a failed audit result.
  // Contains the loading state, results, and lets user save sibling tracks directly to opps.
  // Structure: { appId, oppName, oppOrg, projTitle, loading: bool, tracks: [...], error: string|null }
  const [siblingMdl, setSiblingMdl] = useState(null);

  // Parse manual field text into array of { fieldName, wordLimit }
  // Format: one field per line, "Field Name | word limit" (pipe-separated)
  // Lines without a pipe treat the whole line as fieldName with unspecified limit
  // Empty lines and lines starting with # are ignored
  const parseManualFields = (text) => {
    if (!text || !text.trim()) return [];
    return text
      .split("\n")
      .map(line => line.trim())
      .filter(line => line && !line.startsWith("#"))
      .map(line => {
        const pipeIdx = line.indexOf("|");
        if (pipeIdx === -1) {
          return { fieldName: line.trim(), wordLimit: "unspecified" };
        }
        return {
          fieldName: line.slice(0, pipeIdx).trim(),
          wordLimit: line.slice(pipeIdx + 1).trim() || "unspecified"
        };
      })
      .filter(f => f.fieldName);
  };

  // Serialize saved library fields back into textarea format for the manual override UI
  const serializeFields = (fields) => {
    if (!Array.isArray(fields)) return "";
    return fields
      .map(f => (f.wordLimit && f.wordLimit !== "unspecified")
        ? `${f.fieldName} | ${f.wordLimit}`
        : f.fieldName)
      .join("\n");
  };

  // Look up the saved library entry for the currently selected opportunity.
  // Read directly from the fieldLibrary prop (not via getFieldsFromLibrary which
  // reads from a ref) so the UI updates reactively when the library changes.
  const selectedOpp = selO !== null ? opps[selO] : null;
  const libraryEntry = (() => {
    if (!selectedOpp) return null;
    const key = ((selectedOpp.name || "").toLowerCase().trim().replace(/\s+/g, " ") +
                 "|" +
                 (selectedOpp.organization || "").toLowerCase().trim().replace(/\s+/g, " "));
    return (fieldLibrary && fieldLibrary[key]) || null;
  })();

  // When selected opp changes, auto-populate manualText from the library entry
  // (if one exists). This keeps manualText in sync with the known fields for
  // the selected opportunity, so Generate can use them without requiring the
  // user to open the Edit Structure modal.
  useEffect(() => {
    if (selO === null) {
      setManualText("");
      return;
    }
    if (libraryEntry && libraryEntry.fields && libraryEntry.fields.length > 0) {
      setManualText(serializeFields(libraryEntry.fields));
    } else {
      setManualText("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selO]);

  // Reset opportunity selection when project changes (available list shifts).
  // The selO-change effect handles clearing manualText.
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
    const parsed = parseManualFields(manualText);
    // If manualText has parsed fields, pass them through as the authoritative
    // field list. Otherwise let the engine auto-discover.
    const manualFields = parsed.length > 0 ? parsed : [];
    runGenerate(selO, selP, manualFields.length > 0 ? manualFields : undefined);
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

  const structureMdlJsx = (
      <Mdl
        open={structureMdl !== null}
        onClose={() => {
          // Same behavior as Cancel: revert manualText to the library entry (if any)
          // so abandoned edits don't persist.
          if (structureMdl !== null && opps[structureMdl]) {
            const o = opps[structureMdl];
            const k = ((o.name || "").toLowerCase().trim().replace(/\s+/g, " ") +
                       "|" +
                       (o.organization || "").toLowerCase().trim().replace(/\s+/g, " "));
            const existing = fieldLibrary && fieldLibrary[k];
            if (existing && existing.fields && existing.fields.length > 0) {
              setManualText(serializeFields(existing.fields));
            } else {
              setManualText("");
            }
          }
          setStructureRegenerateAppId(null);
          setStructureMdl(null);
          setStructureFile(null);
          setStructureExtractError(null);
          setStructureExtracting(false);
        }}
        title={structureMdl !== null && opps[structureMdl]
          ? "Edit Structure: " + opps[structureMdl].name
          : "Edit Structure"}
        width="640px"
      >
        {structureMdl !== null && opps[structureMdl] && (() => {
          const modalOpp = opps[structureMdl];
          const modalParsed = parseManualFields(manualText);
          // Read library directly from prop for reactive updates
          const modalKey = ((modalOpp.name || "").toLowerCase().trim().replace(/\s+/g, " ") +
                            "|" +
                            (modalOpp.organization || "").toLowerCase().trim().replace(/\s+/g, " "));
          const modalExistingLib = (fieldLibrary && fieldLibrary[modalKey]) || null;
          const modalHasExisting = !!(modalExistingLib && modalExistingLib.fields && modalExistingLib.fields.length > 0);

          // File reader helper
          const handleFileSelect = async (file) => {
            if (!file) return;
            setStructureExtractError(null);
            // Validate size and type
            if (file.size > 10 * 1024 * 1024) {
              setStructureExtractError("File is too large (max 10MB). Compress the image or PDF and try again.");
              return;
            }
            const allowed = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif", "application/pdf"];
            if (!allowed.includes(file.type)) {
              setStructureExtractError("Unsupported file type. Use PNG, JPG, WEBP, GIF, or PDF.");
              return;
            }
            try {
              const reader = new FileReader();
              reader.onload = () => {
                const result = reader.result;
                const base64 = result.split(",")[1];
                setStructureFile({
                  name: file.name,
                  mediaType: file.type,
                  size: file.size,
                  data: base64
                });
              };
              reader.onerror = () => {
                setStructureExtractError("Failed to read the file. Try again.");
              };
              reader.readAsDataURL(file);
            } catch (err) {
              setStructureExtractError("Failed to read the file: " + (err.message || "unknown error"));
            }
          };

          // Extraction call — sends the file to Claude and asks for fields only
          const extractFields = async () => {
            if (!structureFile) return;
            setStructureExtracting(true);
            setStructureExtractError(null);
            try {
              const extractionPrompt = `You are looking at a screenshot or PDF of an application form for "${modalOpp.name}" at "${modalOpp.organization}".

Your ONLY task is to extract the list of form fields the applicant must fill out. Do not write any content. Do not research the opportunity. Just read the form and list its fields.

For each field you see in the form, extract:
- The EXACT field name as it appears (e.g. "Logline", "Project Summary", "Artistic Statement")
- The word or character limit, if specified (e.g. "25 words", "500 characters", "2 pages")
- If no limit is shown, use "unspecified"

Return ONLY JSON in this exact format, no markdown, no commentary:
{
  "fields": [
    { "fieldName": "...", "wordLimit": "..." },
    { "fieldName": "...", "wordLimit": "..." }
  ]
}

If you cannot see any fields clearly, return: { "fields": [] }

Be thorough — every distinct input the applicant must complete is a field. Include short fields (logline), long fields (synopsis, statement), and numeric/date fields if visible. Do NOT include things that are not user input: instructions, page headers, section dividers, submit buttons.`;

              const content = [
                { type: "text", text: extractionPrompt }
              ];
              if (structureFile.mediaType === "application/pdf") {
                content.push({
                  type: "document",
                  source: { type: "base64", media_type: "application/pdf", data: structureFile.data }
                });
              } else {
                content.push({
                  type: "image",
                  source: { type: "base64", media_type: structureFile.mediaType, data: structureFile.data }
                });
              }

              const response = await askClaude(content, false);
              const parsed = extractJSON(response);
              if (!parsed || !Array.isArray(parsed.fields)) {
                setStructureExtractError("Couldn't read the file — the AI didn't return valid field data. Try a clearer screenshot or paste the fields manually.");
                return;
              }
              if (parsed.fields.length === 0) {
                setStructureExtractError("No fields detected in the file. Try a clearer screenshot of the actual form fields, or paste the fields manually.");
                return;
              }
              // Populate textarea with extracted fields (merge into any existing text: replace)
              setManualText(serializeFields(parsed.fields));
            } catch (err) {
              setStructureExtractError("Extraction failed: " + (err.message || "unknown error"));
            } finally {
              setStructureExtracting(false);
            }
          };

          const handleSave = () => {
            if (modalParsed.length === 0) return;
            saveFieldsToLibrary(modalOpp.name, modalOpp.organization, modalParsed, true);
            // If this modal was opened via "Edit structure & regenerate" from a draft
            // detail view, trigger regenerate on that app now that the structure is saved.
            const regenAppId = structureRegenerateAppId;
            setStructureRegenerateAppId(null);
            setStructureMdl(null);
            setStructureFile(null);
            setStructureExtractError(null);
            if (regenAppId) {
              // Pass the fields explicitly so the refresh prompt uses them immediately
              // (library lookup would also work, but explicit is deterministic).
              runRefreshApp(regenAppId, "regenerate", modalParsed);
            }
          };

          // Cancel: revert manualText to the library state (or empty) so abandoned
          // edits don't persist into the Generate card or the next modal open.
          const handleCancel = () => {
            if (modalHasExisting) {
              setManualText(serializeFields(modalExistingLib.fields));
            } else {
              setManualText("");
            }
            setStructureRegenerateAppId(null);
            setStructureMdl(null);
            setStructureFile(null);
            setStructureExtractError(null);
          };

          const handleClear = () => {
            if (!modalHasExisting) return;
            if (confirm("Clear the saved structure for " + modalOpp.name + "? The engine will re-research from scratch next time.")) {
              deleteFieldLibraryEntry(modalOpp.name, modalOpp.organization);
              setManualText("");
              setStructureFile(null);
              setStructureRegenerateAppId(null);
              setStructureMdl(null);
            }
          };

          return (
            <div>
              {structureRegenerateAppId && (
                <div style={{
                  padding: "10px 12px",
                  background: C.tl + "15",
                  border: "1px solid " + C.tl + "40",
                  borderRadius: "6px",
                  marginBottom: "16px",
                  fontSize: "12px",
                  color: C.tx,
                  fontFamily: FN.m
                }}>
                  ↻ Edit & regenerate mode — saving the structure will immediately kick off a fresh draft using these fields.
                </div>
              )}
              <p style={{ fontSize: "12px", color: C.tm, lineHeight: 1.6, marginBottom: "20px" }}>
                Tell the engine exactly what fields this application requires. You can paste the field list directly, or upload a screenshot/PDF of the form and let the engine extract the fields automatically.
              </p>

              {/* === Section A: Upload === */}
              <div style={{ marginBottom: "20px" }}>
                <p style={{ ...LS, marginBottom: "8px" }}>UPLOAD SCREENSHOT OR PDF</p>
                <p style={{ fontSize: "12px", color: C.tm, marginBottom: "10px", lineHeight: 1.5 }}>
                  Take a screenshot of the application form (or save it as PDF) and drop it here. The engine will read it and extract the fields.
                </p>

                {!structureFile && (
                  <label style={{
                    display: "inline-block",
                    padding: "10px 16px",
                    background: C.bd + "30",
                    border: "1px dashed " + C.bd,
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontFamily: FN.m,
                    color: C.tx,
                    transition: "all 0.15s"
                  }}>
                    📎 Choose file
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,application/pdf"
                      onChange={e => handleFileSelect(e.target.files?.[0])}
                      style={{ display: "none" }}
                    />
                  </label>
                )}

                {structureFile && (
                  <div style={{
                    padding: "10px 12px",
                    background: C.bg,
                    border: "1px solid " + C.bd,
                    borderRadius: "6px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "10px",
                    flexWrap: "wrap"
                  }}>
                    <div style={{ flex: 1, minWidth: "180px" }}>
                      <p style={{ fontSize: "13px", color: C.tx, fontFamily: FN.m, marginBottom: "2px" }}>
                        📄 {structureFile.name}
                      </p>
                      <p style={{ fontSize: "11px", color: C.tm }}>
                        {(structureFile.size / 1024).toFixed(0)} KB · {structureFile.mediaType}
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <Btn
                        variant="primary"
                        small
                        onClick={extractFields}
                        disabled={structureExtracting}
                      >
                        {structureExtracting ? "⏳ Extracting…" : "✨ Extract fields"}
                      </Btn>
                      <Btn
                        variant="ghost"
                        small
                        onClick={() => {
                          setStructureFile(null);
                          setStructureExtractError(null);
                        }}
                        disabled={structureExtracting}
                      >
                        Remove
                      </Btn>
                    </div>
                  </div>
                )}

                {structureExtractError && (
                  <p style={{
                    fontSize: "12px",
                    color: C.dn,
                    marginTop: "8px",
                    padding: "8px 10px",
                    background: C.dn + "12",
                    border: "1px solid " + C.dn + "40",
                    borderRadius: "4px"
                  }}>
                    {structureExtractError}
                  </p>
                )}
              </div>

              {/* === Divider === */}
              <div style={{
                textAlign: "center",
                margin: "20px 0",
                position: "relative"
              }}>
                <span style={{
                  fontFamily: FN.m,
                  fontSize: "11px",
                  color: C.td,
                  letterSpacing: "0.08em",
                  background: C.sf,
                  padding: "0 12px",
                  position: "relative",
                  zIndex: 1
                }}>OR PASTE DIRECTLY</span>
                <div style={{
                  position: "absolute",
                  top: "50%",
                  left: 0,
                  right: 0,
                  height: "1px",
                  background: C.bd,
                  zIndex: 0
                }} />
              </div>

              {/* === Section B: Paste === */}
              <div style={{ marginBottom: "16px" }}>
                <p style={{ ...LS, marginBottom: "8px" }}>FIELD LIST</p>
                <p style={{ fontSize: "12px", color: C.tm, marginBottom: "8px", lineHeight: 1.5 }}>
                  One field per line. Format: <code style={{ fontFamily: FN.m, background: C.bd + "30", padding: "1px 5px", borderRadius: "3px", color: C.tx }}>Field Name | word limit</code>. Lines without a pipe treat the whole line as the field name.
                </p>
                <details style={{ marginBottom: "10px" }}>
                  <summary style={{ fontSize: "11px", color: C.tm, cursor: "pointer", fontFamily: FN.m }}>
                    Show example
                  </summary>
                  <pre style={{
                    fontSize: "11px",
                    color: C.tm,
                    fontFamily: FN.m,
                    background: C.bd + "15",
                    padding: "8px 10px",
                    borderRadius: "4px",
                    marginTop: "6px",
                    whiteSpace: "pre-wrap"
                  }}>{`Logline | 25 words
Synopsis | 60 words
Summary | 500 words
Artistic Statement | 500 words`}</pre>
                </details>
                <textarea
                  value={manualText}
                  onChange={e => setManualText(e.target.value)}
                  placeholder="Logline | 25 words&#10;Synopsis | 60 words&#10;Artistic Statement | 500 words"
                  rows={10}
                  style={{
                    width: "100%",
                    fontFamily: FN.m,
                    fontSize: "13px",
                    padding: "10px 12px",
                    border: "1px solid " + C.bd,
                    borderRadius: "4px",
                    background: C.bg,
                    color: C.tx,
                    resize: "vertical"
                  }}
                />
                <div style={{ marginTop: "8px", minHeight: "18px" }}>
                  {modalParsed.length > 0 && (
                    <p style={{ fontSize: "12px", color: C.ac, fontFamily: FN.m }}>
                      ✓ {modalParsed.length} field{modalParsed.length === 1 ? "" : "s"} detected
                    </p>
                  )}
                  {manualText.trim() && modalParsed.length === 0 && (
                    <p style={{ fontSize: "12px", color: C.wn, fontFamily: FN.m }}>
                      ⚠ No fields detected — check the format
                    </p>
                  )}
                </div>
              </div>

              {/* === Footer actions === */}
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "10px",
                flexWrap: "wrap",
                paddingTop: "12px",
                borderTop: "1px solid " + C.bd
              }}>
                <div>
                  {modalHasExisting && (
                    <Btn variant="ghost" small onClick={handleClear}>
                      🗑 Clear saved structure
                    </Btn>
                  )}
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <Btn
                    variant="secondary"
                    onClick={handleCancel}
                  >
                    Cancel
                  </Btn>
                  <Btn
                    variant="primary"
                    onClick={handleSave}
                    disabled={modalParsed.length === 0}
                  >
                    {structureRegenerateAppId
                      ? "💾 Save & Regenerate"
                      : (modalHasExisting ? "💾 Save changes" : "💾 Save structure")}
                  </Btn>
                </div>
              </div>
            </div>
          );
        })()}
      </Mdl>
  );

  // AUDIT MODAL — compound modal that shows one of three states based on auditStep.
  // "confirm": pre-audit explanation + Start button
  // "running": progress indicator with cancel
  // "done":    grouped results with per-item actions
  const auditMdlJsx = (() => {
    const auditTargets = apps.filter(a => a.status === "draft" || a.status === "approved");
    const closeAudit = () => {
      setAuditStep("idle");
      setAuditResults([]);
      setAuditProgress({ done: 0, total: 0 });
      setAuditCancelFn(null);
    };

    const startAudit = () => {
      setAuditStep("running");
      setAuditProgress({ done: 0, total: auditTargets.length });
      const cancel = runAuditDrafts(
        (done, total) => setAuditProgress({ done, total }),
        (results) => {
          setAuditResults(results);
          setAuditStep("done");
          setAuditCancelFn(null);
        }
      );
      setAuditCancelFn(() => cancel);
    };

    const cancelRunningAudit = () => {
      if (auditCancelFn) auditCancelFn();
      setAuditStep("idle");
      setAuditCancelFn(null);
    };

    // Group results by verdict
    const failed = auditResults.filter(r => r.verification?.overallVerdict === "fail");
    const uncertain = auditResults.filter(r => r.verification?.overallVerdict === "uncertain");
    const verified = auditResults.filter(r => r.verification?.overallVerdict === "verified");

    // Per-item actions used in results view
    const openAppDetail = (appId) => {
      const idx = apps.findIndex(a => a.id === appId);
      if (idx === -1) return;
      setView(idx);
      closeAudit();
    };

    const deleteApp = (appId) => {
      const app = apps.find(a => a.id === appId);
      if (!app) return;
      if (!confirm("Delete the draft application for " + app.oppName + "? This cannot be undone.")) return;
      save(apps.filter(a => a.id !== appId));
      // Also remove from local audit results so it disappears from the modal
      setAuditResults(auditResults.filter(r => r.appId !== appId));
    };

    const dismissFlag = (appId) => {
      const updated = apps.map(a => a.id === appId ? { ...a, auditFlagDismissed: true } : a);
      save(updated);
    };

    // Render a single result row with expandable evidence and action buttons
    const renderResultItem = (r) => {
      const v = r.verification;
      const vc = v?.overallVerdict === "verified" ? C.ok : v?.overallVerdict === "fail" ? C.dn : C.wn;
      // Normalize legacy field name
      const availKey = v?.availabilityGate ? "availabilityGate" : (v?.deadlineGate ? "deadlineGate" : "availabilityGate");
      const gates = [
        { key: "stageGate", label: "Stage" },
        { key: "genreGate", label: "Genre/Format" },
        { key: "demographicGate", label: "Demographic/Thematic" },
        { key: availKey, label: "Availability" },
        { key: "serviceFitGate", label: "Service Fit" }
      ].filter(g => v && v[g.key]);
      const stillExists = !!apps.find(a => a.id === r.appId);
      if (!stillExists) return null;

      return (
        <div key={r.appId} style={{
          padding: "12px 14px",
          background: C.bg,
          border: "1px solid " + vc + "40",
          borderLeft: "3px solid " + vc,
          borderRadius: "6px",
          marginBottom: "10px"
        }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "10px",
            flexWrap: "wrap",
            marginBottom: "6px"
          }}>
            <div style={{ flex: 1, minWidth: "200px" }}>
              <p style={{ fontSize: "14px", fontWeight: 600, color: C.tx, marginBottom: "2px" }}>
                {r.oppName}
              </p>
              <p style={{ fontSize: "11px", color: C.tm, fontFamily: FN.m }}>
                {r.oppOrg} · {r.projTitle}
              </p>
            </div>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              <Btn variant="ghost" small onClick={() => openAppDetail(r.appId)}>
                View app
              </Btn>
              {(() => {
                // Show "Find right track" only when:
                // - Overall verdict is fail
                // - Stage gate specifically failed (that's what siblings solve)
                // - Availability gate did NOT fail (if program is gone or past deadline, siblings don't help)
                if (v?.overallVerdict !== "fail") return null;
                if (v?.stageGate?.verdict !== "fail") return null;
                const availability = v?.availabilityGate || v?.deadlineGate;
                if (availability?.verdict === "fail") return null;
                return (
                  <Btn
                    variant="teal"
                    small
                    onClick={() => {
                      // Find the project this app is attached to
                      const app = apps.find(a => a.id === r.appId);
                      const project = app ? projects.find(p => p.title === app.projTitle) : null;
                      if (!project) {
                        alert("Couldn't find the project for this application.");
                        return;
                      }
                      // Open modal in loading state
                      setSiblingMdl({
                        appId: r.appId,
                        oppName: r.oppName,
                        oppOrg: r.oppOrg,
                        projTitle: r.projTitle,
                        project: project,
                        loading: true,
                        tracks: [],
                        error: null
                      });
                      // Kick off the sibling search
                      findSiblingTracks(r.oppName, r.oppOrg, project)
                        .then(tracks => {
                          setSiblingMdl(prev => prev && prev.appId === r.appId ? {
                            ...prev,
                            loading: false,
                            tracks: Array.isArray(tracks) ? tracks : [],
                            error: null
                          } : prev);
                        })
                        .catch(err => {
                          setSiblingMdl(prev => prev && prev.appId === r.appId ? {
                            ...prev,
                            loading: false,
                            tracks: [],
                            error: err.message || "Failed to find sibling tracks"
                          } : prev);
                        });
                    }}
                  >
                    🔎 Find right track
                  </Btn>
                );
              })()}
              {v?.overallVerdict === "fail" && (
                <Btn variant="danger" small onClick={() => deleteApp(r.appId)}>
                  Delete draft
                </Btn>
              )}
              {(v?.overallVerdict === "fail" || v?.overallVerdict === "uncertain") && (
                <Btn variant="ghost" small onClick={() => dismissFlag(r.appId)}>
                  Dismiss flag
                </Btn>
              )}
            </div>
          </div>
          {v?.error && (
            <p style={{ fontSize: "12px", color: C.dn, fontStyle: "italic", marginBottom: "6px" }}>
              Verification error: {v.error}
            </p>
          )}
          {gates.length > 0 && (
            <details style={{ marginTop: "4px" }}>
              <summary style={{
                fontSize: "11px",
                color: C.tm,
                cursor: "pointer",
                fontFamily: FN.m,
                letterSpacing: "0.04em"
              }}>
                Show evidence ({gates.length} gate{gates.length === 1 ? "" : "s"})
              </summary>
              <div style={{ marginTop: "8px", display: "flex", flexDirection: "column", gap: "8px" }}>
                {gates.map(g => {
                  const gate = v[g.key];
                  const gcolor = gate.verdict === "pass" ? C.ok : gate.verdict === "fail" ? C.dn : C.wn;
                  const gsym = gate.verdict === "pass" ? "✓" : gate.verdict === "fail" ? "✗" : "⚠";
                  return (
                    <div key={g.key} style={{
                      padding: "6px 10px",
                      background: C.sf,
                      borderLeft: "2px solid " + gcolor,
                      borderRadius: "3px"
                    }}>
                      <p style={{
                        fontFamily: FN.m,
                        fontSize: "10px",
                        color: gcolor,
                        marginBottom: "3px",
                        letterSpacing: "0.04em"
                      }}>
                        {gsym} {g.label.toUpperCase()}: {(gate.verdict || "").toUpperCase()}
                      </p>
                      {gate._jsStatus && (
                        <p style={{
                          fontFamily: FN.m,
                          fontSize: "10px",
                          color: C.tm,
                          marginBottom: "3px"
                        }}>
                          JS date check: {gate._jsStatus}
                        </p>
                      )}
                      {gate.evidence && (
                        <p style={{ fontSize: "11px", color: C.tx, lineHeight: 1.5, marginBottom: "3px" }}>
                          {gate.evidence}
                        </p>
                      )}
                      {gate.concern && (
                        <p style={{ fontSize: "11px", color: C.tm, lineHeight: 1.5, marginBottom: "3px", fontStyle: "italic" }}>
                          {gate.concern}
                        </p>
                      )}
                      {gate.sourceUrl && (
                        <a href={gate.sourceUrl} target="_blank" rel="noopener noreferrer" style={{
                          color: C.tl,
                          fontSize: "10px",
                          fontFamily: FN.m,
                          wordBreak: "break-all"
                        }}>
                          source: {gate.sourceUrl}
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            </details>
          )}
        </div>
      );
    };

    return (
      <Mdl
        open={auditStep !== "idle"}
        onClose={auditStep === "running" ? () => {} : closeAudit}
        title={
          auditStep === "confirm" ? "Audit Draft Applications" :
          auditStep === "running" ? "Auditing Applications..." :
          "Audit Results"
        }
        width="720px"
      >
        {auditStep === "confirm" && (
          <div>
            <p style={{ fontSize: "13px", color: C.tx, lineHeight: 1.6, marginBottom: "14px" }}>
              This will verify <strong>{auditTargets.length}</strong> draft and approved application{auditTargets.length === 1 ? "" : "s"} against their actual eligibility requirements.
            </p>
            <div style={{
              padding: "12px 14px",
              background: C.bg,
              border: "1px solid " + C.bd,
              borderRadius: "6px",
              marginBottom: "14px"
            }}>
              <p style={{ fontSize: "12px", color: C.tm, lineHeight: 1.6, marginBottom: "8px" }}>
                For each application, the engine will:
              </p>
              <ul style={{ fontSize: "12px", color: C.tm, lineHeight: 1.7, paddingLeft: "20px", margin: 0 }}>
                <li>Look up the opportunity's current eligibility guidelines via web search</li>
                <li>Check three gates: stage (development / production / completed, etc.), genre/format, and demographic/thematic fit</li>
                <li>Report any mismatches with evidence quoted from the source</li>
              </ul>
            </div>
            <div style={{
              padding: "10px 12px",
              background: C.wn + "10",
              border: "1px solid " + C.wn + "30",
              borderRadius: "6px",
              marginBottom: "16px"
            }}>
              <p style={{ fontSize: "12px", color: C.tx, lineHeight: 1.5 }}>
                ⏱ Estimated time: <strong>~{Math.ceil(auditTargets.length / 2)}-{Math.ceil(auditTargets.length)} minutes</strong> (2 checks run in parallel with a brief pause between batches). Each verification fetches multiple pages on the program's own site for thorough research. Nothing is deleted automatically — you decide what to do with flagged items.
              </p>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
              <Btn variant="secondary" onClick={closeAudit}>Cancel</Btn>
              <Btn variant="primary" onClick={startAudit} disabled={auditTargets.length === 0}>
                🔍 Start audit
              </Btn>
            </div>
          </div>
        )}

        {auditStep === "running" && (
          <div>
            <p style={{ fontSize: "13px", color: C.tx, lineHeight: 1.6, marginBottom: "16px" }}>
              Verifying applications against their projects' eligibility...
            </p>
            {/* Progress bar */}
            <div style={{
              height: "8px",
              background: C.bd,
              borderRadius: "4px",
              overflow: "hidden",
              marginBottom: "8px"
            }}>
              <div style={{
                height: "100%",
                width: auditProgress.total > 0 ? (auditProgress.done / auditProgress.total * 100) + "%" : "0%",
                background: C.tl,
                transition: "width 0.3s ease"
              }} />
            </div>
            <p style={{ fontSize: "12px", color: C.tm, fontFamily: FN.m, marginBottom: "20px" }}>
              {auditProgress.done} of {auditProgress.total} complete
            </p>
            <div style={{
              padding: "10px 12px",
              background: C.bg,
              border: "1px solid " + C.bd,
              borderRadius: "6px",
              marginBottom: "16px"
            }}>
              <p style={{ fontSize: "11px", color: C.tm, lineHeight: 1.5 }}>
                💡 You can close this modal — the audit continues in the background and results are saved to each application as they complete. You'll see flags on the Applications list when it's done.
              </p>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "8px" }}>
              <Btn variant="secondary" onClick={closeAudit}>
                Run in background
              </Btn>
              <Btn variant="danger" onClick={cancelRunningAudit}>
                Cancel audit
              </Btn>
            </div>
          </div>
        )}

        {auditStep === "done" && (
          <div>
            {/* Summary counts */}
            <div style={{
              display: "flex",
              gap: "20px",
              marginBottom: "20px",
              flexWrap: "wrap"
            }}>
              <div>
                <p style={{ fontFamily: FN.d, fontSize: "28px", fontStyle: "italic", color: C.dn }}>
                  {failed.length}
                </p>
                <p style={{ ...LS, color: C.dn, marginBottom: 0 }}>FAILED</p>
              </div>
              <div>
                <p style={{ fontFamily: FN.d, fontSize: "28px", fontStyle: "italic", color: C.wn }}>
                  {uncertain.length}
                </p>
                <p style={{ ...LS, color: C.wn, marginBottom: 0 }}>UNCERTAIN</p>
              </div>
              <div>
                <p style={{ fontFamily: FN.d, fontSize: "28px", fontStyle: "italic", color: C.ok }}>
                  {verified.length}
                </p>
                <p style={{ ...LS, color: C.ok, marginBottom: 0 }}>VERIFIED</p>
              </div>
            </div>

            {auditResults.length === 0 && (
              <p style={{ fontSize: "13px", color: C.tm, lineHeight: 1.6, marginBottom: "16px" }}>
                No draft applications to audit.
              </p>
            )}

            {failed.length > 0 && (
              <div style={{ marginBottom: "20px" }}>
                <p style={{ ...LS, color: C.dn, marginBottom: "8px" }}>
                  ✗ FAILED — DO NOT SUBMIT
                </p>
                <p style={{ fontSize: "12px", color: C.tm, marginBottom: "10px", lineHeight: 1.5 }}>
                  The engine found clear evidence these applications don't qualify. Review the evidence and decide whether to delete the draft.
                </p>
                {failed.map(renderResultItem)}
              </div>
            )}

            {uncertain.length > 0 && (
              <div style={{ marginBottom: "20px" }}>
                <p style={{ ...LS, color: C.wn, marginBottom: "8px" }}>
                  ⚠ UNCERTAIN — REVIEW
                </p>
                <p style={{ fontSize: "12px", color: C.tm, marginBottom: "10px", lineHeight: 1.5 }}>
                  Eligibility couldn't be confirmed. Review the evidence, or check the guidelines page directly.
                </p>
                {uncertain.map(renderResultItem)}
              </div>
            )}

            {verified.length > 0 && (
              <details style={{ marginBottom: "20px" }}>
                <summary style={{
                  ...LS,
                  color: C.ok,
                  marginBottom: "8px",
                  cursor: "pointer",
                  userSelect: "none"
                }}>
                  ✓ VERIFIED ({verified.length}) — click to show
                </summary>
                <div style={{ marginTop: "10px" }}>
                  {verified.map(renderResultItem)}
                </div>
              </details>
            )}

            <div style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "8px",
              paddingTop: "12px",
              borderTop: "1px solid " + C.bd
            }}>
              <Btn variant="primary" onClick={closeAudit}>Close</Btn>
            </div>
          </div>
        )}
      </Mdl>
    );
  })();

  // SIBLING TRACKS MODAL — shown when user clicks "Find right track" on a failed audit result.
  // Displays alternate tracks at the same org and lets user save any to the opps list.
  const siblingMdlJsx = (() => {
    if (!siblingMdl) return null;

    const closeSiblings = () => setSiblingMdl(null);

    // Is this track already in the opps list?
    const isOppSaved = (track) =>
      opps.some(o =>
        (o.name || "").toLowerCase().trim() === (track.name || "").toLowerCase().trim() &&
        (o.organization || "").toLowerCase().trim() === (track.organization || "").toLowerCase().trim()
      );

    const saveTrack = (track) => {
      if (isOppSaved(track)) return;
      saveOpps([...opps, {
        ...track,
        savedAt: new Date().toISOString(),
        // We didn't run Pass 2 verification on sibling tracks individually here —
        // the sibling search already filtered to project-compatible tracks,
        // but we don't have per-gate evidence. Mark as needing verification
        // so the audit system will still check on next audit run.
        verification: undefined
      }]);
    };

    return (
      <Mdl
        open={siblingMdl !== null}
        onClose={closeSiblings}
        title={"Alternate Tracks at " + (siblingMdl.oppOrg || "this organization")}
        width="680px"
      >
        <div>
          <p style={{ fontSize: "13px", color: C.tm, lineHeight: 1.6, marginBottom: "16px" }}>
            <strong style={{ color: C.tx }}>"{siblingMdl.oppName}"</strong> didn't fit <strong style={{ color: C.tx }}>"{siblingMdl.projTitle}"</strong> because of stage mismatch. Many festivals and institutes run multiple tracks — here's what else {siblingMdl.oppOrg} offers that might fit.
          </p>

          {siblingMdl.loading && (
            <div style={{
              padding: "24px",
              textAlign: "center",
              color: C.tm,
              fontSize: "13px",
              fontFamily: FN.m
            }}>
              ⏳ Searching {siblingMdl.oppOrg} for alternate tracks...
              <p style={{ fontSize: "11px", color: C.td, marginTop: "8px" }}>
                (30-60 seconds — the engine is reading their programs page)
              </p>
            </div>
          )}

          {!siblingMdl.loading && siblingMdl.error && (
            <div style={{
              padding: "12px 14px",
              background: C.dn + "10",
              border: "1px solid " + C.dn + "40",
              borderRadius: "6px",
              fontSize: "12px",
              color: C.tx,
              marginBottom: "16px"
            }}>
              ⚠ {siblingMdl.error}
            </div>
          )}

          {!siblingMdl.loading && !siblingMdl.error && siblingMdl.tracks.length === 0 && (
            <div style={{
              padding: "16px",
              background: C.bg,
              border: "1px solid " + C.bd,
              borderRadius: "6px",
              fontSize: "13px",
              color: C.tm,
              lineHeight: 1.5,
              marginBottom: "16px"
            }}>
              No other tracks at {siblingMdl.oppOrg} appear to fit this project's stage and format right now. You may need to look elsewhere for similar programs, or wait for the next cycle.
            </div>
          )}

          {!siblingMdl.loading && siblingMdl.tracks.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
              {siblingMdl.tracks.map((track, i) => {
                const saved = isOppSaved(track);
                const strengthColor = track.matchStrength === "strong" ? C.ok : C.wn;
                return (
                  <div key={i} style={{
                    padding: "12px 14px",
                    background: C.bg,
                    border: "1px solid " + C.bd,
                    borderLeft: "3px solid " + strengthColor,
                    borderRadius: "6px"
                  }}>
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: "10px",
                      flexWrap: "wrap",
                      marginBottom: "6px"
                    }}>
                      <div style={{ flex: 1, minWidth: "200px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "4px" }}>
                          <p style={{ fontSize: "14px", fontWeight: 600, color: C.tx }}>
                            {track.name}
                          </p>
                          <Bdg color={strengthColor}>
                            {track.matchStrength || "moderate"}
                          </Bdg>
                          {track.type && (
                            <Bdg color={C.tl}>{track.type}</Bdg>
                          )}
                        </div>
                        <p style={{ fontSize: "11px", color: C.tm, fontFamily: FN.m }}>
                          {track.organization}
                          {track.deadline && " · 📅 " + track.deadline}
                          {track.submissionFee && " · 💰 " + track.submissionFee}
                          {track.amount && " · 🏆 " + track.amount}
                        </p>
                      </div>
                      <div style={{ display: "flex", gap: "6px" }}>
                        {track.url && (
                          <Btn variant="ghost" small onClick={() => window.open(track.url, "_blank")}>↗</Btn>
                        )}
                        <Btn
                          variant={saved ? "ghost" : "primary"}
                          small
                          onClick={() => saveTrack(track)}
                          disabled={saved}
                        >
                          {saved ? "✓ Saved" : "Save to opps"}
                        </Btn>
                      </div>
                    </div>
                    {track.description && (
                      <p style={{ fontSize: "12px", color: C.tx, lineHeight: 1.5, marginBottom: "6px" }}>
                        {track.description}
                      </p>
                    )}
                    {track.whyThisFits && (
                      <div style={{
                        fontSize: "12px",
                        color: C.ac,
                        lineHeight: 1.5,
                        padding: "6px 8px",
                        background: C.ac + "08",
                        borderRadius: "3px",
                        fontFamily: FN.m
                      }}>
                        ✓ {track.whyThisFits}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div style={{
            display: "flex",
            justifyContent: "flex-end",
            paddingTop: "12px",
            borderTop: "1px solid " + C.bd
          }}>
            <Btn variant="secondary" onClick={closeSiblings}>Close</Btn>
          </div>
        </div>
      </Mdl>
    );
  })();

  /* ── VIEW APP (detail view rendered inline, not early-returned) ── */
  const detailView = (view !== null && apps[view]) ? (() => {
    const app = apps[view];
    const c = app.content || {};
    // Standard section metadata
    const standardSectionMeta = {
      coverLetter: "Cover Letter",
      projectStatement: "Project Statement",
      artistStatement: "Artist Statement",
      budgetJustification: "Budget Justification",
      impactStatement: "Impact Statement",
      timeline: "Timeline"
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
        // Voice directive — inject if profile has it enabled
        const hum_voiceBlock = (profile.voiceDirectiveEnabled !== false) ? ("\n\n" + VOICE_DIRECTIVE + "\n") : "";

        const prompt = `You are rewriting a grant application section to remove any AI-detection tells AND to bring the prose fully into the filmmaker's voice. The reviewer may use AI-detection tools or simply have a trained ear for machine-generated prose. Your job is to rewrite this section so it reads as genuinely human-written AND in the filmmaker's specific voice — preserving ALL the factual content and strategic emphasis of the original.
${hum_voiceBlock}
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
${profile.voiceDirectiveEnabled !== false ? `9. APPLY THE VOICE DIRECTIVE ABOVE. If the current text uses the wrong register (e.g., Hollywood-producer-deck swagger like "speed dial," "sweet spot," "butts in seats," or commercial-buzzy phrases), rewrite it in the register the voice directive specifies — a blend of formal Director's Statement and professional-relational registers. Run every rewritten sentence through the seven sentinel checks before finalizing.` : ""}

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

        {/* AUDIT FLAG — shown when app has been audited and failed or uncertain (and flag not dismissed) */}
        {app.auditResult && !app.auditFlagDismissed && (app.auditResult.overallVerdict === "fail" || app.auditResult.overallVerdict === "uncertain") && (() => {
          const isFail = app.auditResult.overallVerdict === "fail";
          const bc = isFail ? C.dn : C.wn;
          // Normalize legacy field name
          const availKey = app.auditResult.availabilityGate ? "availabilityGate" : (app.auditResult.deadlineGate ? "deadlineGate" : "availabilityGate");
          const gates = [
            { key: "stageGate", label: "Stage" },
            { key: "genreGate", label: "Genre/Format" },
            { key: "demographicGate", label: "Demographic/Thematic" },
            { key: availKey, label: "Availability" },
            { key: "serviceFitGate", label: "Service Fit" }
          ].filter(g => app.auditResult[g.key]);
          return (
            <Card style={{
              marginBottom: "12px",
              background: bc + "08",
              borderColor: bc + "50"
            }}>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: "12px",
                flexWrap: "wrap",
                marginBottom: "8px"
              }}>
                <div style={{ flex: 1, minWidth: "240px" }}>
                  <p style={{
                    fontSize: "14px",
                    fontWeight: 600,
                    color: bc,
                    marginBottom: "4px"
                  }}>
                    {isFail
                      ? "✗ Audit Failed — This Application May Not Qualify"
                      : "⚠ Audit Uncertain — Eligibility Not Confirmed"}
                  </p>
                  <p style={{ fontSize: "12px", color: C.tm, lineHeight: 1.5 }}>
                    {isFail
                      ? "The audit found evidence this project may not meet the opportunity's eligibility. Review the evidence below before submitting."
                      : "The audit couldn't confirm this project meets all eligibility requirements. Check the details below."}
                    {app.auditedAt && " · Audited " + new Date(app.auditedAt).toLocaleDateString()}
                  </p>
                </div>
                <Btn
                  variant="ghost"
                  small
                  onClick={() => {
                    const updated = apps.map(a =>
                      a.id === app.id ? { ...a, auditFlagDismissed: true } : a
                    );
                    save(updated);
                  }}
                >
                  Dismiss flag
                </Btn>
              </div>
              {gates.length > 0 && (
                <details style={{ marginTop: "8px" }}>
                  <summary style={{
                    fontSize: "11px",
                    color: bc,
                    cursor: "pointer",
                    fontFamily: FN.m,
                    letterSpacing: "0.04em"
                  }}>
                    Show audit evidence ({gates.length} gate{gates.length === 1 ? "" : "s"})
                  </summary>
                  <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "8px" }}>
                    {gates.map(g => {
                      const gate = app.auditResult[g.key];
                      const gcolor = gate.verdict === "pass" ? C.ok : gate.verdict === "fail" ? C.dn : C.wn;
                      const gsym = gate.verdict === "pass" ? "✓" : gate.verdict === "fail" ? "✗" : "⚠";
                      return (
                        <div key={g.key} style={{
                          padding: "8px 10px",
                          background: C.bg,
                          borderLeft: "2px solid " + gcolor,
                          borderRadius: "3px"
                        }}>
                          <p style={{
                            fontFamily: FN.m,
                            fontSize: "10px",
                            color: gcolor,
                            marginBottom: "3px",
                            letterSpacing: "0.04em"
                          }}>
                            {gsym} {g.label.toUpperCase()}: {(gate.verdict || "").toUpperCase()}
                          </p>
                          {gate._jsStatus && (
                            <p style={{
                              fontFamily: FN.m,
                              fontSize: "10px",
                              color: C.tm,
                              marginBottom: "3px"
                            }}>
                              JS date check: {gate._jsStatus}
                            </p>
                          )}
                          {gate.evidence && (
                            <p style={{ fontSize: "12px", color: C.tx, lineHeight: 1.5, marginBottom: "3px" }}>
                              {gate.evidence}
                            </p>
                          )}
                          {gate.concern && (
                            <p style={{ fontSize: "11px", color: C.tm, lineHeight: 1.5, marginBottom: "3px", fontStyle: "italic" }}>
                              {gate.concern}
                            </p>
                          )}
                          {gate.sourceUrl && (
                            <a href={gate.sourceUrl} target="_blank" rel="noopener noreferrer" style={{
                              color: C.tl,
                              fontSize: "10px",
                              fontFamily: FN.m,
                              wordBreak: "break-all"
                            }}>
                              source: {gate.sourceUrl}
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </details>
              )}
            </Card>
          );
        })()}

        {/* TOOLS — always visible on non-submitted apps */}
        {app.status !== "submitted" && (
          <Card style={{
            marginBottom: "12px",
            background: C.bg,
            borderColor: C.bd
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "14px",
              flexWrap: "wrap"
            }}>
              <div style={{ flex: 1, minWidth: "220px" }}>
                <p style={{
                  fontFamily: FN.m,
                  fontSize: "11px",
                  color: C.td,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  marginBottom: "4px"
                }}>Tools</p>
                <p style={{ fontSize: "12px", color: C.tm, lineHeight: 1.5 }}>
                  Rework this draft. Refresh pulls in the latest project intelligence; Edit structure lets you correct the field list (paste or screenshot) and regenerate against it.
                </p>
              </div>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <Btn
                  variant="teal"
                  small
                  onClick={() => setRefreshMdl(view)}
                  disabled={isRefreshing(app.id)}
                >
                  {isRefreshing(app.id) ? "🔄 Refreshing..." : "🔄 Refresh / Regenerate"}
                </Btn>
                <Btn
                  variant="secondary"
                  small
                  onClick={() => {
                    // Find this app's opportunity in the opps array
                    const oppIdx = opps.findIndex(o =>
                      o.name === app.oppName && o.organization === app.oppOrg
                    );
                    if (oppIdx === -1) {
                      alert("Couldn't find this opportunity in your saved list — it may have been removed. Re-save it in the Discover tab first.");
                      return;
                    }
                    // Pre-populate manualText from library (if any)
                    const o = opps[oppIdx];
                    const k = ((o.name || "").toLowerCase().trim().replace(/\s+/g, " ") +
                               "|" +
                               (o.organization || "").toLowerCase().trim().replace(/\s+/g, " "));
                    const existing = fieldLibrary && fieldLibrary[k];
                    if (existing && existing.fields && existing.fields.length > 0) {
                      setManualText(serializeFields(existing.fields));
                    } else {
                      // Seed from the app's existing formFieldsFound if available
                      if (Array.isArray(c.formFieldsFound) && c.formFieldsFound.length > 0) {
                        setManualText(serializeFields(c.formFieldsFound));
                      } else {
                        setManualText("");
                      }
                    }
                    // Mark intent to regenerate after save
                    setStructureRegenerateAppId(app.id);
                    setStructureFile(null);
                    setStructureExtractError(null);
                    setStructureExtracting(false);
                    setStructureMdl(oppIdx);
                  }}
                  disabled={isRefreshing(app.id)}
                >
                  ✎ Edit structure & regenerate
                </Btn>
              </div>
            </div>
          </Card>
        )}

        {isStale(app) && (
          <Card style={{
            marginBottom: "12px",
            borderColor: C.wn + "50",
            background: C.wn + "08"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "16px" }}>⚠</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: "13px", fontWeight: 600, marginBottom: "2px" }}>
                  Project has been re-analyzed since this draft was created
                </p>
                <p style={{ fontSize: "12px", color: C.tm, lineHeight: 1.5 }}>
                  Use Refresh above to integrate the updated project intelligence into this draft.
                </p>
              </div>
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

        {((c.requirements && (c.requirements.summary || (c.requirements.standardSectionsNeeded && c.requirements.standardSectionsNeeded.length > 0))) || (c.formFieldsFound && Array.isArray(c.formFieldsFound) && c.formFieldsFound.length > 0)) && (
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
            <p style={{ fontSize: "11px", color: C.tm, fontFamily: FN.m, marginBottom: "14px" }}>
              Based on the AI's research of this opportunity's actual submission guidelines
            </p>
            {c.requirements && c.requirements.summary && (
              <p style={{
                fontSize: "13px",
                lineHeight: 1.6,
                color: C.tx,
                marginBottom: "14px"
              }}>{c.requirements.summary}</p>
            )}
            {c.formFieldsFound && Array.isArray(c.formFieldsFound) && c.formFieldsFound.length > 0 && (
              <div style={{ marginBottom: "14px" }}>
                <p style={{ ...LS, marginBottom: "6px" }}>FORM FIELDS FOUND</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {c.formFieldsFound.map((f, i) => (
                    <div key={i} style={{
                      fontSize: "12px",
                      padding: "6px 8px",
                      background: C.bd + "20",
                      borderRadius: "4px",
                      border: "1px solid " + C.bd + "40"
                    }}>
                      <p style={{ color: C.tx, marginBottom: "2px" }}>
                        <strong>{f.fieldName}</strong>
                        {f.wordLimit && f.wordLimit !== "unspecified" && (
                          <span style={{ color: C.tm, marginLeft: "6px", fontFamily: FN.m, fontSize: "11px" }}>
                            · {f.wordLimit}
                          </span>
                        )}
                      </p>
                      {f.description && (
                        <p style={{ color: C.tm, fontSize: "11px", marginBottom: "2px" }}>{f.description}</p>
                      )}
                      {f.sourceUrl && f.sourceUrl !== "user-provided" && (
                        <a href={f.sourceUrl} target="_blank" rel="noopener noreferrer" style={{
                          color: C.tl,
                          fontSize: "10px",
                          fontFamily: FN.m,
                          wordBreak: "break-all"
                        }}>source: {f.sourceUrl}</a>
                      )}
                      {f.sourceUrl === "user-provided" && (
                        <span style={{ color: C.ac, fontSize: "10px", fontFamily: FN.m }}>
                          ✓ user-provided field list
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                {/* Library status + controls for this application's field list */}
                {(() => {
                  const lib = getFieldsFromLibrary(app.oppName, app.oppOrg);
                  return (
                    <div style={{
                      marginTop: "10px",
                      padding: "8px 10px",
                      background: (lib && lib.verified ? C.ac : C.bd) + "10",
                      border: "1px solid " + (lib && lib.verified ? C.ac : C.bd) + "30",
                      borderRadius: "4px",
                      fontSize: "11px",
                      fontFamily: FN.m,
                      color: C.tm
                    }}>
                      {lib && lib.verified && (
                        <span>✓ Field list saved to library (verified) · used automatically on future {app.oppName} applications</span>
                      )}
                      {lib && !lib.verified && (
                        <div>
                          <span style={{ display: "block", marginBottom: "6px" }}>⚠ Field list saved to library but unverified — AI discovered these, you should verify against the actual form</span>
                          <Btn
                            variant="secondary"
                            small
                            onClick={() => {
                              saveFieldsToLibrary(app.oppName, app.oppOrg, c.formFieldsFound, true);
                            }}
                          >
                            ✓ Mark as verified
                          </Btn>
                        </div>
                      )}
                      {!lib && (
                        <div>
                          <span style={{ display: "block", marginBottom: "6px" }}>Not saved to library. Save these fields to reuse them on future {app.oppName} applications.</span>
                          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                            <Btn
                              variant="secondary"
                              small
                              onClick={() => {
                                saveFieldsToLibrary(app.oppName, app.oppOrg, c.formFieldsFound, true);
                              }}
                            >
                              💾 Save as verified
                            </Btn>
                            <Btn
                              variant="ghost"
                              small
                              onClick={() => {
                                saveFieldsToLibrary(app.oppName, app.oppOrg, c.formFieldsFound, false);
                              }}
                            >
                              Save (unverified)
                            </Btn>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
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
            {c.requirements && c.requirements.additionalInstructions && (
              <div style={{ marginTop: "10px" }}>
                <p style={{ ...LS, marginBottom: "4px" }}>SPECIAL INSTRUCTIONS</p>
                <p style={{ fontSize: "12px", color: C.tx, lineHeight: 1.5 }}>
                  {c.requirements.additionalInstructions}
                </p>
              </div>
            )}
          </Card>
        )}

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
  })() : null;
  // If in detail view, return it directly (Edit Structure modal follows in main return).
  // To render the modal from detail view, we include it here inline.
  if (detailView) {
    return (
      <>
        {detailView}
        {/* Shared Edit Structure modal — rendered here so it works from detail view too */}
        {structureMdlJsx}
        {auditMdlJsx}
        {siblingMdlJsx}
      </>
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
                    {available.map(({ o, i }) => {
                      const vv = o.verification?.overallVerdict;
                      const vPrefix = vv === "verified" ? "✓ " :
                                      vv === "uncertain" ? "⚠ " :
                                      "";
                      return (
                        <option key={i} value={i}>
                          {vPrefix}{o.name} — {o.submissionFee || "?"}
                        </option>
                      );
                    })}
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
        {/* APPLICATION STRUCTURE PANEL — always visible, shows what fields the engine will use */}
        {(() => {
          const parsed = parseManualFields(manualText);
          const hasFields = !!libraryEntry && libraryEntry.fields && libraryEntry.fields.length > 0;
          const fieldCount = hasFields ? libraryEntry.fields.length : 0;
          const librarySerialized = hasFields ? serializeFields(libraryEntry.fields) : "";
          const hasEdits = hasFields && manualText.trim() !== "" && manualText !== librarySerialized;

          // Format "last checked" date
          let lastCheckedLabel = "";
          if (hasFields && libraryEntry.savedAt) {
            const d = new Date(libraryEntry.savedAt);
            const daysAgo = Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
            if (daysAgo === 0) lastCheckedLabel = "today";
            else if (daysAgo === 1) lastCheckedLabel = "yesterday";
            else if (daysAgo < 30) lastCheckedLabel = daysAgo + " days ago";
            else if (daysAgo < 365) lastCheckedLabel = Math.floor(daysAgo / 30) + " months ago";
            else lastCheckedLabel = Math.floor(daysAgo / 365) + " year" + (daysAgo >= 730 ? "s" : "") + " ago";
          }
          const stale = hasFields && libraryEntry.savedAt &&
            (Date.now() - new Date(libraryEntry.savedAt).getTime()) > (1000 * 60 * 60 * 24 * 180); // 180 days

          return (
            <div style={{
              marginBottom: "14px",
              padding: "14px 16px",
              background: C.bg,
              border: "1px solid " + C.bd,
              borderRadius: "8px"
            }}>
              {/* Panel header */}
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "10px",
                gap: "12px",
                flexWrap: "wrap"
              }}>
                <div style={{ flex: 1, minWidth: "200px" }}>
                  <p style={{
                    fontFamily: FN.m,
                    fontSize: "11px",
                    color: C.td,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    marginBottom: "4px"
                  }}>Application Structure</p>
                  <p style={{ fontSize: "12px", color: C.tm, lineHeight: 1.5 }}>
                    {selO === null
                      ? "Select an opportunity to see what fields the engine will generate."
                      : hasFields
                        ? `${fieldCount} field${fieldCount === 1 ? "" : "s"} known for this opportunity · last checked ${lastCheckedLabel}`
                        : "The engine will research this opportunity's form when you Generate. If research can't find the form (e.g. login-required), you can paste the fields or upload a screenshot to ensure accuracy."}
                  </p>
                </div>
                {selO !== null && (
                  <Btn
                    variant="secondary"
                    small
                    onClick={() => {
                      // Open modal with current fields (from library or existing text) pre-loaded
                      setStructureFile(null);
                      setStructureExtractError(null);
                      setStructureExtracting(false);
                      // Pre-populate textarea from library if available
                      if (libraryEntry && libraryEntry.fields && libraryEntry.fields.length > 0) {
                        setManualText(serializeFields(libraryEntry.fields));
                      } else {
                        setManualText("");
                      }
                      setStructureMdl(selO);
                    }}
                  >
                    {hasFields ? "✎ Edit structure" : "✎ Set structure manually"}
                  </Btn>
                )}
              </div>

              {/* Staleness warning — opportunities change year over year */}
              {stale && (
                <div style={{
                  padding: "8px 10px",
                  background: C.wn + "12",
                  border: "1px solid " + C.wn + "30",
                  borderRadius: "4px",
                  fontSize: "12px",
                  color: C.tx,
                  marginBottom: "10px"
                }}>
                  ⚠ This structure was last checked {lastCheckedLabel}. Opportunities often change their forms year-over-year — consider editing to verify before generating.
                </div>
              )}

              {/* Known fields display (compact) */}
              {hasFields && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {libraryEntry.fields.map((f, i) => (
                    <span key={i} style={{
                      fontSize: "11px",
                      fontFamily: FN.m,
                      padding: "3px 8px",
                      background: C.bd + "30",
                      border: "1px solid " + C.bd,
                      borderRadius: "3px",
                      color: C.tx
                    }}>
                      {f.fieldName}
                      {f.wordLimit && f.wordLimit !== "unspecified" && (
                        <span style={{ color: C.tm, marginLeft: "4px" }}>· {f.wordLimit}</span>
                      )}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })()}
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

                {/* Filter tabs + Audit action */}
                <div style={{
                  display: "flex",
                  gap: "6px",
                  marginBottom: "14px",
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "space-between"
                }}>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
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
                  {(() => {
                    const draftOrApprovedCount = apps.filter(a => a.status === "draft" || a.status === "approved").length;
                    if (draftOrApprovedCount === 0) return null;
                    return (
                      <Btn
                        variant="teal"
                        small
                        onClick={() => setAuditStep("confirm")}
                        disabled={auditStep === "running"}
                      >
                        {auditStep === "running"
                          ? `🔍 Auditing ${auditProgress.done}/${auditProgress.total}...`
                          : "🔍 Audit drafts"}
                      </Btn>
                    );
                  })()}
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
            // Sort: verified first, then un-audited, then uncertain, then failed (all bottom).
            // Within each group, most recent first.
            // Failed items at the bottom so the user's eye lands on actionable verified work first.
            const auditRank = (app) => {
              const verdict = app.auditResult && app.auditResult.overallVerdict;
              const dismissed = app.auditFlagDismissed;
              // Dismissed flags go to the verified bucket — user has reviewed and cleared.
              if (verdict === "verified" || dismissed) return 0;
              if (!verdict) return 1;             // never audited
              if (verdict === "uncertain") return 2;
              if (verdict === "fail") return 3;
              return 1;                            // fallback for unexpected values
            };
            const sorted = [...filtered].sort((a, b) => {
              const rankA = auditRank(a);
              const rankB = auditRank(b);
              if (rankA !== rankB) return rankA - rankB;
              // Within same audit rank, sort by recency (most recent first)
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
                    {isStale(app) && <Bdg color={C.wn}>STALE</Bdg>}
                    {/* Audit flags — only show if not dismissed and verdict is problematic */}
                    {app.auditResult && !app.auditFlagDismissed && app.auditResult.overallVerdict === "fail" && (
                      <Bdg color={C.dn}>✗ AUDIT FAIL</Bdg>
                    )}
                    {app.auditResult && !app.auditFlagDismissed && app.auditResult.overallVerdict === "uncertain" && (
                      <Bdg color={C.wn}>⚠ AUDIT UNCERTAIN</Bdg>
                    )}
                    {app.auditResult && app.auditResult.overallVerdict === "verified" && (
                      <Bdg color={C.ok}>✓ AUDITED</Bdg>
                    )}
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

      {structureMdlJsx}
      {auditMdlJsx}
      {siblingMdlJsx}
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

      {/* WRITING VOICE — toggle to apply voice directive to generated apps */}
      <Card style={{ marginTop: "20px", borderColor: C.ac + "40" }}>
        <div style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "16px",
          flexWrap: "wrap"
        }}>
          <div style={{ flex: 1, minWidth: "240px" }}>
            <h3 style={{
              fontFamily: FN.d,
              fontSize: "20px",
              fontStyle: "italic",
              marginBottom: "6px"
            }}>🎙 Writing Voice</h3>
            <p style={{ fontSize: "13px", color: C.tx, lineHeight: 1.6, marginBottom: "8px" }}>
              <strong>Apply Ryan's voice profile to generated applications</strong>
            </p>
            <p style={{ fontSize: "12px", color: C.tm, lineHeight: 1.5, marginBottom: "10px" }}>
              When on, every application the engine writes or rewrites (Generate, Regenerate, Augment, and Humanize) follows the voice rules: earned language, register calibration, banned grant-speak, and sentinel checks from Voice Profile v1.1. Turn off for collaborators with different voices, or when you want a more generic commercial register.
            </p>
            <p style={{ fontSize: "11px", color: C.td, fontStyle: "italic" }}>
              Based on Voice Profile v1.1. The full profile document is a separate reference.
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
            <button
              type="button"
              onClick={() => {
                const next = !(form.voiceDirectiveEnabled !== false); // current resolved state → flip
                setForm({ ...form, voiceDirectiveEnabled: next });
              }}
              style={{
                padding: "8px 16px",
                borderRadius: "20px",
                fontFamily: FN.m,
                fontSize: "12px",
                fontWeight: 600,
                border: "1px solid " + ((form.voiceDirectiveEnabled !== false) ? C.ac : C.bd),
                background: (form.voiceDirectiveEnabled !== false) ? C.ac + "25" : "transparent",
                color: (form.voiceDirectiveEnabled !== false) ? C.ac : C.tm,
                cursor: "pointer",
                minWidth: "80px",
                transition: "all 0.15s"
              }}
            >
              {(form.voiceDirectiveEnabled !== false) ? "✓ ON" : "OFF"}
            </button>
            <p style={{ fontSize: "11px", color: C.tm, fontFamily: FN.m }}>
              Click Save All below to persist
            </p>
          </div>
        </div>
      </Card>

      <Card style={{ marginTop: "20px", borderColor: C.pp + "40" }}>
        <h3 style={{
          fontFamily: FN.d,
          fontSize: "20px",
          fontStyle: "italic",
          marginBottom: "6px"
        }}>🔗 Connected Accounts & Memberships</h3>
        <p style={{ fontSize: "12px", color: C.tm, marginBottom: "16px", lineHeight: 1.5 }}>
          Track accounts and memberships you hold on industry platforms (Blacklist, Sundance Institute, Film Independent, IMDb Pro, FilmFreeway, WithoutABox, Coverfly, Stage 32, etc.). When an application requires one of these, the AI will cross-reference this list and tell you if you're already covered or need to sign up.
        </p>
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

