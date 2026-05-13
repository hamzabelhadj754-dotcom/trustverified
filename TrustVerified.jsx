import { useState, useEffect, useRef } from "react";

// ─── SEED DATA ──────────────────────────────────────────────────────────────
const SEED_BUSINESSES = [
  { id: "b1", ownerId: "u_biz1", name: "SafeNest Rentals", category: "Real Estate", type: "rent", location: "New York, NY", description: "Premium apartment rentals with transparent pricing. All listings verified and inspected.", flags: [], reports: [], since: "2015", image: "🏠", permanentScammer: false, verified: true, phone: "+1 (212) 555-0101", website: "safenest.com", ein: "82-1234567", licenseNo: "RE-2015-NYC-4421" },
  { id: "b2", ownerId: "u_biz2", name: "QuickDeal Motors", category: "Automotive", type: "buy", location: "Los Angeles, CA", description: "Used car dealership. Multiple reports of mileage misrepresentation and hidden fees.", flags: ["Hidden Fees", "Misleading Ads"], reports: [{ userId: "u1", proof: "Receipt showing undisclosed $800 dealer fee on top of listed price.", proofFile: "receipt_aug2026.pdf", status: "pending", date: "2026-04-10" }], since: "2020", image: "🚗", permanentScammer: false, verified: true, phone: "+1 (323) 555-0188", website: "quickdeal.com", ein: "45-9876543", licenseNo: "AUTO-2020-CA-9921" },
  { id: "b3", ownerId: "u_biz3", name: "GoldKey Properties", category: "Real Estate", type: "rent", location: "Miami, FL", description: "CONFIRMED SCAM. Collects deposits for non-existent properties. Multiple police reports.", flags: ["Fake Listings", "Deposit Theft", "Identity Fraud"], reports: [{ userId: "u1", proof: "Paid $1,200 deposit for apartment that does not exist. Bank wire proof attached.", proofFile: "wire_transfer.pdf", status: "confirmed", date: "2026-03-01" }, { userId: "u2", proof: "Same listing re-posted after my report. Lost $2,400. Filed police report #MIA-2026-3821.", proofFile: "police_report.pdf", status: "confirmed", date: "2026-03-15" }], since: "2023", image: "🏚", permanentScammer: true, verified: false, phone: "+1 (305) 555-0077", website: "goldkey.com", ein: "99-0000001", licenseNo: "RE-2023-FL-0001" },
  { id: "b4", ownerId: "u_biz4", name: "TechHaven Electronics", category: "Electronics", type: "buy", location: "San Francisco, CA", description: "Authorized reseller of major electronics brands. Warranty honored, easy returns.", flags: [], reports: [], since: "2012", image: "💻", permanentScammer: false, verified: true, phone: "+1 (415) 555-0234", website: "techhaven.com", ein: "76-5432109", licenseNo: "ELEC-2012-CA-3341" },
];

const SEED_USERS = [
  { id: "u1", name: "Alex Rivera", email: "alex@email.com", password: "pass123", role: "user", avatar: "AR", scamsCaught: 2, badge: "scam_hunter", joinDate: "2025-11-01", reportsSubmitted: ["b2", "b3"], bio: "Consumer protection advocate." },
  { id: "u2", name: "Sam Chen", email: "sam@email.com", password: "pass123", role: "user", avatar: "SC", scamsCaught: 1, badge: "guardian", joinDate: "2026-01-10", reportsSubmitted: ["b3"], bio: "Helping keep the community safe." },
  { id: "u_biz1", name: "SafeNest Team", email: "safe@safenest.com", password: "pass123", role: "business", avatar: "SN", scamsCaught: 0, badge: "trusted_biz", joinDate: "2015-03-01", reportsSubmitted: [], businessId: "b1", bio: "Trusted real estate operator." },
  { id: "u_biz2", name: "QuickDeal Owner", email: "quick@dealer.com", password: "pass123", role: "business", avatar: "QD", scamsCaught: 0, badge: null, joinDate: "2020-06-01", reportsSubmitted: [], businessId: "b2", bio: "Automotive dealer." },
  { id: "u_biz3", name: "GoldKey (BANNED)", email: "gold@key.com", password: "pass123", role: "business", avatar: "GK", scamsCaught: 0, badge: "scammer", joinDate: "2023-01-01", reportsSubmitted: [], businessId: "b3", bio: "" },
  { id: "u_biz4", name: "TechHaven Team", email: "tech@haven.com", password: "pass123", role: "business", avatar: "TH", scamsCaught: 0, badge: "trusted_biz", joinDate: "2012-05-01", reportsSubmitted: [], businessId: "b4", bio: "Electronics reseller." },
];

const BADGES = {
  scam_hunter: { label: "🏆 Scam Hunter",  color: "#ffd700", bg: "rgba(255,215,0,0.12)",  border: "rgba(255,215,0,0.3)",  desc: "Exposed 2+ confirmed scams. Elite community protector." },
  guardian:    { label: "🛡 Guardian",      color: "#00e5a0", bg: "rgba(0,229,160,0.1)",   border: "rgba(0,229,160,0.28)", desc: "Exposed 1 confirmed scam. Trusted reporter." },
  trusted_biz: { label: "✓ Verified Biz",  color: "#00b4ff", bg: "rgba(0,180,255,0.1)",   border: "rgba(0,180,255,0.28)", desc: "Verified and active business on TrustVerified." },
  scammer:     { label: "💀 SCAMMER",       color: "#ff3b5c", bg: "rgba(255,59,92,0.13)",  border: "rgba(255,59,92,0.35)", desc: "Confirmed scam operator — permanently banned." },
};

const STATUS_CFG = {
  verified: { color: "#00e5a0", bg: "rgba(0,229,160,0.08)",  border: "rgba(0,229,160,0.25)", icon: "✓", label: "VERIFIED" },
  warning:  { color: "#ffb800", bg: "rgba(255,184,0,0.08)",  border: "rgba(255,184,0,0.25)", icon: "⚡", label: "CAUTION" },
  scam:     { color: "#ff3b5c", bg: "rgba(255,59,92,0.08)",  border: "rgba(255,59,92,0.28)", icon: "☠", label: "SCAM" },
};

const FLAG_OPTIONS = ["Fake Listing","Deposit Theft","Hidden Fees","Misleading Ads","No Refund","Identity Fraud","Non-Delivery","Fake Reviews"];
const BIZ_CATEGORIES = ["Real Estate","Automotive","Electronics","Furniture","Health & Wellness","Food & Dining","Financial Services","Home Services","Retail","Commercial","Technology","Legal Services"];
const BIZ_EMOJIS = { "Real Estate":"🏠","Automotive":"🚗","Electronics":"💻","Furniture":"🛋","Health & Wellness":"🏥","Food & Dining":"🍽","Financial Services":"💰","Home Services":"🔧","Retail":"🛍","Commercial":"🏢","Technology":"⚙️","Legal Services":"⚖️" };

function computeScore(biz) {
  if (biz.permanentScammer) return 5;
  const confirmed = biz.reports.filter(r => r.status === "confirmed").length;
  const pending   = biz.reports.filter(r => r.status === "pending").length;
  return Math.max(0, Math.min(98, 95 - confirmed * 30 - pending * 9 - biz.flags.length * 2));
}
function computeStatus(biz) {
  if (biz.permanentScammer) return "scam";
  const s = computeScore(biz);
  return s >= 74 ? "verified" : s >= 40 ? "warning" : "scam";
}

