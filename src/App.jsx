import { useState, useRef, useEffect } from "react";

const SYSTEM_PROMPT = `Aap "Qadeer's Assistant" hain — Qadeer bhai ke liye specially banaya gaya ek friendly aur smart AI assistant!

Aapki personality:
- Bohot friendly aur warm ho — jaise ek purana dost ho
- Thodi humor bhi rakhein lekin professional bhi raho
- Hamesha encourage karo aur positive raho
- Urdu aur English mix (Roman Urdu) mein baat karo
- Qadeer bhai ko "Qadeer bhai" keh ke address karo

Aap in tasks mein expert hain:
- Online Marketing: Social media captions, ad copy, email campaigns, SEO
- Content Writing: Blog posts, product descriptions, video scripts
- Research: Topics, competitors, trends
- Planning: Business strategies, schedules, to-do lists
- Communication: Professional emails, proposals, client messages
- Brainstorming: Creative ideas, campaign concepts, slogans`;

const QUICK_TASKS = [
  { icon: "📢", label: "Marketing Post", prompt: "Mera ek zabardast Instagram marketing post likho" },
  { icon: "📧", label: "Email Draft", prompt: "Client ko professional email draft karo" },
  { icon: "💡", label: "Ideas", prompt: "Mere business ke liye 10 creative ideas do" },
  { icon: "📝", label: "Blog Post", prompt: "Ek engaging blog post outline banao" },
  { icon: "📊", label: "Strategy", prompt: "30-day social media growth strategy banao" },
  { icon: "🎯", label: "Ad Copy", prompt: "Facebook ad ke liye compelling copy likho" },
];

function TypingDots() {
  return (
    <div style={{ display: "flex", gap: 5, padding: "14px 18px", alignItems: "center" }}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{ width: 9, height: 9, borderRadius: "50%", background: "linear-gradient(135deg, #f0abfc, #818cf8)", animation: "dotBounce 1.3s ease-in-out infinite", animationDelay: `${i * 0.18}s` }} />
      ))}
      <span style={{ fontSize: 12, color: "#94a3b8", marginLeft: 4 }}>Soch raha hoon...</span>
    </div>
  );
}

