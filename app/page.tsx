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
    <div className="immersive minimal">
      {/* Fullscreen Camera */}
      <div className="stage-wrap" id="stageWrap">
        <video id="video" autoPlay muted playsInline></video>
        <canvas id="displayCanvas" width={960} height={540}></canvas>

        {/* Minimal top glass — only active + sound + fullscreen */}
        <div className="top-glass">
          <div className="brand-glass">
            <span className="logo-mini">🪔</span>
            <span className="brand-text">Diwali <b>Crackers</b></span>
            <span className="chip-glass" id="activeChip" style={{ marginLeft: 8 }}>
              <span id="camDot" className="status-dot" style={{ marginRight: 6 }}></span>
              <b id="activeName">Anar</b> <span id="camLabel" style={{ opacity: 0.7, fontSize: 10, marginLeft: 4 }}>• Camera ON</span>
            </span>
          </div>
          <div className="actions-glass">
            <button className="glass-btn" id="btnSound" title="Sound">🔊</button>
            <button className="glass-btn" id="btnClear" title="Clear">🧹</button>
            <button className="glass-btn" onClick={toggleFullscreen} title="Fullscreen">
              {isFullscreen ? "↙" : "⛶"}
            </button>
          </div>
        </div>

        {/* Focused hand tracking zone */}
        <div className="hand-focus" id="handFocus" aria-hidden="true">
          <div className="focus-frame">
            <span className="focus-label">👋 Center hands here</span>
            <span className="focus-sub">Keep both hands 40-70cm away • Good light</span>
          </div>
        </div>

        {/* Lightweight camera prompt */}
        <div className="camera-prompt" id="startMessage">
          <span className="prompt-dot"></span>
          <span>📷 Tap Allow</span>
          <button className="glass-btn small primary" id="btnEnableCamera" style={{ padding: "6px 10px" }}>Allow Camera</button>
        </div>
        <div className="camera-prompt hidden" id="loadingMessage">
          <span className="spinner"></span>
          <span>Loading hands…</span>
        </div>
      </div>

      {/* Bottom Dock — Only firecracker selection (minimal glass) */}
      <div className="bottom-dock glass">
        <div className="dock-head">
          <span className="dock-title">🎆 SELECT CRACKER</span>
          <span className="dock-hint">1-tap place • 2-tap burst • 3-tap / 3-finger cycle</span>
          <span id="fpsChip" className="fps-mini">— FPS</span>
        </div>
        <div className="shelf-grid" id="shelfGrid"></div>
      </div>

      <div id="toast"></div>

      {/* Hidden fallbacks for JS (kept in DOM but not visible to save null checks) */}
      <div style={{ display: "none" }} aria-hidden>
        <span id="statPlaced">0</span><span id="statBursts">0</span><span id="statStreak">0</span><span id="statHands">—</span><span id="burstCountHint"></span><span id="shelfHint"></span><div id="arsenalList"></div><div id="detectedHands"></div><div id="leftHandBadge"></div><div id="rightHandBadge"></div><button id="btnSoundToggle2"></button><button id="btnCelebrate"></button><button id="btnPlaceRandom"></button><button id="btnBurstAll"></button><button id="btnNightMode"></button><button id="btnTopUp"></button><div id="volSlider"></div><div id="volLabel"></div><div id="camDot"></div>
      </div>
    </div>
  );
}