// ─── UI ATOMS ────────────────────────────────────────────────────────────────
function Pill({ children, color = "rgba(255,255,255,0.5)", bg = "rgba(255,255,255,0.05)", border = "rgba(255,255,255,0.1)" }) {
  return <span style={{ fontSize: 10, padding: "3px 9px", borderRadius: 20, background: bg, color, border: `1px solid ${border}`, fontWeight: 700, whiteSpace: "nowrap", letterSpacing: 0.5 }}>{children}</span>;
}
function BadgeTag({ type }) {
  if (!type || !BADGES[type]) return null;
  const b = BADGES[type];
  return <Pill color={b.color} bg={b.bg} border={b.border}>{b.label}</Pill>;
}
function Btn({ children, onClick, variant = "primary", full = false, sm = false, disabled = false }) {
  const styles = {
    primary: { background: "linear-gradient(135deg,#00e5a0,#00b37a)", color: "#070b10" },
    danger:  { background: "linear-gradient(135deg,#ff3b5c,#b0243e)", color: "#fff" },
    ghost:   { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.1)" },
    warn:    { background: "linear-gradient(135deg,#ffb800,#cc8800)", color: "#070b10" },
    blue:    { background: "linear-gradient(135deg,#00b4ff,#0070cc)", color: "#fff" },
  };
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ ...styles[variant], border: styles[variant].border || "none", borderRadius: 11, padding: sm ? "7px 14px" : "11px 22px", fontSize: sm ? 11 : 13, fontWeight: 700, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.45 : 1, fontFamily: "inherit", letterSpacing: 0.4, transition: "all 0.18s", width: full ? "100%" : "auto", display: "inline-block" }}>
      {children}
    </button>
  );
}
function Field({ label, type = "text", value, onChange, placeholder, rows, hint, required }) {
  const base = { width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "11px 14px", color: "#fff", fontSize: 13, outline: "none", fontFamily: "inherit", boxSizing: "border-box", transition: "border-color 0.18s" };
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <div style={{ fontSize: 10, color: "rgba(255,255,255,0.36)", marginBottom: 6, letterSpacing: 1.3 }}>{label}{required && <span style={{ color: "#ff3b5c", marginLeft: 3 }}>*</span>}</div>}
      {rows
        ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows} style={{ ...base, resize: "vertical", lineHeight: 1.65 }} />
        : <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={base} />}
      {hint && <div style={{ fontSize: 10, color: "rgba(255,255,255,0.22)", marginTop: 5 }}>{hint}</div>}
    </div>
  );
}
function Select({ label, value, onChange, options, required }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <div style={{ fontSize: 10, color: "rgba(255,255,255,0.36)", marginBottom: 6, letterSpacing: 1.3 }}>{label}{required && <span style={{ color: "#ff3b5c", marginLeft: 3 }}>*</span>}</div>}
      <select value={value} onChange={e => onChange(e.target.value)}
        style={{ width: "100%", background: "#111820", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "11px 14px", color: value ? "#fff" : "rgba(255,255,255,0.28)", fontSize: 13, outline: "none", fontFamily: "inherit", boxSizing: "border-box", cursor: "pointer" }}>
        <option value="">Select…</option>
        {options.map(o => <option key={o} value={o} style={{ background: "#111820" }}>{o}</option>)}
      </select>
    </div>
  );
}
function ScoreRing({ score, status }) {
  const c = STATUS_CFG[status]; const circ = 2 * Math.PI * 25;
  return (
    <div style={{ position: "relative", width: 62, height: 62, flexShrink: 0 }}>
      <svg width="62" height="62" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="31" cy="31" r="25" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
        <circle cx="31" cy="31" r="25" fill="none" stroke={c.color} strokeWidth="5" strokeDasharray={circ} strokeDashoffset={circ - (score / 100) * circ} strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s ease", filter: `drop-shadow(0 0 5px ${c.color})` }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 15, fontWeight: 800, color: c.color, lineHeight: 1 }}>{score}</span>
        <span style={{ fontSize: 7, color: "rgba(255,255,255,0.28)", letterSpacing: 1 }}>TRUST</span>
      </div>
    </div>
  );
}

// Step indicator for multi-step forms
function StepIndicator({ steps, current }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 28 }}>
      {steps.map((s, i) => {
        const done = i < current; const active = i === current;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? 1 : "none" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: done ? 14 : 12, fontWeight: 800, fontFamily: "'Syne',sans-serif", transition: "all 0.3s", background: done ? "linear-gradient(135deg,#00e5a0,#00b37a)" : active ? "rgba(0,229,160,0.15)" : "rgba(255,255,255,0.05)", border: done ? "none" : `2px solid ${active ? "#00e5a0" : "rgba(255,255,255,0.1)"}`, color: done ? "#070b10" : active ? "#00e5a0" : "rgba(255,255,255,0.3)" }}>
                {done ? "✓" : i + 1}
              </div>
              <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: 0.8, color: active ? "#00e5a0" : done ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.22)", whiteSpace: "nowrap" }}>{s}</div>
            </div>
            {i < steps.length - 1 && <div style={{ flex: 1, height: 2, marginBottom: 18, background: done ? "linear-gradient(90deg,#00e5a0,rgba(0,229,160,0.3))" : "rgba(255,255,255,0.06)", marginLeft: 6, marginRight: 6, borderRadius: 2, transition: "all 0.3s" }} />}
          </div>
        );
      })}
    </div>
  );
}

function Shell({ children, maxW = 600 }) {
  return (
    <div style={{ minHeight: "100vh", background: "#070b10", fontFamily: "'DM Sans',sans-serif", color: "#fff", padding: "0 0 80px" }}>
      <div style={{ maxWidth: maxW, margin: "0 auto", padding: "0 16px" }}>{children}</div>
    </div>
  );
}

