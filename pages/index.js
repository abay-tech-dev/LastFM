import { useState, useEffect, useRef } from "react";

const GREEN = "#1db954";

function AudioBars() {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 28, flexShrink: 0 }}>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} style={{
          width: 4,
          background: GREEN,
          borderRadius: 2,
          animation: `bar${i} 0.8s ease-in-out infinite`,
          animationDelay: `${(i - 1) * 0.15}s`,
        }} />
      ))}
      <style>{`
        @keyframes bar1 { 0%,100%{height:5px}  50%{height:22px} }
        @keyframes bar2 { 0%,100%{height:14px} 50%{height:5px}  }
        @keyframes bar3 { 0%,100%{height:9px}  50%{height:24px} }
        @keyframes bar4 { 0%,100%{height:20px} 50%{height:7px}  }
      `}</style>
    </div>
  );
}

function formatTime(ms) {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

export default function Home() {
  const [userId, setUserId] = useState(null);
  const [track, setTrack] = useState(null);
  const [loading, setLoading] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef(null);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const currentTitleRef = useRef(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("userId");
    if (id) setUserId(id);
  }, []);

  useEffect(() => {
    if (!userId) return;

    const fetchCurrent = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/lastfm/current?userId=${userId}`);
        const data = await res.json();
        setTrack(data);
      } catch {
        setTrack(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrent();
    intervalRef.current = setInterval(fetchCurrent, 5000);
    return () => clearInterval(intervalRef.current);
  }, [userId]);

  // Reset elapsed timer when track changes
  useEffect(() => {
    if (track?.isPlaying && track.title !== currentTitleRef.current) {
      currentTitleRef.current = track.title;
      startTimeRef.current = Date.now();
      setElapsed(0);
    }
    if (!track?.isPlaying) {
      currentTitleRef.current = null;
      startTimeRef.current = null;
      setElapsed(0);
    }
  }, [track?.title, track?.isPlaying]);

  // Local elapsed counter
  useEffect(() => {
    if (!track?.isPlaying) {
      clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      if (startTimeRef.current) setElapsed(Date.now() - startTimeRef.current);
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [track?.isPlaying, track?.title]);

  if (!userId) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#111",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}>
        <div style={{
          background: "#222",
          borderRadius: 20,
          padding: "48px 40px",
          textAlign: "center",
          maxWidth: 400,
          boxShadow: "0 8px 40px #0008",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
        }}>
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="24" fill="#d51007" />
            <text x="50%" y="54%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="22" fontWeight="bold">♪</text>
          </svg>
          <h1 style={{ color: "#fff", fontSize: 24, margin: 0 }}>Last.fm Now Playing</h1>
          <p style={{ color: "#aaa", fontSize: 14, lineHeight: 1.5, margin: 0 }}>
            Connecte ton compte Last.fm pour afficher la musique que tu écoutes en temps réel.
          </p>
          <a href="/api/auth/lastfm/login" style={{
            marginTop: 8,
            padding: "12px 28px",
            background: "#d51007",
            color: "#fff",
            borderRadius: 50,
            textDecoration: "none",
            fontWeight: 600,
            fontSize: 15,
          }}>
            Se connecter avec Last.fm
          </a>
        </div>
      </div>
    );
  }

  const coverUrl = track?.albumImageUrl;
  const progress = track?.durationMs > 0 ? Math.min(elapsed / track.durationMs, 1) : 0;

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#111",
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      <div style={{
        width: 800,
        height: 200,
        position: "relative",
        borderRadius: 40,
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        boxShadow: "0 8px 40px #0008",
        background: "#181818",
        color: "#fff",
      }}>
        {/* BACKGROUND BLUR */}
        {coverUrl && (
          <div style={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            backgroundImage: `url(${coverUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(15px) brightness(0.35)",
          }} />
        )}
        {/* OVERLAY */}
        <div style={{ position: "absolute", inset: 0, zIndex: 2, background: "rgba(0,0,0,0.15)" }} />

        {/* CONTENT */}
        <div style={{
          zIndex: 3,
          display: "flex",
          alignItems: "center",
          width: "100%",
          height: "100%",
          paddingLeft: 34,
          paddingRight: 36,
          gap: 24,
        }}>
          {/* AUDIO BARS */}
          {track?.isPlaying && <AudioBars />}

          {/* COVER */}
          <div style={{ flexShrink: 0 }}>
            {coverUrl ? (
              <img
                src={coverUrl}
                alt="cover"
                width={130}
                height={130}
                style={{
                  borderRadius: 16,
                  boxShadow: "0 4px 24px #0009",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            ) : (
              <div style={{
                width: 130,
                height: 130,
                borderRadius: 16,
                background: "#2a2a2a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 40,
                color: "#555",
              }}>♪</div>
            )}
          </div>

          {/* TRACK INFOS */}
          <div style={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 2,
          }}>
            {loading && !track ? (
              <div style={{
                width: 28, height: 28,
                border: "3px solid #ffffff22",
                borderTop: `3px solid #fff`,
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }} />
            ) : track?.isPlaying ? (
              <>
                <div style={{
                  fontWeight: 700,
                  fontSize: 30,
                  color: "#fff",
                  letterSpacing: "-.5px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  lineHeight: 1.2,
                }}>
                  {track.title}
                </div>
                <div style={{
                  color: GREEN,
                  fontWeight: 600,
                  fontSize: 19,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  marginTop: 2,
                }}>
                  {track.artist}
                </div>
                <div style={{
                  color: "#b7b7b7",
                  fontWeight: 400,
                  fontSize: 16,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  marginTop: 1,
                }}>
                  {track.album}
                </div>

                {/* PROGRESS BAR + TIMER */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 14 }}>
                  <div style={{
                    flex: 1,
                    height: 6,
                    borderRadius: 3,
                    background: "#ffffff33",
                    overflow: "hidden",
                  }}>
                    <div style={{
                      height: "100%",
                      width: `${progress * 100}%`,
                      background: "#fff",
                      borderRadius: 3,
                      transition: "width 1s linear",
                    }} />
                  </div>
                  {track.durationMs > 0 && (
                    <span style={{
                      fontSize: 15,
                      color: "#fff",
                      whiteSpace: "nowrap",
                      fontVariantNumeric: "tabular-nums",
                      letterSpacing: "0.3px",
                      flexShrink: 0,
                    }}>
                      {formatTime(elapsed)}<span style={{ color: "#b7b7b7" }}> / </span>{formatTime(track.durationMs)}
                    </span>
                  )}
                </div>
              </>
            ) : (
              <div style={{ color: "#aaa", fontStyle: "italic", fontSize: 18 }}>
                Aucune lecture détectée
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