function Avatar({ isUser }) {
  return (
    <div style={{ width: 38, height: 38, borderRadius: "50%", flexShrink: 0, background: isUser ? "linear-gradient(135deg, #0ea5e9, #38bdf8)" : "linear-gradient(135deg, #c026d3, #818cf8, #06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, marginTop: 2, boxShadow: isUser ? "0 0 16px rgba(14,165,233,0.4)" : "0 0 16px rgba(192,38,211,0.45)", border: "2px solid rgba(255,255,255,0.12)" }}>
      {isUser ? "👤" : "✨"}
    </div>
  );
}

function Message({ msg, isNew }) {
  const isUser = msg.role === "user";
  return (
    <div style={{ display: "flex", gap: 10, justifyContent: isUser ? "flex-end" : "flex-start", marginBottom: 18, animation: isNew ? "msgIn 0.35s cubic-bezier(0.34,1.56,0.64,1)" : "none" }}>
      {!isUser && <Avatar isUser={false} />}
      <div style={{ maxWidth: "74%", padding: "13px 17px", borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px", background: isUser ? "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)" : "rgba(255,255,255,0.06)", border: isUser ? "1px solid rgba(139,92,246,0.4)" : "1px solid rgba(255,255,255,0.09)", color: "#f1f5f9", fontSize: 14, lineHeight: 1.75, whiteSpace: "pre-wrap", wordBreak: "break-word", boxShadow: isUser ? "0 8px 24px rgba(124,58,237,0.35)" : "0 4px 16px rgba(0,0,0,0.2)" }}>
        {msg.content}
      </div>
      {isUser && <Avatar isUser={true} />}
    </div>
  );
}

export default function App() {
  const [messages, setMessages] = useState([{ role: "assistant", content: "Assalam o Alaikum Qadeer bhai! 🌟\n\nMain hoon aapka personal AI Assistant — hamesha haazir, hamesha tayar!\n\nMarketing ho, content ho, emails hon ya koi bhi online kaam — bas hukm karein, main foran lag jaata hoon! 💪\n\nAaj kya kaam hai? 😊" }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [newMsgIdx, setNewMsgIdx] = useState(null);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  const send = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput("");
    setError("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    const updated = [...messages, { role: "user", content: msg }];
    setMessages(updated);
    setNewMsgIdx(updated.length - 1);
    setLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, system: SYSTEM_PROMPT, messages: updated.map((m) => ({ role: m.role, content: m.content })) }),
      });
      const data = await res.json();
      const reply = data.content?.find((b) => b.type === "text")?.text || "Kuch masla aa gaya!";
      const final = [...updated, { role: "assistant", content: reply }];
      setMessages(final);
      setNewMsgIdx(final.length - 1);
    } catch {
      setError("⚠️ Connection issue. Dobara try karein.");
    } finally {
      setLoading(false);
      textareaRef.current?.focus();
    }
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#07080f", overflow: "hidden", position: "relative" }}>
      <style>{`
        @keyframes dotBounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-7px)} }
        @keyframes msgIn { from{opacity:0;transform:translateY(12px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes orbFloat { 0%,100%{transform:translate(0,0)} 50%{transform:translate(30px,-20px)} }
        @keyframes orbFloat2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-25px,15px)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes headerGlow { 0%,100%{opacity:0.7} 50%{opacity:1} }
        ::-webkit-scrollbar{width:3px} ::-webkit-scrollbar-thumb{background:rgba(192,38,211,0.4);border-radius:2px}
        * { box-sizing:border-box; }
        .qbtn:hover{background:rgba(192,38,211,0.2)!important;transform:translateY(-1px);}
        .qbtn{transition:all 0.2s ease;}
        .sbtn:hover:not(:disabled){transform:scale(1.06);}
        .sbtn{transition:all 0.2s ease;}
        textarea{resize:none;outline:none;}
      `}</style>
      <div style={{ position:"absolute", width:500, height:500, borderRadius:"50%", background:"#c026d3", top:-150, left:-100, filter:"blur(80px)", opacity:0.15, animation:"orbFloat 8s ease-in-out infinite", pointerEvents:"none" }} />
      <div style={{ position:"absolute", width:400, height:400, borderRadius:"50%", background:"#4f46e5", bottom:-100, right:-80, filter:"blur(80px)", opacity:0.15, animation:"orbFloat2 10s ease-in-out infinite", pointerEvents:"none" }} />
      <div style={{ position:"relative", zIndex:10, padding:"16px 22px", borderBottom:"1px solid rgba(255,255,255,0.07)", background:"rgba(7,8,15,0.75)", backdropFilter:"blur(24px)", display:"flex", alignItems:"center", gap:14 }}>
        <div style={{ width:50, height:50, borderRadius:"50%", background:"linear-gradient(135deg,#c026d3,#818cf8,#22d3ee)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, boxShadow:"0 0 28px rgba(192,38,211,0.5)", border:"2px solid rgba(255,255,255,0.15)", animation:"headerGlow 3s ease-in-out infinite" }}>✨</div>
        <div style={{ flex:1 }}>
          <div style={{ fontFamily:"Georgia,serif", fontWeight:700, fontSize:18, background:"linear-gradient(135deg,#f0abfc,#c7d2fe,#67e8f9)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Qadeer's Assistant</div>
          <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:2 }}>
            <div style={{ width:7, height:7, borderRadius:"50%", background:"#4ade80", animation:"pulse 2s infinite", boxShadow:"0 0 6px #4ade80" }} />
            <span style={{ fontSize:11, color:"#94a3b8" }}>Online · Hamesha Haazir</span>
          </div>
        </div>
      </div>
      <div style={{ position:"relative", zIndex:10, padding:"10px 18px", borderBottom:"1px solid rgba(255,255,255,0.05)", display:"flex", gap:7, overflowX:"auto", scrollbarWidth:"none", background:"rgba(7,8,15,0.5)" }}>
        {QUICK_TASKS.map((t, i) => (
          <button key={i} className="qbtn" onClick={() => send(t.prompt)} style={{ flexShrink:0, padding:"7px 13px", background:"rgba(192,38,211,0.08)", border:"1px solid rgba(192,38,211,0.25)", borderRadius:20, color:"#e879f9", fontSize:11.5, cursor:"pointer", display:"flex", alignItems:"center", gap:5, whiteSpace:"nowrap" }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>
      <div style={{ flex:1, overflowY:"auto", position:"relative", zIndex:5, padding:"20px 18px 8px" }}>
        {messages.map((msg, i) => <Message key={i} msg={msg} isNew={i === newMsgIdx} />)}
        {loading && (
          <div style={{ display:"flex", gap:10, alignItems:"flex-start", animation:"fadeIn 0.3s ease", marginBottom:16 }}>
            <Avatar isUser={false} />
            <div style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.09)", borderRadius:"18px 18px 18px 4px" }}>
              <TypingDots />
            </div>
          </div>
        )}
        {error && <div style={{ padding:"10px 14px", marginBottom:12, background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.2)", borderRadius:12, color:"#fca5a5", fontSize:13 }}>{error}</div>}
        <div ref={bottomRef} />
      </div>
      <div style={{ position:"relative", zIndex:10, padding:"14px 18px 18px", background:"rgba(7,8,15,0.75)", backdropFilter:"blur(24px)", borderTop:"1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display:"flex", gap:10, alignItems:"flex-end", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(192,38,211,0.3)", borderRadius:18, padding:"11px 14px" }}>
          <textarea ref={textareaRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} onInput={(e) => { e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 130) + "px"; }} placeholder="Qadeer bhai, kya kaam hai aaj? ✨" rows={1} style={{ flex:1, background:"transparent", border:"none", outline:"none", color:"#f1f5f9", fontSize:14, lineHeight:1.6, fontFamily:"sans-serif", resize:"none", maxHeight:130, overflowY:"auto" }} />
          <button className="sbtn" onClick={() => send()} disabled={loading || !input.trim()} style={{ width:42, height:42, borderRadius:"50%", border:"none", cursor: loading || !input.trim() ? "not-allowed" : "pointer", background: loading || !input.trim() ? "rgba(192,38,211,0.2)" : "linear-gradient(135deg,#c026d3,#818cf8)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>
            {loading ? "⏳" : "🚀"}
          </button>
        </div>
        <div style={{ textAlign:"center", marginTop:8, fontSize:11, color:"#334155" }}>Enter = Bhejo · Shift+Enter = Agla line</div>
      </div>
    </div>
  );
      }
