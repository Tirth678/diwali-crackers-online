"use client";
import { useEffect, useState } from "react";

export default function Page() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    import("./crackers-client").then((mod) => {
      if (mod.init) mod.init();
    });

    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {}
  };

  return (
    <div className="immersive">
      <div className="lights" aria-hidden="true">
        <span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span>
      </div>

      {/* Camera Stage — Fullscreen */}
      <div className="stage-wrap" id="stageWrap">
        <video id="video" autoPlay muted playsInline></video>
        <canvas id="displayCanvas" width={1280} height={720}></canvas>

        {/* Top stage chips */}
        <div className="stage-topbar">
          <div className="overlay-chip" id="activeChip">🎇 Active: <b id="activeName">Anar</b></div>
          <div className="overlay-chip"><span className="live"></span> LIVE CAM</div>
        </div>

        {/* Center bottom legend */}
        <div className="stage-bottom-center">
          <div className="cursor-legend">
            <div className="legend-item"><span className="legend-dot" style={{ background: "#00e676" }}></span> Left</div>
            <div className="legend-item"><span className="legend-dot" style={{ background: "#29b6f6" }}></span> Right</div>
            <div className="legend-item" id="fpsChip">30 FPS • <span id="detectedHands">0 hands</span></div>
          </div>
        </div>

        {/* Lightweight inline camera prompt — not a separate startup page */}
        <div className="camera-prompt" id="startMessage">
          <span className="prompt-dot"></span>
          <span>📷 Camera off</span>
          <button className="btn primary small" id="btnEnableCamera">Enable Camera</button>
          <span className="prompt-hint">Tap to allow • Video stays on device</span>
        </div>
        <div className="camera-prompt hidden" id="loadingMessage">
          <span className="spinner"></span>
          <span>Loading hand tracking…</span>
        </div>
      </div>

      {/* Floating Header — Glass */}
      <header className="header">
        <div className="header-inner">
          <div className="brand">
            <div className="logo">🪔</div>
            <div>
              <h1>Diwali <span>Crackers Online</span></h1>
              <p>Full-screen AR • Pinch to select • Double-pinch to burst</p>
            </div>
          </div>
          <div className="hdr-actions">
            <button className="btn" id="btnCamera"><span className="status-dot" id="camDot"></span> <span id="camLabel">Camera ON</span></button>
            <button className="btn" id="btnSound">🔊 Sound ON</button>
            <div className="vol-control" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(10,6,24,0.85)', padding: '6px 8px', borderRadius: '999px', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)' }}>
              <span style={{ fontSize: '10px' }}>🔊</span>
              <input id="volSlider" type="range" min="0" max="1" step="0.05" defaultValue="0.88" style={{ width: '72px', accentColor: '#ffd60a' }} />
              <span id="volLabel" style={{ fontSize: '10px', fontWeight: 700, minWidth: '28px' }}>88%</span>
            </div>
            <button className="btn small" id="btnClear">🧹 Clear</button>
            <button className="btn primary small" id="btnCelebrate">✨ Celebrate</button>
            <button className="btn small" onClick={toggleFullscreen} title="Fullscreen">
              {isFullscreen ? "↙ Exit" : "⛶ Full"}
            </button>
          </div>
        </div>
      </header>

      {/* HUD Overlays */}
      <div className="hud">
        <div className="hud-row">
          {/* Left — Quick Stats & Arsenal Mini */}
          <div className="hud-left">
            <div className="hud-card">
              <div className="hud-head">
                <h2>🧨 Arsenal</h2>
                <span className="hint" id="burstCountHint">0 bursts</span>
              </div>
              <div className="compact">
                <div className="stat-grid">
                  <div className="stat"><strong id="statPlaced">0</strong><span>Placed</span></div>
                  <div className="stat"><strong id="statBursts">0</strong><span>Bursts</span></div>
                  <div className="stat"><strong id="statStreak">0</strong><span>Streak</span></div>
                  <div className="stat"><strong id="statHands">—</strong><span>Gesture</span></div>
                </div>
                <div className="arsenal-list" id="arsenalList" style={{ marginTop: "8px" }}></div>
                <div className="quick-actions" style={{ marginTop: "8px" }}>
                  <button className="btn small" id="btnTopUp">+ Add 5</button>
                  <button className="btn small" id="btnBurstAll">💥 Burst All</button>
                </div>
              </div>
            </div>

            <div className="hud-card compact" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div className="hands-status" style={{ marginTop: 0, width: "100%" }}>
                <div className="hand-badge" id="leftHandBadge"><span className="dot"></span> LEFT — waiting</div>
                <div className="hand-badge right" id="rightHandBadge"><span className="dot"></span> RIGHT — waiting</div>
              </div>
            </div>
          </div>

          {/* Right — How to Play (collapsible-ish, transparent) */}
          <div className="hud-right">
            <div className="hud-card">
              <div className="hud-head">
                <h2>🎆 Cracker Shelf</h2>
                <span className="hint" id="shelfHint">Pinch & hover</span>
              </div>
              <div className="compact" style={{ display: "flex", gap: "8px", flexDirection: "column" }}>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  <button className="btn small" id="btnPlaceRandom">🎲 Random</button>
                  <button className="btn small" id="btnNightMode">🌙 Night</button>
                  <button className="btn small" id="btnSoundToggle2">🔊 Sound</button>
                </div>
                <div style={{ fontSize: "10px", color: "var(--muted)", lineHeight: 1.5 }}>
                  <b style={{ color: "var(--gold)" }}>Single pinch</b> = select/place &nbsp;•&nbsp; <b style={{ color: "var(--gold)" }}>Double pinch</b> = burst<br />
                  Tip: Mouse click = single, double-click = burst
                </div>
              </div>
            </div>

            <div className="gesture-guide">
              <h3>How to Play</h3>
              <div className="gesture-row">
                <div className="gesture-icon">👋</div>
                <div><b>Show both hands</b><p>Palms open, good lighting, 40-80cm away</p></div>
              </div>
              <div className="gesture-row">
                <div className="gesture-icon">👆</div>
                <div><b>Move cursor</b><p>Index fingertip glows — follows you</p></div>
              </div>
              <div className="gesture-row">
                <div className="gesture-icon">🤏</div>
                <div><b>Single Pinch</b><p>Shelf = select • Stage = place cracker</p></div>
              </div>
              <div className="gesture-row">
                <div className="gesture-icon">⚡⚡</div>
                <div><b>Double Pinch</b><p>Burst at cursor — on placed cracker = precise!</p></div>
              </div>
              <p style={{ fontSize: "9px", color: "var(--muted)", marginTop: "6px", textAlign: "center" }}>Fuljhadi streams while pinching • Rocket needs sky</p>
            </div>
          </div>
        </div>

        {/* Bottom Dock — Transparent Cracker Shelf */}
        <div className="hud-dock">
          <div className="dock-bar">
            <div className="dock-left">
              <span style={{ fontSize: "11px", fontWeight: 800, color: "var(--gold)", letterSpacing: ".6px" }}>🎆 SELECT CRACKER</span>
              <span className="hint" style={{ fontSize: "10px", color: "var(--muted)" }}>Single-tap shelf • Double-tap stage to burst</span>
            </div>
            <div className="dock-right">
              <span className="overlay-chip" style={{ fontSize: "10px", padding: "4px 8px" }}>🪔 Diwali AR</span>
            </div>
          </div>
          <div className="hud-card" style={{ padding: "10px" }}>
            <div className="shelf-grid" id="shelfGrid"></div>
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: "8px" }}>
            <span style={{ fontSize: "10px", color: "var(--muted)", background: "rgba(10,6,24,0.55)", padding: "4px 8px", borderRadius: "999px", border: "1px solid rgba(255,255,255,0.08)" }}>
              🎤 Camera + ✋ Hands = Magic • 💡 Good lighting helps • 🖱️ Mouse fallback always on
            </span>
          </div>
        </div>
      </div>

      <div className="rangoli">
        <span>🪔</span> <span>✨</span> <span>🌸</span> <span>🪔</span> <span>🎆</span> <span>🪔</span> <span>🌸</span> <span>✨</span> <span>🪔</span>
      </div>

      <div id="toast"></div>
    </div>
  );
}
