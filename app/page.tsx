"use client";
import { useEffect } from "react";

export default function Page() {
  useEffect(() => {
    // Inject main.js logic - we will inline the entire src/main.js code here for reliability
    // Use dynamic import of the source file as plain JS? Instead we run the logic directly.
    // To avoid duplication, we load /src/main.js as a module via import()
    // But Next serves static files from /public, not /src, so we copy the logic inline.
    // For simplicity, we fetch the script and eval it.
    // The src/main.js file is still available at /src/main.js in dev via vite, but in Next it's not served.
    // So we embed the logic by importing a helper module we'll create at app/crackers-client.ts

    // Dynamically import client logic
    import("./crackers-client").then((mod) => {
      if (mod.init) mod.init();
    });
  }, []);

  // The HTML structure - converted from index.html body to JSX with className
  return (
    <>
      <div className="lights" aria-hidden="true">
        <span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span>
      </div>

      <header>
        <div className="header-inner">
          <div className="brand">
            <div className="logo">🪔</div>
            <div>
              <h1>Diwali <span>Crackers Online</span></h1>
              <p>Hand-gesture celebration • Single tap to select • Double tap to burst</p>
            </div>
          </div>
          <div className="hdr-actions">
            <button className="btn" id="btnCamera"><span className="status-dot" id="camDot"></span> <span id="camLabel">Camera ON</span></button>
            <button className="btn" id="btnSound">🔊 Sound ON</button>
            <button className="btn small" id="btnClear">🧹 Clear Stage</button>
            <button className="btn primary small" id="btnCelebrate">✨ Auto Celebrate</button>
          </div>
        </div>
      </header>

      <main>
        {/* Left: Shelf */}
        <section className="panel">
          <div className="panel-head">
            <h2>🎆 Cracker Shelf</h2>
            <span className="hint" id="shelfHint">Show hand & pinch</span>
          </div>
          <div className="panel-body">
            <div className="shelf-grid" id="shelfGrid"></div>

            <div className="gesture-guide">
              <h3>How to Play</h3>
              <div className="gesture-row">
                <div className="gesture-icon">👋</div>
                <div><b>Show both hands</b><p>Camera tracks left & right hands separately. Keep palms open, fingers visible.</p></div>
              </div>
              <div className="gesture-row">
                <div className="gesture-icon">👆</div>
                <div><b>Move cursor</b><p>Your index fingertip is the cursor. Glow follows your hand on camera.</p></div>
              </div>
              <div className="gesture-row">
                <div className="gesture-icon">🤏</div>
                <div><b>Single Pinch = Select / Place</b><p>Bring thumb + index together briefly. On shelf = select cracker. On stage = place it.</p></div>
              </div>
              <div className="gesture-row">
                <div className="gesture-icon">⚡⚡</div>
                <div><b>Double Pinch = FIRE!</b><p>Two quick pinches on stage burst the cracker. Try on placed crackers!</p></div>
              </div>

              <div className="hands-status">
                <div className="hand-badge" id="leftHandBadge"><span className="dot"></span> LEFT HAND — waiting</div>
                <div className="hand-badge right" id="rightHandBadge"><span className="dot"></span> RIGHT HAND — waiting</div>
              </div>
              <p style={{ fontSize: "10px", color: "var(--muted)", marginTop: "8px", textAlign: "center" as const }}>Tip: If camera fails, use mouse / touch — same tap & double-tap works!</p>
            </div>
          </div>
        </section>

        {/* Center: Stage */}
        <section className="panel stage-panel">
          <div className="panel-head">
            <h2>📸 Camera Stage</h2>
            <span className="hint" id="stageHint">Mirrored • particles overlay</span>
          </div>
          <div className="stage-wrap" id="stageWrap">
            <video id="video" autoPlay muted playsInline></video>
            <canvas id="displayCanvas" width={1280} height={720}></canvas>

            <div className="stage-topbar">
              <div className="overlay-chip" id="activeChip">🎇 Active: <b id="activeName">Anar</b></div>
              <div className="overlay-chip"><span className="live"></span> LIVE CAM</div>
            </div>

            <div className="stage-bottom">
              <div className="cursor-legend">
                <div className="legend-item"><span className="legend-dot" style={{ background: "#00e676" }}></span> Left cursor</div>
                <div className="legend-item"><span className="legend-dot" style={{ background: "#29b6f6" }}></span> Right cursor</div>
              </div>
              <div className="overlay-chip" id="fpsChip">30 FPS • <span id="detectedHands">0 hands</span></div>
            </div>

            <div className="stage-message" id="startMessage">
              <h3>🪔 Welcome to Diwali Celebration!</h3>
              <p>Allow camera access to play with hand gestures.<br />Or click <b>Enable Camera</b> below.<br />Mouse/touch works instantly as fallback.</p>
              <button className="btn primary" id="btnEnableCamera" style={{ marginTop: "10px" }}>📷 Enable Camera</button>
              <p style={{ marginTop: "8px", fontSize: "10px", opacity: 0.7 }}>Your video stays on device — never uploaded.</p>
            </div>

            <div className="stage-message hidden" id="loadingMessage">
              <h3>⏳ Loading hand tracking...</h3>
              <p>Downloading AI model (≈ 5-10s). If stuck, you can still use mouse.</p>
            </div>
          </div>

          <div className="stage-controls">
            <div className="control-left">
              <button className="btn small" id="btnPlaceRandom">🎲 Place Random</button>
              <button className="btn small" id="btnBurstAll">💥 Burst All</button>
              <button className="btn small" id="btnNightMode">🌙 Night Mode</button>
            </div>
            <div className="mic-hint">🎤 Camera + ✋ Hands = Magic • 💡 Good lighting helps</div>
          </div>
        </section>

        {/* Right: Arsenal */}
        <section className="panel right-panel">
          <div style={{ padding: "14px" }}>
            <div className="panel-head" style={{ margin: "-14px -14px 12px", padding: "14px 16px" }}>
              <h2>🧨 Your Arsenal</h2>
              <span className="hint" id="burstCountHint">0 bursts</span>
            </div>

            <div className="stat-grid">
              <div className="stat">
                <strong id="statPlaced">0</strong><span>Placed</span>
              </div>
              <div className="stat">
                <strong id="statBursts">0</strong><span>Bursts</span>
              </div>
              <div className="stat">
                <strong id="statStreak">0</strong><span>Streak</span>
              </div>
              <div className="stat">
                <strong id="statHands">—</strong><span>Gesture mode</span>
              </div>
            </div>

            <div className="arsenal-list" id="arsenalList"></div>

            <div className="quick-actions">
              <button className="btn small" id="btnTopUp">+ Add 5 Random</button>
              <button className="btn small" id="btnSoundToggle2">🔊 Sound</button>
            </div>

            <div style={{ marginTop: "14px", background: "#0a0618", border: "1px solid #ffffff10", borderRadius: "12px", padding: "10px" }}>
              <h4 style={{ fontSize: "12px", color: "var(--gold)", marginBottom: "6px" }}>🎉 Celebration Tips</h4>
              <ul style={{ fontSize: "11px", color: "var(--muted)", lineHeight: 1.6, paddingLeft: "14px" }}>
                <li>Double-tap on a placed cracker for precise bursts</li>
                <li>Try two hands — burst two crackers at once!</li>
                <li>Fuljhadi follows your hand — keep pinching</li>
                <li>Rocket needs sky — place near bottom, double-tap</li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      <div className="rangoli">
        <span>🪔</span> <span>✨</span> <span>🌸</span> <span>🪔</span> <span>🎆</span> <span>🪔</span> <span>🌸</span> <span>✨</span> <span>🪔</span>
      </div>

      <div id="toast"></div>
    </>
  );
}