// ─── TOAST ───────────────────────────────────────────────────────────────────
function Toast({ toast }) {
  if (!toast) return null;
  const colors = { ok: "#00e5a0", err: "#ff3b5c", info: "#00b4ff" };
  return (
    <div style={{ position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", zIndex: 9999, background: "rgba(10,16,24,0.96)", border: `1px solid ${colors[toast.type] || colors.ok}`, borderRadius: 12, padding: "12px 22px", fontSize: 13, color: "#fff", maxWidth: 380, textAlign: "center", backdropFilter: "blur(12px)", animation: "slideUp 0.25s ease", boxShadow: `0 0 20px ${colors[toast.type] || colors.ok}33` }}>
      {toast.msg}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// APP
// ════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [businesses, setBusinesses] = useState(SEED_BUSINESSES);
  const [users, setUsers]           = useState(SEED_USERS);
  const [currentUser, setCurrentUser] = useState(null);
  const [view, setView]             = useState("home");
  const [selectedBiz, setSelectedBiz] = useState(null);
  const [toast, setToast]           = useState(null);

  // search
  const [query, setQuery]   = useState("");
  const [fStatus, setFStatus] = useState("all");
  const [fType, setFType]   = useState("all");
  const [searched, setSearched] = useState(false);

  // auth
  const [authTab, setAuthTab] = useState("login");
  const [regStep, setRegStep] = useState(0); // multi-step for business
  const [aData, setAData] = useState({
    name: "", email: "", password: "", confirmPassword: "", role: "user",
    // step 2 — business basics
    bizName: "", bizCat: "", bizType: "buy", bizLoc: "", bizDesc: "",
    // step 3 — business legal
    bizPhone: "", bizWebsite: "", bizEIN: "", bizLicense: "",
    // step 4 — agreement
    agreedTerms: false, agreedHonesty: false, agreedPermanentBan: false,
  });

  // report
  const [rData, setRData] = useState({ proof: "", flags: [], fileLabel: "" });

  useEffect(() => {
    const s = document.createElement("style");
    s.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap');
      *{box-sizing:border-box;} body{margin:0;background:#070b10;}
      input::placeholder,textarea::placeholder{color:rgba(255,255,255,0.2);}
      select option{background:#111820;}
      textarea{resize:vertical;}
      ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:3px}
      @keyframes fadeIn{from{opacity:0}to{opacity:1}}
      @keyframes slideUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
      @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
      @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
      @keyframes goldGlow{0%,100%{box-shadow:0 0 20px rgba(255,215,0,0.12)}50%{box-shadow:0 0 40px rgba(255,215,0,0.38)}}
      @keyframes scamGlow{0%,100%{box-shadow:0 0 20px rgba(255,59,92,0.12)}50%{box-shadow:0 0 45px rgba(255,59,92,0.4)}}
      @keyframes scamPulse{0%,100%{opacity:1}50%{opacity:0.6}}
      input:focus,textarea:focus,select:focus{border-color:rgba(0,229,160,0.4)!important;outline:none;}
    `;
    document.head.appendChild(s);
    return () => document.head.removeChild(s);
  }, []);

  const notify = (msg, type = "ok") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3400); };
  const freshBiz = id => businesses.find(b => b.id === id);

  // ── NAV BAR ────────────────────────────────────────────────────────────────
  const Nav = () => (
    <div style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(7,11,16,0.92)", backdropFilter: "blur(18px)", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "12px 16px", marginBottom: 0 }}>
      <div style={{ maxWidth: 600, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={() => setView("home")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg,#00e5a0,#00b37a)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🛡</div>
          <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 15, color: "#fff", letterSpacing: 0.5 }}>TrustVerified</span>
        </button>
        <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
          {currentUser ? (
            <>
              {currentUser.role === "business" && (
                <button onClick={() => setView("dashboard")} style={{ background: view === "dashboard" ? "rgba(0,180,255,0.12)" : "rgba(255,255,255,0.04)", border: `1px solid ${view === "dashboard" ? "rgba(0,180,255,0.28)" : "rgba(255,255,255,0.08)"}`, borderRadius: 8, padding: "6px 12px", color: view === "dashboard" ? "#00b4ff" : "rgba(255,255,255,0.5)", cursor: "pointer", fontFamily: "inherit", fontSize: 11, fontWeight: 600 }}>📊 Dashboard</button>
              )}
              <button onClick={() => setView("profile")} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 8, padding: "5px 11px", cursor: "pointer", display: "flex", alignItems: "center", gap: 7 }}>
                <div style={{ width: 22, height: 22, borderRadius: 6, background: currentUser.badge === "scammer" ? "linear-gradient(135deg,#ff3b5c,#7b0000)" : "linear-gradient(135deg,#00e5a0,#0080ff)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 800, color: "#070b10", fontFamily: "'Syne',sans-serif" }}>{currentUser.avatar}</div>
                <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.65)" }}>{currentUser.name.split(" ")[0]}</span>
              </button>
              <button onClick={() => { setCurrentUser(null); setView("home"); notify("Logged out 👋", "info"); }} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.28)", fontSize: 11, fontFamily: "inherit" }}>Sign out</button>
            </>
          ) : (
            <>
              <button onClick={() => { setAuthTab("login"); setView("auth"); }} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.5)", fontSize: 12, fontFamily: "inherit", fontWeight: 600 }}>Log in</button>
              <button onClick={() => { setAuthTab("register"); setRegStep(0); setView("auth"); }} style={{ background: "linear-gradient(135deg,#00e5a0,#00b37a)", border: "none", borderRadius: 8, padding: "7px 14px", color: "#070b10", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Sign up</button>
            </>
          )}
        </div>
      </div>
    </div>
  );

  // ── AUTH ──────────────────────────────────────────────────────────────────
  const login = () => {
    const u = users.find(x => x.email.toLowerCase() === aData.email.toLowerCase() && x.password === aData.password);
    if (!u) { notify("Invalid email or password", "err"); return; }
    setCurrentUser(u); setView("home"); notify(`Welcome back, ${u.name}! 👋`);
  };

  // Business registration multi-step
  const BIZ_STEPS = ["Account", "Business Info", "Legal Details", "Agreement"];
  const USER_STEPS = ["Account Info", "Done"];

  const validateRegStep = () => {
    if (aData.role === "user") {
      if (!aData.name || !aData.email || !aData.password) { notify("Fill all required fields", "err"); return false; }
      if (aData.password.length < 6) { notify("Password must be at least 6 characters", "err"); return false; }
      if (aData.password !== aData.confirmPassword) { notify("Passwords do not match", "err"); return false; }
      if (users.find(x => x.email.toLowerCase() === aData.email.toLowerCase())) { notify("Email already registered", "err"); return false; }
      return true;
    }
    // business steps
    if (regStep === 0) {
      if (!aData.name || !aData.email || !aData.password) { notify("Fill all required fields", "err"); return false; }
      if (aData.password.length < 6) { notify("Password must be at least 6 characters", "err"); return false; }
      if (aData.password !== aData.confirmPassword) { notify("Passwords do not match", "err"); return false; }
      if (users.find(x => x.email.toLowerCase() === aData.email.toLowerCase())) { notify("Email already registered", "err"); return false; }
    }
    if (regStep === 1) {
      if (!aData.bizName || !aData.bizCat || !aData.bizLoc) { notify("Fill all required business fields", "err"); return false; }
    }
    if (regStep === 2) {
      if (!aData.bizPhone) { notify("Phone number is required", "err"); return false; }
    }
    if (regStep === 3) {
      if (!aData.agreedTerms || !aData.agreedHonesty || !aData.agreedPermanentBan) { notify("You must agree to all terms to register your business", "err"); return false; }
    }
    return true;
  };

  const finishRegister = () => {
    const uid = "u_" + Date.now();
    const newUser = {
      id: uid, name: aData.name, email: aData.email, password: aData.password,
      role: aData.role, avatar: aData.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase(),
      scamsCaught: 0, badge: aData.role === "business" ? "trusted_biz" : null,
      joinDate: new Date().toISOString().slice(0, 10), reportsSubmitted: [], businessId: null, bio: "",
    };
    let newBiz = null;
    if (aData.role === "business") {
      const bid = "b_" + Date.now();
      newBiz = {
        id: bid, ownerId: uid, name: aData.bizName, category: aData.bizCat, type: aData.bizType,
        location: aData.bizLoc, description: aData.bizDesc || "New business on TrustVerified.",
        flags: [], reports: [], since: new Date().getFullYear().toString(),
        image: BIZ_EMOJIS[aData.bizCat] || "🏪", permanentScammer: false, verified: false,
        phone: aData.bizPhone, website: aData.bizWebsite, ein: aData.bizEIN, licenseNo: aData.bizLicense,
      };
      newUser.businessId = bid;
    }
    setUsers(p => [...p, newUser]);
    if (newBiz) setBusinesses(p => [...p, newBiz]);
    setCurrentUser(newUser); setView("home");
    notify(`Account created! Welcome, ${aData.name} 🎉`);
  };

  const submitReport = () => {
    if (!rData.proof.trim()) { notify("Please describe your evidence", "err"); return; }
    const biz = freshBiz(selectedBiz.id);
    const report = { userId: currentUser.id, proof: rData.proof, proofFile: rData.fileLabel || null, status: "pending", date: new Date().toISOString().slice(0, 10) };
    setBusinesses(prev => prev.map(b => {
      if (b.id !== biz.id) return b;
      const reports = [...b.reports, report];
      const flags   = [...new Set([...b.flags, ...rData.flags])];
      const confirmed = reports.filter(r => r.status === "confirmed").length;
      const permanent = confirmed >= 2;
      return { ...b, reports, flags, permanentScammer: permanent };
    }));
    setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, reportsSubmitted: [...u.reportsSubmitted, biz.id] } : u));
    setCurrentUser(cu => ({ ...cu, reportsSubmitted: [...cu.reportsSubmitted, biz.id] }));
    setRData({ proof: "", flags: [], fileLabel: "" });
    notify("Report submitted! Our team will review your evidence 🔍");
    setView("detail");
  };

  const resolveReport = (bizId, rIdx, decision) => {
    let reporterId = null;
    setBusinesses(prev => prev.map(b => {
      if (b.id !== bizId) return b;
      reporterId = b.reports[rIdx].userId;
      const reports   = b.reports.map((r, i) => i === rIdx ? { ...r, status: decision } : r);
      const confirmed = reports.filter(r => r.status === "confirmed").length;
      const permanent = confirmed >= 2;
      if (permanent) setUsers(pu => pu.map(u => u.id === b.ownerId ? { ...u, badge: "scammer" } : u));
      return { ...b, reports, permanentScammer: permanent };
    }));
    if (decision === "confirmed" && reporterId) {
      setUsers(prev => prev.map(u => {
        if (u.id !== reporterId) return u;
        const caught = u.scamsCaught + 1;
        const badge  = caught >= 2 ? "scam_hunter" : "guardian";
        if (currentUser?.id === u.id) setCurrentUser(cu => ({ ...cu, scamsCaught: caught, badge }));
        return { ...u, scamsCaught: caught, badge };
      }));
    }
    notify(decision === "confirmed" ? "Report confirmed — trust score updated!" : "Report dismissed.");
  };

  const results = businesses.filter(b => {
    const q = query.toLowerCase();
    const matchQ = !q || b.name.toLowerCase().includes(q) || b.category.toLowerCase().includes(q) || b.location.toLowerCase().includes(q);
    const matchS = fStatus === "all" || computeStatus(b) === fStatus;
    const matchT = fType === "all" || b.type === fType;
    return matchQ && matchS && matchT;
  });

  // ════════════════════════════════════════════════════════════════════════════
  //  VIEW: HOME
  // ════════════════════════════════════════════════════════════════════════════
  if (view === "home") return (
    <Shell>
      <Toast toast={toast} />
      <Nav />
      <div style={{ padding: "28px 0 0", animation: "fadeIn 0.35s ease" }}>
        {/* hero */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(0,229,160,0.08)", border: "1px solid rgba(0,229,160,0.18)", borderRadius: 20, padding: "5px 13px", fontSize: 11, color: "#00e5a0", marginBottom: 14, fontWeight: 600, letterSpacing: 0.5 }}>
            🛡 Proof-Based Business Trust Network
          </div>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 26, margin: "0 0 8px", letterSpacing: -0.5, lineHeight: 1.2 }}>Find <span style={{ color: "#00e5a0" }}>trusted</span> businesses.<br />Avoid scammers forever.</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.42)", margin: 0, lineHeight: 1.6 }}>Community-verified ratings backed by real proof.</p>
        </div>

        {/* search */}
        <div style={{ background: "rgba(255,255,255,0.035)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "13px 15px", marginBottom: 12 }}>
          <div style={{ display: "flex", gap: 9, marginBottom: 10 }}>
            <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && setSearched(true)} placeholder="Search business name, category, city…" style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 10, padding: "10px 14px", color: "#fff", fontSize: 13, outline: "none", fontFamily: "inherit" }} />
            <button onClick={() => setSearched(true)} style={{ background: "linear-gradient(135deg,#00e5a0,#00b37a)", border: "none", borderRadius: 10, padding: "10px 18px", color: "#070b10", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }}>Search</button>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {[["all","All Status"],["verified","✓ Trusted"],["warning","⚡ Caution"],["scam","☠ Scam"]].map(([k,l]) => (
              <button key={k} onClick={() => setFStatus(k)} style={{ padding: "5px 12px", borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s", background: fStatus===k?"rgba(255,255,255,0.11)":"rgba(255,255,255,0.03)", border: `1px solid ${fStatus===k?"rgba(255,255,255,0.2)":"rgba(255,255,255,0.07)"}`, color: fStatus===k?"#fff":"rgba(255,255,255,0.38)" }}>{l}</button>
            ))}
            <span style={{ width: 1, background: "rgba(255,255,255,0.07)", margin: "0 2px" }} />
            {[["all","All"],["buy","Buy"],["rent","Rent"]].map(([k,l]) => (
              <button key={k} onClick={() => setFType(k)} style={{ padding: "5px 12px", borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s", background: fType===k?"rgba(255,255,255,0.11)":"rgba(255,255,255,0.03)", border: `1px solid ${fType===k?"rgba(255,255,255,0.2)":"rgba(255,255,255,0.07)"}`, color: fType===k?"#fff":"rgba(255,255,255,0.38)" }}>{l}</button>
            ))}
          </div>
        </div>

        {searched ? (
          <>
            <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
              {[["✓", results.filter(b=>computeStatus(b)==="verified").length, "#00e5a0","Trusted"],["⚡",results.filter(b=>computeStatus(b)==="warning").length,"#ffb800","Caution"],["☠",results.filter(b=>computeStatus(b)==="scam").length,"#ff3b5c","Scams"]].map(([icon,count,color,label])=>(
                <div key={label} style={{ flex:1, minWidth:80, padding:"10px 13px", borderRadius:10, background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.055)", display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ color, fontSize:15 }}>{icon}</span>
                  <div><div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:18, color, lineHeight:1 }}>{count}</div><div style={{ fontSize:9, color:"rgba(255,255,255,0.28)", letterSpacing:1 }}>{label.toUpperCase()}</div></div>
                </div>
              ))}
            </div>
            {results.length === 0 ? (
              <div style={{ textAlign:"center", padding:"60px 0", color:"rgba(255,255,255,0.3)", fontSize:13 }}>
                <div style={{ fontSize:32, marginBottom:12 }}>🔍</div>
                <div style={{ fontFamily:"'Syne',sans-serif", fontSize:17, color:"rgba(255,255,255,0.4)", marginBottom:5 }}>No results found</div>
                Try a different search or remove filters
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
                {results.map(biz => {
                  const status = computeStatus(biz); const score = computeScore(biz); const c = STATUS_CFG[status];
                  return (
                    <div key={biz.id} onClick={() => { setSelectedBiz(biz); setView("detail"); }}
                      style={{ background:"rgba(255,255,255,0.025)", border:`1px solid ${c.border}`, borderRadius:14, padding:"17px 19px", cursor:"pointer", transition:"all 0.2s", position:"relative", overflow:"hidden", animation:"slideUp 0.3s ease" }}
                      onMouseEnter={e=>{e.currentTarget.style.background=c.bg;e.currentTarget.style.transform="translateY(-2px)";}}
                      onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.025)";e.currentTarget.style.transform="none";}}>
                      {biz.permanentScammer && <div style={{ position:"absolute",top:0,left:0,right:0,height:3,background:"linear-gradient(90deg,#ff3b5c,#ff6b35,#ff3b5c)",backgroundSize:"200% 100%",animation:"shimmer 1.8s linear infinite" }} />}
                      <div style={{ display:"flex", gap:13, alignItems:"flex-start" }}>
                        <div style={{ width:46, height:46, borderRadius:12, background:c.bg, border:`1px solid ${c.border}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>{biz.image}</div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ display:"flex", gap:7, flexWrap:"wrap", alignItems:"center", marginBottom:4 }}>
                            <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:14, color:"#fff" }}>{biz.name}</span>
                            <Pill color={c.color} bg={c.bg} border={c.border}>{c.icon} {c.label}</Pill>
                            {biz.permanentScammer && <Pill color="#ff3b5c" bg="rgba(255,59,92,0.1)" border="rgba(255,59,92,0.25)">☠ PERM BANNED</Pill>}
                          </div>
                          <div style={{ fontSize:11, color:"rgba(255,255,255,0.3)", marginBottom:5 }}>📍 {biz.location} · {biz.category} · {biz.type==="buy"?"For Sale":"For Rent"}</div>
                          <div style={{ fontSize:12, color:"rgba(255,255,255,0.46)", lineHeight:1.55, overflow:"hidden", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" }}>{biz.description}</div>
                          {biz.flags.length>0 && <div style={{ display:"flex", gap:5, marginTop:7, flexWrap:"wrap" }}>{biz.flags.slice(0,3).map(f=><Pill key={f} color="#ff8a97" bg="rgba(255,59,92,0.07)" border="rgba(255,59,92,0.16)">⚠ {f}</Pill>)}</div>}
                        </div>
                        <ScoreRing score={score} status={status} />
                      </div>
                      <div style={{ display:"flex", justifyContent:"space-between", marginTop:11, paddingTop:11, borderTop:"1px solid rgba(255,255,255,0.04)", fontSize:10, color:"rgba(255,255,255,0.24)" }}>
                        <span>{biz.reports.length} report{biz.reports.length!==1?"s":""}</span>
                        <span>{biz.reports.filter(r=>r.status==="confirmed").length} confirmed</span>
                        <span>Est. {biz.since}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <div>
            <div style={{ fontSize:10, color:"rgba(255,255,255,0.25)", letterSpacing:2, marginBottom:12 }}>BROWSE CATEGORIES</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:9 }}>
              {[["🏠","Real Estate"],["🚗","Automotive"],["💻","Electronics"],["🛋","Furniture"],["🏥","Health"],["🏢","Commercial"]].map(([icon,cat])=>(
                <div key={cat} onClick={()=>{setQuery(cat);setSearched(true);}}
                  style={{ padding:"15px 10px", borderRadius:12, cursor:"pointer", background:"rgba(255,255,255,0.025)", border:"1px solid rgba(255,255,255,0.06)", textAlign:"center", transition:"all 0.2s" }}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(0,229,160,0.2)";e.currentTarget.style.background="rgba(0,229,160,0.04)";}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.06)";e.currentTarget.style.background="rgba(255,255,255,0.025)";}}>
                  <div style={{ fontSize:22, marginBottom:5 }}>{icon}</div>
                  <div style={{ fontSize:11, fontWeight:600, color:"rgba(255,255,255,0.6)", fontFamily:"'Syne',sans-serif" }}>{cat}</div>
                </div>
              ))}
            </div>
            {/* recent scammers warning strip */}
            {businesses.filter(b=>b.permanentScammer).length > 0 && (
              <div style={{ marginTop:22, padding:"14px 16px", background:"rgba(255,59,92,0.06)", border:"1px solid rgba(255,59,92,0.16)", borderRadius:13 }}>
                <div style={{ fontSize:10, fontWeight:700, letterSpacing:1.5, color:"#ff3b5c", marginBottom:9 }}>☠ KNOWN SCAMMERS — STAY AWAY</div>
                <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
                  {businesses.filter(b=>b.permanentScammer).map(b=>(
                    <div key={b.id} onClick={()=>{setSelectedBiz(b);setView("detail");}} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", cursor:"pointer", padding:"9px 11px", background:"rgba(255,59,92,0.05)", border:"1px solid rgba(255,59,92,0.12)", borderRadius:9 }}>
                      <div style={{ display:"flex", gap:9, alignItems:"center" }}>
                        <span style={{ fontSize:16 }}>{b.image}</span>
                        <div>
                          <div style={{ fontSize:12, fontWeight:700, color:"#ff3b5c", fontFamily:"'Syne',sans-serif" }}>{b.name}</div>
                          <div style={{ fontSize:10, color:"rgba(255,255,255,0.3)" }}>📍 {b.location} · {b.reports.filter(r=>r.status==="confirmed").length} confirmed reports</div>
                        </div>
                      </div>
                      <Pill color="#ff3b5c" bg="rgba(255,59,92,0.1)" border="rgba(255,59,92,0.25)">☠ BANNED</Pill>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div style={{ display:"flex", justifyContent:"center", gap:20, marginTop:28, color:"rgba(255,255,255,0.18)", fontSize:11 }}>
              <span>🛡 Proof-based</span><span>⚡ Real-time</span><span>🔒 Privacy first</span>
            </div>
          </div>
        )}
      </div>
    </Shell>
  );

  // ════════════════════════════════════════════════════════════════════════════
  //  VIEW: AUTH
  // ════════════════════════════════════════════════════════════════════════════
  if (view === "auth") return (
    <Shell maxW={480}>
      <Toast toast={toast} />
      <Nav />
      <div style={{ padding: "28px 0 0", animation: "slideUp 0.3s ease" }}>
        <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: 28 }}>
          {/* tabs */}
          <div style={{ display: "flex", gap: 5, marginBottom: 26, background: "rgba(255,255,255,0.04)", borderRadius: 11, padding: 4 }}>
            {[["login","Log In"],["register","Create Account"]].map(([t,l]) => (
              <button key={t} onClick={() => { setAuthTab(t); setRegStep(0); }} style={{ flex:1, padding:"9px", borderRadius:8, border:"none", cursor:"pointer", fontFamily:"inherit", fontWeight:700, fontSize:12, transition:"all 0.18s", background:authTab===t?"rgba(255,255,255,0.09)":"transparent", color:authTab===t?"#fff":"rgba(255,255,255,0.35)" }}>{l}</button>
            ))}
          </div>

          {/* ── LOGIN ── */}
          {authTab === "login" && (
            <>
              <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:22, margin:"0 0 22px" }}>Welcome back</h2>
              <Field label="EMAIL" type="email" value={aData.email} onChange={v=>setAData(p=>({...p,email:v}))} placeholder="you@email.com" required />
              <Field label="PASSWORD" type="password" value={aData.password} onChange={v=>setAData(p=>({...p,password:v}))} placeholder="••••••••" required />
              <Btn onClick={login} full>Log In →</Btn>
              <div style={{ marginTop:16, padding:13, background:"rgba(255,255,255,0.025)", borderRadius:10, fontSize:11, color:"rgba(255,255,255,0.36)", lineHeight:1.9 }}>
                <div style={{ fontWeight:700, color:"rgba(255,255,255,0.48)", marginBottom:4 }}>Demo accounts:</div>
                <div>👤 Scam Hunter: alex@email.com / pass123</div>
                <div>👤 Guardian: sam@email.com / pass123</div>
                <div>🏪 Trusted biz: safe@safenest.com / pass123</div>
                <div>🏪 Under reports: quick@dealer.com / pass123</div>
              </div>
            </>
          )}

          {/* ── REGISTER ── */}
          {authTab === "register" && (
            <>
              {/* role picker — always show first */}
              {regStep === 0 && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.36)", letterSpacing: 1.3, marginBottom: 9 }}>I'M SIGNING UP AS</div>
                  <div style={{ display: "flex", gap: 9 }}>
                    {[["user","👤","Regular User","Search & report businesses"],["business","🏪","Business Owner","List & manage your business"]].map(([r,icon,l,sub]) => (
                      <div key={r} onClick={() => setAData(p => ({...p, role: r}))} style={{ flex:1, padding:"14px 10px", borderRadius:13, cursor:"pointer", border:`2px solid ${aData.role===r?"rgba(0,229,160,0.4)":"rgba(255,255,255,0.07)"}`, background:aData.role===r?"rgba(0,229,160,0.06)":"rgba(255,255,255,0.02)", transition:"all 0.18s", textAlign:"center" }}>
                        <div style={{ fontSize:20, marginBottom:6 }}>{icon}</div>
                        <div style={{ fontSize:12, fontWeight:700, color:aData.role===r?"#00e5a0":"rgba(255,255,255,0.6)", fontFamily:"'Syne',sans-serif", marginBottom:3 }}>{l}</div>
                        <div style={{ fontSize:10, color:"rgba(255,255,255,0.3)" }}>{sub}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP INDICATOR for business */}
              {aData.role === "business" && (
                <StepIndicator steps={BIZ_STEPS} current={regStep} />
              )}

              {/* ── STEP 0 / USER FORM: Account Info ── */}
              {regStep === 0 && (
                <>
                  <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:20, margin:"0 0 18px" }}>
                    {aData.role === "business" ? "Step 1 — Your Account" : "Create your account"}
                  </h2>
                  <Field label="FULL NAME" value={aData.name} onChange={v=>setAData(p=>({...p,name:v}))} placeholder="Jane Smith" required />
                  <Field label="EMAIL ADDRESS" type="email" value={aData.email} onChange={v=>setAData(p=>({...p,email:v}))} placeholder="you@email.com" required />
                  <Field label="PASSWORD" type="password" value={aData.password} onChange={v=>setAData(p=>({...p,password:v}))} placeholder="Min 6 characters" required />
                  <Field label="CONFIRM PASSWORD" type="password" value={aData.confirmPassword} onChange={v=>setAData(p=>({...p,confirmPassword:v}))} placeholder="Re-enter password" required />
                  {aData.role === "user" ? (
                    <Btn onClick={() => { if (validateRegStep()) finishRegister(); }} full>Create Account →</Btn>
                  ) : (
                    <Btn onClick={() => { if (validateRegStep()) setRegStep(1); }} full>Next: Business Info →</Btn>
                  )}
                </>
              )}

              {/* ── STEP 1: Business Info ── */}
              {regStep === 1 && aData.role === "business" && (
                <>
                  <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:20, margin:"0 0 18px" }}>Step 2 — Business Info</h2>
                  <Field label="BUSINESS NAME" value={aData.bizName} onChange={v=>setAData(p=>({...p,bizName:v}))} placeholder="Acme Rentals LLC" required />
                  <Select label="CATEGORY" value={aData.bizCat} onChange={v=>setAData(p=>({...p,bizCat:v}))} options={BIZ_CATEGORIES} required />
                  <div style={{ marginBottom:14 }}>
                    <div style={{ fontSize:10, color:"rgba(255,255,255,0.36)", letterSpacing:1.3, marginBottom:8 }}>BUSINESS TYPE <span style={{ color:"#ff3b5c" }}>*</span></div>
                    <div style={{ display:"flex", gap:8 }}>
                      {[["buy","🛒 Selling Products"],["rent","🏠 Renting/Services"]].map(([t,l])=>(
                        <button key={t} onClick={()=>setAData(p=>({...p,bizType:t}))} style={{ flex:1, padding:"10px", borderRadius:9, border:`1px solid ${aData.bizType===t?"rgba(0,229,160,0.38)":"rgba(255,255,255,0.08)"}`, background:aData.bizType===t?"rgba(0,229,160,0.07)":"transparent", color:aData.bizType===t?"#00e5a0":"rgba(255,255,255,0.42)", cursor:"pointer", fontFamily:"inherit", fontWeight:600, fontSize:11 }}>{l}</button>
                      ))}
                    </div>
                  </div>
                  <Field label="CITY / LOCATION" value={aData.bizLoc} onChange={v=>setAData(p=>({...p,bizLoc:v}))} placeholder="New York, NY" required />
                  <Field label="BUSINESS DESCRIPTION" value={aData.bizDesc} onChange={v=>setAData(p=>({...p,bizDesc:v}))} placeholder="What does your business offer? Be clear and honest." rows={3} />
                  <div style={{ display:"flex", gap:9 }}>
                    <Btn onClick={()=>setRegStep(0)} variant="ghost" full>← Back</Btn>
                    <Btn onClick={()=>{ if(validateRegStep()) setRegStep(2); }} full>Next: Legal Details →</Btn>
                  </div>
                </>
              )}

              {/* ── STEP 2: Legal Details ── */}
              {regStep === 2 && aData.role === "business" && (
                <>
                  <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:20, margin:"0 0 6px" }}>Step 3 — Legal Details</h2>
                  <p style={{ fontSize:12, color:"rgba(255,255,255,0.38)", margin:"0 0 20px", lineHeight:1.6 }}>This information helps verify your business and increases trust with customers. Some fields are optional but strongly recommended.</p>
                  <Field label="BUSINESS PHONE NUMBER" value={aData.bizPhone} onChange={v=>setAData(p=>({...p,bizPhone:v}))} placeholder="+1 (555) 000-0000" required />
                  <Field label="WEBSITE (optional)" value={aData.bizWebsite} onChange={v=>setAData(p=>({...p,bizWebsite:v}))} placeholder="yourbusiness.com" />
                  <Field label="EIN / TAX ID (optional)" value={aData.bizEIN} onChange={v=>setAData(p=>({...p,bizEIN:v}))} placeholder="XX-XXXXXXX" hint="Providing this increases your trust score and helps customers verify your legitimacy." />
                  <Field label="BUSINESS LICENSE # (optional)" value={aData.bizLicense} onChange={v=>setAData(p=>({...p,bizLicense:v}))} placeholder="LIC-XXXX-XXXX" hint="State or local business license number if applicable." />
                  <div style={{ padding:"11px 13px", background:"rgba(0,180,255,0.06)", border:"1px solid rgba(0,180,255,0.16)", borderRadius:10, marginBottom:18, fontSize:11, color:"rgba(0,180,255,0.8)", lineHeight:1.65 }}>
                    ℹ️ Your information is protected. We only display contact info you choose to make public, and never sell your data.
                  </div>
                  <div style={{ display:"flex", gap:9 }}>
                    <Btn onClick={()=>setRegStep(1)} variant="ghost" full>← Back</Btn>
                    <Btn onClick={()=>{ if(validateRegStep()) setRegStep(3); }} full>Next: Agreement →</Btn>
                  </div>
                </>
              )}

              {/* ── STEP 3: Agreement ── */}
              {regStep === 3 && aData.role === "business" && (
                <>
                  <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:20, margin:"0 0 6px" }}>Step 4 — Business Agreement</h2>
                  <p style={{ fontSize:12, color:"rgba(255,255,255,0.38)", margin:"0 0 20px", lineHeight:1.6 }}>Please read and agree to the following before listing your business.</p>

                  {/* agreement cards */}
                  {[
                    { key:"agreedTerms", icon:"📋", title:"Terms of Service", color:"#00b4ff", text:"I agree that TrustVerified may display my business publicly, and that customers can view my trust score, flags, and any confirmed reports against my business." },
                    { key:"agreedHonesty", icon:"🤝", title:"Honest Business Pledge", color:"#00e5a0", text:"I confirm that all information I've provided is accurate and truthful. I agree to operate my business honestly and to never deceive or defraud customers." },
                    { key:"agreedPermanentBan", icon:"☠", title:"Permanent Scammer Policy", color:"#ff3b5c", text:"I understand and ACCEPT that if I am caught scamming customers — proven by evidence — my business and account will be PERMANENTLY marked as a SCAMMER and can NEVER be removed. This record stays forever." },
                  ].map(({ key, icon, title, color, text }) => {
                    const checked = aData[key];
                    return (
                      <div key={key} onClick={() => setAData(p => ({...p, [key]: !p[key]}))}
                        style={{ padding:"15px 16px", background:checked?`rgba(${color==="#ff3b5c"?"255,59,92":color==="#00e5a0"?"0,229,160":"0,180,255"},0.07)`:"rgba(255,255,255,0.025)", border:`2px solid ${checked?color+"55":"rgba(255,255,255,0.07)"}`, borderRadius:13, marginBottom:11, cursor:"pointer", transition:"all 0.2s" }}>
                        <div style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
                          <div style={{ width:32, height:32, borderRadius:8, background:checked?`rgba(${color==="#ff3b5c"?"255,59,92":color==="#00e5a0"?"0,229,160":"0,180,255"},0.18)`:"rgba(255,255,255,0.05)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0, transition:"all 0.2s" }}>{icon}</div>
                          <div style={{ flex:1 }}>
                            <div style={{ fontSize:12, fontWeight:700, color:checked?color:"rgba(255,255,255,0.65)", fontFamily:"'Syne',sans-serif", marginBottom:5 }}>{title}</div>
                            <div style={{ fontSize:11, color:"rgba(255,255,255,0.42)", lineHeight:1.6 }}>{text}</div>
                          </div>
                          <div style={{ width:20, height:20, borderRadius:6, border:`2px solid ${checked?color:"rgba(255,255,255,0.2)"}`, background:checked?color:"transparent", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, color:"#070b10", fontWeight:800, flexShrink:0, transition:"all 0.18s", marginTop:2 }}>
                            {checked && "✓"}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* permanent ban warning box */}
                  <div style={{ padding:"14px 16px", background:"rgba(255,59,92,0.07)", border:"1px solid rgba(255,59,92,0.22)", borderRadius:12, marginBottom:18 }}>
                    <div style={{ fontSize:11, fontWeight:700, color:"#ff3b5c", letterSpacing:0.5, marginBottom:5 }}>⚠ PERMANENT SCAMMER POLICY — READ THIS CAREFULLY</div>
                    <div style={{ fontSize:11, color:"rgba(255,255,255,0.52)", lineHeight:1.7 }}>
                      If any user submits evidence of fraud and it is confirmed by our review team, your business will be marked <strong style={{ color:"#ff3b5c" }}>☠ PERMANENT SCAMMER</strong>. This means:
                      <br />• Your listing shows a permanent red banner visible to all users
                      <br />• Your trust score drops to 5/100 and can never recover
                      <br />• Your account is marked 💀 and your business cannot be deleted or renamed
                      <br />• This record is <strong style={{ color:"#ff3b5c" }}>permanent and irreversible</strong>
                    </div>
                  </div>

                  <div style={{ display:"flex", gap:9 }}>
                    <Btn onClick={()=>setRegStep(2)} variant="ghost" full>← Back</Btn>
                    <Btn onClick={()=>{ if(validateRegStep()) finishRegister(); }} variant={aData.agreedTerms && aData.agreedHonesty && aData.agreedPermanentBan ? "primary" : "ghost"} full disabled={!aData.agreedTerms || !aData.agreedHonesty || !aData.agreedPermanentBan}>
                      {aData.agreedTerms && aData.agreedHonesty && aData.agreedPermanentBan ? "Register My Business →" : "Agree to All Terms First"}
                    </Btn>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </Shell>
  );

  // ════════════════════════════════════════════════════════════════════════════
  //  VIEW: DETAIL
  // ════════════════════════════════════════════════════════════════════════════
  if (view === "detail" && selectedBiz) {
    const biz    = freshBiz(selectedBiz.id) || selectedBiz;
    const status = computeStatus(biz); const score = computeScore(biz); const c = STATUS_CFG[status];
    const alreadyReported = currentUser?.reportsSubmitted?.includes(biz.id);
    const isOwner  = currentUser?.businessId === biz.id;
    const isAdmin  = currentUser?.email === "alex@email.com";
    const confirmed = biz.reports.filter(r=>r.status==="confirmed").length;

    return (
      <Shell>
        <Toast toast={toast} />
        <Nav />
        <div style={{ padding:"22px 0 0", animation:"fadeIn 0.3s ease" }}>
          <button onClick={()=>setView("home")} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.38)", cursor:"pointer", fontSize:13, marginBottom:18, fontFamily:"inherit", padding:0 }}>← Back to results</button>

          <div style={{ background:c.bg, border:`2px solid ${c.border}`, borderRadius:18, padding:24, marginBottom:14, position:"relative", overflow:"hidden", ...(biz.permanentScammer?{animation:"scamGlow 3s ease infinite"}:{}) }}>
            {biz.permanentScammer && <div style={{ position:"absolute",top:0,left:0,right:0,height:4,background:"linear-gradient(90deg,#ff3b5c,#ff6b35,#ff3b5c)",backgroundSize:"200% 100%",animation:"shimmer 2s linear infinite" }} />}
            <div style={{ display:"flex", gap:16, alignItems:"flex-start" }}>
              <div style={{ width:54, height:54, borderRadius:15, background:"rgba(0,0,0,0.2)", border:`2px solid ${c.border}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, flexShrink:0 }}>{biz.image}</div>
              <div style={{ flex:1 }}>
                <h1 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:20, margin:"0 0 8px", lineHeight:1.1 }}>{biz.name}</h1>
                <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:7 }}>
                  <Pill color={c.color} bg="rgba(0,0,0,0.18)" border={c.border}>{c.icon} {c.label}</Pill>
                  {biz.permanentScammer && <Pill color="#ff3b5c" bg="rgba(255,59,92,0.15)" border="rgba(255,59,92,0.35)">☠ PERMANENTLY BANNED</Pill>}
                  <Pill>{biz.type==="buy"?"🛒 For Sale":"🏠 For Rent"}</Pill>
                  {biz.verified && <Pill color="#00b4ff" bg="rgba(0,180,255,0.1)" border="rgba(0,180,255,0.25)">✓ Verified Business</Pill>}
                </div>
                <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)" }}>📍 {biz.location} · {biz.category} · Est. {biz.since}</div>
              </div>
              <ScoreRing score={score} status={status} />
            </div>
            <p style={{ fontSize:13, color:"rgba(255,255,255,0.58)", lineHeight:1.7, margin:"16px 0 0", padding:13, background:"rgba(0,0,0,0.15)", borderRadius:10 }}>{biz.description}</p>
            {/* contact info */}
            <div style={{ marginTop:12, display:"flex", gap:12, flexWrap:"wrap" }}>
              {biz.phone && <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)" }}>📞 {biz.phone}</div>}
              {biz.website && <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)" }}>🌐 {biz.website}</div>}
            </div>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:9, marginBottom:14 }}>
            {[["📋 Reports",biz.reports.length],["✓ Confirmed",confirmed],["⏳ Pending",biz.reports.filter(r=>r.status==="pending").length]].map(([l,v])=>(
              <div key={l} style={{ padding:"13px", borderRadius:12, background:"rgba(255,255,255,0.025)", border:"1px solid rgba(255,255,255,0.06)", textAlign:"center" }}>
                <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:20, color:"#fff" }}>{v}</div>
                <div style={{ fontSize:10, color:"rgba(255,255,255,0.32)", marginTop:2 }}>{l}</div>
              </div>
            ))}
          </div>

          {biz.flags.length>0 && (
            <div style={{ padding:"13px 15px", background:"rgba(255,59,92,0.05)", border:"1px solid rgba(255,59,92,0.14)", borderRadius:13, marginBottom:14 }}>
              <div style={{ fontSize:10, fontWeight:700, letterSpacing:1.5, color:"#ff3b5c", marginBottom:9 }}>⚠ REPORTED ISSUES</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>{biz.flags.map(f=><Pill key={f} color="#ff8a97" bg="rgba(255,59,92,0.08)" border="rgba(255,59,92,0.16)">⚠ {f}</Pill>)}</div>
            </div>
          )}

          {biz.reports.length>0 && (
            <div style={{ marginBottom:14 }}>
              <div style={{ fontSize:10, letterSpacing:1.5, color:"rgba(255,255,255,0.28)", marginBottom:11 }}>COMMUNITY REPORTS</div>
              {biz.reports.map((r,i)=>{
                const reporter = users.find(u=>u.id===r.userId);
                return (
                  <div key={i} style={{ padding:"13px 15px", background:"rgba(255,255,255,0.025)", border:`1px solid ${r.status==="confirmed"?"rgba(255,59,92,0.2)":r.status==="dismissed"?"rgba(255,255,255,0.04)":"rgba(255,184,0,0.18)"}`, borderRadius:12, marginBottom:8 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                      <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                        <div style={{ width:24, height:24, borderRadius:7, background:"linear-gradient(135deg,#00e5a0,#0080ff)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:8, fontWeight:800, color:"#070b10" }}>{reporter?.avatar||"??"}</div>
                        <div>
                          <div style={{ fontSize:11, fontWeight:600, color:"rgba(255,255,255,0.65)" }}>{reporter?.name||"Anonymous"}</div>
                          <div style={{ fontSize:10, color:"rgba(255,255,255,0.24)" }}>{r.date}</div>
                        </div>
                      </div>
                      <Pill color={r.status==="confirmed"?"#ff3b5c":r.status==="dismissed"?"rgba(255,255,255,0.3)":"#ffb800"} bg={r.status==="confirmed"?"rgba(255,59,92,0.1)":r.status==="dismissed"?"rgba(255,255,255,0.03)":"rgba(255,184,0,0.1)"} border={r.status==="confirmed"?"rgba(255,59,92,0.22)":r.status==="dismissed"?"rgba(255,255,255,0.08)":"rgba(255,184,0,0.22)"}>
                        {r.status==="confirmed"?"🔴 Confirmed":r.status==="dismissed"?"Dismissed":"⏳ Pending"}
                      </Pill>
                    </div>
                    <div style={{ fontSize:12, color:"rgba(255,255,255,0.6)", lineHeight:1.6 }}>{r.proof}</div>
                    {r.proofFile && <div style={{ marginTop:6, fontSize:10, color:"rgba(0,180,255,0.7)" }}>📎 {r.proofFile}</div>}
                    {isAdmin && r.status==="pending" && (
                      <div style={{ display:"flex", gap:7, marginTop:10 }}>
                        <Btn onClick={()=>resolveReport(biz.id,i,"confirmed")} variant="danger" sm>✓ Confirm Scam</Btn>
                        <Btn onClick={()=>resolveReport(biz.id,i,"dismissed")} variant="ghost" sm>✗ Dismiss</Btn>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* action buttons */}
          <div style={{ display:"flex", gap:9, flexWrap:"wrap" }}>
            {currentUser && !isOwner && !biz.permanentScammer && (
              alreadyReported
                ? <div style={{ flex:1, padding:"11px", background:"rgba(255,184,0,0.07)", border:"1px solid rgba(255,184,0,0.18)", borderRadius:10, fontSize:12, color:"rgba(255,184,0,0.8)", textAlign:"center" }}>⏳ You already submitted a report for this business</div>
                : <Btn onClick={()=>setView("report")} variant="danger" full>⚠ Report This Business</Btn>
            )}
            {!currentUser && !biz.permanentScammer && (
              <Btn onClick={()=>{setAuthTab("login");setView("auth");}} variant="ghost" full>Log in to report this business</Btn>
            )}
          </div>

          {biz.permanentScammer && (
            <div style={{ padding:"16px", background:"rgba(255,59,92,0.06)", border:"2px solid rgba(255,59,92,0.22)", borderRadius:14, textAlign:"center", animation:"scamPulse 2.5s ease infinite" }}>
              <div style={{ fontSize:28, marginBottom:6 }}>☠</div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:15, color:"#ff3b5c", marginBottom:5 }}>PERMANENTLY BANNED SCAMMER</div>
              <div style={{ fontSize:12, color:"rgba(255,255,255,0.48)", lineHeight:1.6 }}>This business has been permanently flagged for fraud. This record is irreversible and will remain visible to all users forever.</div>
            </div>
          )}
        </div>
      </Shell>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  //  VIEW: REPORT
  // ════════════════════════════════════════════════════════════════════════════
  if (view === "report" && selectedBiz) {
    const biz = freshBiz(selectedBiz.id) || selectedBiz;
    return (
      <Shell maxW={520}>
        <Toast toast={toast} />
        <Nav />
        <div style={{ padding:"22px 0 0", animation:"slideUp 0.3s ease" }}>
          <button onClick={()=>setView("detail")} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.38)", cursor:"pointer", fontSize:13, marginBottom:18, fontFamily:"inherit", padding:0 }}>← Back to {biz.name}</button>
          <div style={{ background:"rgba(255,59,92,0.06)", border:"1px solid rgba(255,59,92,0.18)", borderRadius:18, padding:24, marginBottom:18 }}>
            <h1 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:20, margin:"0 0 6px", color:"#ff3b5c" }}>⚠ File a Report</h1>
            <div style={{ fontSize:12, color:"rgba(255,255,255,0.45)", lineHeight:1.6 }}>Reporting: <strong style={{ color:"#fff" }}>{biz.name}</strong></div>
          </div>

          <div style={{ marginBottom:18 }}>
            <div style={{ fontSize:10, color:"rgba(255,255,255,0.36)", letterSpacing:1.3, marginBottom:9 }}>STEP 1 — SELECT ISSUES (optional)</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
              {FLAG_OPTIONS.map(f=>{
                const sel = rData.flags.includes(f);
                return (
                  <button key={f} onClick={()=>setRData(p=>({...p,flags:sel?p.flags.filter(x=>x!==f):[...p.flags,f]}))}
                    style={{ padding:"6px 12px", borderRadius:20, fontSize:11, cursor:"pointer", fontFamily:"inherit", fontWeight:600, transition:"all 0.15s", background:sel?"rgba(255,59,92,0.16)":"rgba(255,255,255,0.04)", border:`1px solid ${sel?"rgba(255,59,92,0.4)":"rgba(255,255,255,0.08)"}`, color:sel?"#ff8a97":"rgba(255,255,255,0.42)" }}>
                    {f}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:10, color:"rgba(255,255,255,0.36)", letterSpacing:1.3, marginBottom:8 }}>STEP 2 — DESCRIBE YOUR PROOF <span style={{ color:"#ff3b5c" }}>*</span></div>
            <textarea value={rData.proof} onChange={e=>setRData(p=>({...p,proof:e.target.value}))}
              placeholder="What happened? Include: dates, amounts lost, what was promised vs delivered, bank transfer refs, any identifying details…"
              rows={5} style={{ width:"100%", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.09)", borderRadius:10, padding:"11px 13px", color:"#fff", fontSize:12, outline:"none", fontFamily:"inherit", boxSizing:"border-box", lineHeight:1.65 }} />
          </div>

          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:10, color:"rgba(255,255,255,0.36)", letterSpacing:1.3, marginBottom:8 }}>STEP 3 — EVIDENCE FILE NAME (optional)</div>
            <input value={rData.fileLabel} onChange={e=>setRData(p=>({...p,fileLabel:e.target.value}))} placeholder="e.g. bank_receipt.pdf, screenshot_2026.jpg"
              style={{ width:"100%", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.09)", borderRadius:10, padding:"10px 13px", color:"#fff", fontSize:12, outline:"none", fontFamily:"inherit", boxSizing:"border-box" }} />
          </div>

          <div style={{ padding:"12px 14px", background:"rgba(255,184,0,0.06)", border:"1px solid rgba(255,184,0,0.15)", borderRadius:10, marginBottom:18, fontSize:11, color:"rgba(255,184,0,0.75)", lineHeight:1.7 }}>
            ⚡ <strong>What happens next:</strong> Your report is reviewed by our team. 1 confirmed report → 🛡 Guardian badge. 2+ confirmed → 🏆 Scam Hunter. The scammer gets permanently marked 💀 — forever.
          </div>

          <div style={{ display:"flex", gap:9 }}>
            <Btn onClick={()=>setView("detail")} variant="ghost" full>Cancel</Btn>
            <Btn onClick={submitReport} variant="danger" full>Submit Report →</Btn>
          </div>
        </div>
      </Shell>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  //  VIEW: BUSINESS DASHBOARD
  // ════════════════════════════════════════════════════════════════════════════
  if (view === "dashboard" && currentUser?.role === "business") {
    const biz = businesses.find(b => b.id === currentUser.businessId);
    if (!biz) return <Shell><Nav /><div style={{ textAlign:"center", padding:60, color:"rgba(255,255,255,0.38)" }}>No business found.</div></Shell>;
    const status = computeStatus(biz); const score = computeScore(biz); const c = STATUS_CFG[status];

    return (
      <Shell>
        <Toast toast={toast} />
        <Nav />
        <div style={{ padding:"22px 0 0", animation:"fadeIn 0.3s ease" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:22 }}>
            <div>
              <div style={{ fontSize:9, letterSpacing:2, color:"rgba(255,255,255,0.28)", marginBottom:4 }}>BUSINESS DASHBOARD</div>
              <h1 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:22, margin:0 }}>{biz.name}</h1>
            </div>
            <ScoreRing score={score} status={status} />
          </div>

          <div style={{ background:c.bg, border:`1px solid ${c.border}`, borderRadius:15, padding:"16px 18px", marginBottom:14, display:"flex", alignItems:"center", gap:13 }}>
            <div style={{ fontSize:26 }}>{c.icon}</div>
            <div>
              <div style={{ fontSize:12, fontWeight:700, color:c.color, letterSpacing:0.8 }}>{c.label}</div>
              <div style={{ fontSize:12, color:"rgba(255,255,255,0.45)", marginTop:2 }}>
                {status==="verified"&&"Your business is trusted. Maintain high standards to keep it."}
                {status==="warning"&&"Caution flag active. Pending reports are affecting your score."}
                {status==="scam"&&(biz.permanentScammer?"Your account has been permanently banned from TrustVerified.":"Multiple reports filed. Take immediate action.")}
              </div>
            </div>
          </div>

          {biz.permanentScammer && (
            <div style={{ padding:"16px", background:"rgba(255,59,92,0.07)", border:"2px solid rgba(255,59,92,0.25)", borderRadius:14, marginBottom:14, animation:"scamGlow 3s ease infinite" }}>
              <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:14, color:"#ff3b5c", marginBottom:6 }}>☠ ACCOUNT PERMANENTLY BANNED</div>
              <div style={{ fontSize:12, color:"rgba(255,255,255,0.5)", lineHeight:1.7 }}>Your business has been confirmed as a scam operation. As stated in the agreement you signed during registration, this status is <strong style={{ color:"#ff3b5c" }}>permanent and irreversible</strong>. Your listing will show a SCAMMER warning to all users forever.</div>
            </div>
          )}

          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:9, marginBottom:16 }}>
            {[["Trust Score",score,c.color],["Reports",biz.reports.length,"#fff"],["Confirmed",biz.reports.filter(r=>r.status==="confirmed").length,"#ff3b5c"]].map(([l,v,col])=>(
              <div key={l} style={{ padding:"15px", borderRadius:12, background:"rgba(255,255,255,0.025)", border:"1px solid rgba(255,255,255,0.06)", textAlign:"center" }}>
                <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:24, color:col }}>{v}</div>
                <div style={{ fontSize:10, color:"rgba(255,255,255,0.35)", marginTop:2 }}>{l}</div>
              </div>
            ))}
          </div>

          <div style={{ background:"rgba(255,255,255,0.025)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:15, padding:18, marginBottom:14 }}>
            <div style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.5)", letterSpacing:1, marginBottom:13 }}>HOW YOUR SCORE WORKS</div>
            {[
              ["⏳","Pending report","Score drops ~9 pts per pending report"],
              ["🔴","Confirmed report","Score drops ~30 pts immediately"],
              ["☠","2 confirmed = PERMANENT BAN","Business and owner account banned forever"],
              ["✓","Zero reports","Stay at 95–98 trust score"],
            ].map(([icon,label,desc])=>(
              <div key={label} style={{ display:"flex", gap:11, paddingBottom:10, marginBottom:10, borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                <div style={{ fontSize:14, flexShrink:0, marginTop:1 }}>{icon}</div>
                <div>
                  <div style={{ fontSize:12, fontWeight:600, color:"#fff", marginBottom:2 }}>{label}</div>
                  <div style={{ fontSize:11, color:"rgba(255,255,255,0.36)" }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>

          {biz.reports.filter(r=>r.status==="pending").length > 0 && (
            <div>
              <div style={{ fontSize:10, letterSpacing:1.5, color:"#ffb800", marginBottom:11 }}>⏳ PENDING REPORTS</div>
              {biz.reports.filter(r=>r.status==="pending").map((r,i)=>(
                <div key={i} style={{ padding:"13px 15px", background:"rgba(255,184,0,0.05)", border:"1px solid rgba(255,184,0,0.14)", borderRadius:12, marginBottom:7 }}>
                  <div style={{ fontSize:12, color:"rgba(255,255,255,0.6)", lineHeight:1.6, marginBottom:5 }}>{r.proof}</div>
                  <div style={{ fontSize:10, color:"rgba(255,255,255,0.26)" }}>{r.date}</div>
                </div>
              ))}
              <div style={{ fontSize:11, color:"rgba(255,184,0,0.6)", marginTop:7 }}>⚡ These are under review. Each confirmed report permanently affects your score.</div>
            </div>
          )}
        </div>
      </Shell>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  //  VIEW: PROFILE
  // ════════════════════════════════════════════════════════════════════════════
  if (view === "profile" && currentUser) {
    const isHunter  = currentUser.badge === "scam_hunter";
    const isScammer = currentUser.badge === "scammer";
    const bc = currentUser.badge ? BADGES[currentUser.badge] : null;

    return (
      <Shell maxW={520}>
        <Toast toast={toast} />
        <Nav />
        <div style={{ padding:"22px 0 0", animation:"fadeIn 0.3s ease" }}>
          <div style={{ background:bc?bc.bg:"rgba(255,255,255,0.025)", border:`1px solid ${bc?bc.border:"rgba(255,255,255,0.07)"}`, borderRadius:20, padding:26, marginBottom:14, animation:isHunter?"goldGlow 3s ease infinite":isScammer?"scamGlow 3s ease infinite":"none" }}>
            <div style={{ display:"flex", gap:15, alignItems:"flex-start" }}>
              <div style={{ position:"relative" }}>
                <div style={{ width:64, height:64, borderRadius:17, background:isHunter?"linear-gradient(135deg,#ffd700,#ff8c00)":isScammer?"linear-gradient(135deg,#ff3b5c,#7b0000)":"linear-gradient(135deg,#00e5a0,#0080ff)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, fontWeight:800, color:"#070b10", fontFamily:"'Syne',sans-serif", flexShrink:0 }}>{currentUser.avatar}</div>
                {isHunter && <div style={{ position:"absolute", bottom:-6, right:-6, fontSize:17 }}>🏆</div>}
                {currentUser.badge==="guardian" && <div style={{ position:"absolute", bottom:-6, right:-6, fontSize:17 }}>🛡</div>}
                {isScammer && <div style={{ position:"absolute", bottom:-6, right:-6, fontSize:17 }}>💀</div>}
              </div>
              <div style={{ flex:1 }}>
                <h1 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:20, margin:"0 0 8px" }}>{currentUser.name}</h1>
                <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:6 }}>
                  <Pill>{currentUser.role==="business"?"🏪 Business Owner":"👤 Community User"}</Pill>
                  {currentUser.badge && <BadgeTag type={currentUser.badge} />}
                </div>
                <div style={{ fontSize:11, color:"rgba(255,255,255,0.28)" }}>Member since {currentUser.joinDate}</div>
              </div>
            </div>
            {bc && (
              <div style={{ marginTop:16, padding:"11px 13px", background:"rgba(0,0,0,0.18)", borderRadius:10, fontSize:12, color:"rgba(255,255,255,0.52)", lineHeight:1.6 }}>
                <strong style={{ color:bc.color }}>{bc.label}</strong> — {bc.desc}
              </div>
            )}
          </div>

          {currentUser.role==="user" && (
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:9, marginBottom:14 }}>
              {[["🏆 Scams Caught",currentUser.scamsCaught,"#ffd700"],["📋 Reports Filed",currentUser.reportsSubmitted.length,"#00e5a0"]].map(([l,v,col])=>(
                <div key={l} style={{ padding:"17px", borderRadius:12, background:"rgba(255,255,255,0.025)", border:"1px solid rgba(255,255,255,0.06)", textAlign:"center" }}>
                  <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:28, color:col }}>{v}</div>
                  <div style={{ fontSize:11, color:"rgba(255,255,255,0.34)", marginTop:3 }}>{l}</div>
                </div>
              ))}
            </div>
          )}

          {currentUser.role==="user" && !isScammer && (
            <div style={{ background:"rgba(255,255,255,0.025)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:15, padding:18, marginBottom:14 }}>
              <div style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.45)", letterSpacing:1, marginBottom:13 }}>BADGE PROGRESSION</div>
              {[
                { key:"guardian",    icon:"🛡", label:"Guardian",    req:1, desc:"Report 1 confirmed scam" },
                { key:"scam_hunter", icon:"🏆", label:"Scam Hunter", req:2, desc:"Report 2+ confirmed scams — elite status" },
              ].map(({key,icon,label,req,desc})=>{
                const achieved = currentUser.scamsCaught >= req;
                const b = BADGES[key];
                return (
                  <div key={key} style={{ display:"flex", gap:12, alignItems:"center", padding:"12px", borderRadius:10, marginBottom:7, background:achieved?b.bg:"rgba(255,255,255,0.02)", border:`1px solid ${achieved?b.border:"rgba(255,255,255,0.05)"}` }}>
                    <div style={{ fontSize:21 }}>{icon}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:12, fontWeight:700, color:achieved?b.color:"rgba(255,255,255,0.42)", fontFamily:"'Syne',sans-serif" }}>{label}</div>
                      <div style={{ fontSize:11, color:"rgba(255,255,255,0.3)", marginTop:2 }}>{desc}</div>
                    </div>
                    {achieved ? <Pill color={b.color} bg={b.bg} border={b.border}>✓ Earned</Pill> : <Pill color="rgba(255,255,255,0.26)">{currentUser.scamsCaught}/{req}</Pill>}
                  </div>
                );
              })}
              {currentUser.scamsCaught === 0 && (
                <div style={{ fontSize:11, color:"rgba(255,255,255,0.28)", textAlign:"center", paddingTop:5 }}>
                  Submit a report and get it confirmed to start earning badges →{" "}
                  <button onClick={()=>setView("home")} style={{ background:"none", border:"none", color:"#00e5a0", cursor:"pointer", fontFamily:"inherit", fontSize:11 }}>Search businesses</button>
                </div>
              )}
            </div>
          )}

          <div style={{ textAlign:"center", fontSize:11, color:"rgba(255,255,255,0.2)" }}>{currentUser.email}</div>
        </div>
      </Shell>
    );
  }

  return <Shell><Nav /><div style={{ textAlign:"center", padding:60, color:"rgba(255,255,255,0.3)", fontSize:13 }}>Page not found.</div></Shell>;
}
