import { useState, useEffect, useRef } from "react";

function AudioBars() {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 28, flexShrink: 0 }}>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} style={{
          width: 4,
          background: "#fff",
          borderRadius: 2,
          animation: `bar${i} 0.8s ease-in-out infinite`,
          animationDelay: `${(i - 1) * 0.15}s`,
        }} />
      ))}
      <style>{`
        @keyframes bar1 { 0%,100%{height:6px} 50%{height:22px} }
        @keyframes bar2 { 0%,100%{height:14px} 50%{height:6px} }
        @keyframes bar3 { 0%,100%{height:10px} 50%{height:24px} }
        @keyframes bar4 { 0%,100%{height:20px} 50%{height:8px} }
      `}</style>
    </div>
  );
}

export default function Home() {
  const [userId, setUserId] = useState(null);
  const [track, setTrack] = useState(null);
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef(null);

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
    intervalRef.current = setInterval(fetchCurrent, 1000);
    return () => clearInterval(intervalRef.current);
  }, [userId]);

  if (!userId) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #1a1a1a 0%, #2c0000 100%)",
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
        background: "#111",
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
            filter: "blur(15px) brightness(0.5)",
          }} />
        )}
        {/* BLACK OVERLAY */}
        <div style={{
          position: "absolute",
          inset: 0,
          zIndex: 2,
          background: "rgba(0,0,0,0.2)",
        }} />
        {/* CONTENT */}
        <div style={{
          zIndex: 3,
          display: "flex",
          alignItems: "center",
          width: "100%",
          height: "100%",
          paddingLeft: 34,
          paddingRight: 36,
          gap: 30,
        }}>
          {/* AUDIO BARS */}
          {track?.isPlaying && <AudioBars />}

          {/* COVER */}
          <div style={{ flexShrink: 0 }}>
            {coverUrl ? (
              <img
                src={coverUrl}
                alt="cover"
                width={125}
                height={125}
                style={{
                  borderRadius: 30,
                  boxShadow: "0 2px 18px #0008",
                  objectFit: "cover",
                  border: "2.5px solid #333",
                  display: "block",
                }}
              />
            ) : (
              <div style={{
                width: 125,
                height: 125,
                borderRadius: 30,
                background: "#232323",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#aaa",
                fontSize: 40,
              }}>
                ♪
              </div>
            )}
          </div>

          {/* TRACK INFOS */}
          <div style={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            gap: 4,
            justifyContent: "center",
          }}>
            {loading && !track ? (
              <div style={{
                width: 32, height: 32,
                border: "4px solid #ffffff22",
                borderTop: "4px solid #fff",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }} />
            ) : track?.isPlaying ? (
              <>
                <div style={{
                  fontWeight: 700,
                  fontSize: 28,
                  color: "#fff",
                  letterSpacing: "-.5px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}>
                  {track.title}
                </div>
                <div style={{
                  color: "#d51007",
                  fontWeight: 600,
                  fontSize: 19,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}>
                  {track.artist}
                </div>
                <div style={{
                  color: "#b7b7b7",
                  fontWeight: 500,
                  fontSize: 16,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  marginBottom: 10,
                }}>
                  {track.album}
                </div>
                {/* PROGRESS BAR */}
                <div style={{
                  width: "100%",
                  height: 6,
                  borderRadius: 3,
                  background: "#ffffff33",
                  overflow: "hidden",
                }}>
                  <div style={{
                    height: "100%",
                    background: "#fff",
                    borderRadius: 3,
                    animation: "progress 30s linear infinite",
                  }} />
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

      <style>{`
        @keyframes progress { 0%{width:0%} 100%{width:100%} }
        @keyframes spin { to{transform:rotate(360deg)} }
      `}</style>
    </div>
  );
}
