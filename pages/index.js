import { useState, useEffect, useRef } from "react";

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

  const formatTime = (ms) => {
    const totalSec = Math.floor(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${min}:${sec.toString().padStart(2, "0")}`;
  };

  // Page d'accueil : connexion Last.fm
  if (!userId) {
    return (
      <div style={styles.landingWrapper}>
        <div style={styles.landingCard}>
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="24" fill="#d51007" />
            <text x="50%" y="54%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="22" fontWeight="bold">
              ♪
            </text>
          </svg>
          <h1 style={styles.landingTitle}>Last.fm Now Playing</h1>
          <p style={styles.landingDesc}>
            Connecte ton compte Last.fm pour afficher la musique que tu écoutes en temps réel.
          </p>
          <a href="/api/auth/lastfm/login" style={styles.connectBtn}>
            Se connecter avec Last.fm
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.widgetWrapper}>
      <div style={styles.widget}>
        {/* Image album */}
        {track?.isPlaying && track.albumImageUrl && (
          <div style={styles.bgBlur(track.albumImageUrl)} />
        )}

        <div style={styles.content}>
          {/* Artwork */}
          <div style={styles.artworkContainer}>
            {track?.isPlaying && track.albumImageUrl ? (
              <img src={track.albumImageUrl} alt="Album art" style={styles.artwork} />
            ) : (
              <div style={styles.artworkPlaceholder}>♪</div>
            )}
          </div>

          {/* Infos piste */}
          <div style={styles.trackInfo}>
            {loading && !track ? (
              <div style={styles.spinner} />
            ) : track?.isPlaying ? (
              <>
                <div style={styles.nowPlayingRow}>
                  {/* Barres d'animation Last.fm */}
                  <div style={styles.barsContainer}>
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} style={styles.bar(i)} />
                    ))}
                  </div>
                  <span style={styles.nowPlayingLabel}>EN LECTURE</span>
                </div>
                <p style={styles.trackTitle}>{track.title}</p>
                <p style={styles.artistName}>{track.artist}</p>
                <p style={styles.albumName}>{track.album}</p>

                {/* Barre de progression animée */}
                <div style={styles.progressBar}>
                  <div style={styles.progressFill} />
                </div>
              </>
            ) : (
              <p style={styles.noPlayback}>Aucune lecture détectée</p>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bar1 { 0%,100%{height:6px} 50%{height:18px} }
        @keyframes bar2 { 0%,100%{height:14px} 50%{height:6px} }
        @keyframes bar3 { 0%,100%{height:10px} 50%{height:20px} }
        @keyframes bar4 { 0%,100%{height:18px} 50%{height:8px} }
        @keyframes progress { 0%{width:0%} 100%{width:100%} }
        @keyframes spin { to{transform:rotate(360deg)} }
      `}</style>
    </div>
  );
}

const RED = "#d51007";
const DARK = "#1a1a1a";

const styles = {
  landingWrapper: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #1a1a1a 0%, #2c0000 100%)",
    fontFamily: "'Segoe UI', sans-serif",
  },
  landingCard: {
    background: "#222",
    borderRadius: 16,
    padding: "48px 40px",
    textAlign: "center",
    maxWidth: 400,
    boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 16,
  },
  landingTitle: { color: "#fff", fontSize: 24, margin: 0 },
  landingDesc: { color: "#aaa", fontSize: 14, lineHeight: 1.5, margin: 0 },
  connectBtn: {
    display: "inline-block",
    marginTop: 8,
    padding: "12px 28px",
    background: RED,
    color: "#fff",
    borderRadius: 50,
    textDecoration: "none",
    fontWeight: 600,
    fontSize: 15,
    transition: "opacity 0.2s",
  },
  widgetWrapper: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: DARK,
    fontFamily: "'Segoe UI', sans-serif",
  },
  widget: {
    position: "relative",
    width: 800,
    height: 200,
    background: "#191414",
    borderRadius: 16,
    overflow: "hidden",
    boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
  },
  bgBlur: (url) => ({
    position: "absolute",
    inset: 0,
    backgroundImage: `url(${url})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    filter: "blur(24px) brightness(0.3)",
    zIndex: 0,
  }),
  content: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    alignItems: "center",
    height: "100%",
    padding: "0 24px",
    gap: 24,
  },
  artworkContainer: {
    flexShrink: 0,
    width: 150,
    height: 150,
    borderRadius: 8,
    overflow: "hidden",
    boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
  },
  artwork: { width: "100%", height: "100%", objectFit: "cover" },
  artworkPlaceholder: {
    width: "100%",
    height: "100%",
    background: "#333",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 48,
    color: "#555",
  },
  trackInfo: { flex: 1, color: "#fff", overflow: "hidden" },
  nowPlayingRow: { display: "flex", alignItems: "center", gap: 8, marginBottom: 8 },
  nowPlayingLabel: { fontSize: 11, color: RED, fontWeight: 700, letterSpacing: 1.5 },
  barsContainer: { display: "flex", alignItems: "flex-end", gap: 2, height: 20 },
  bar: (i) => ({
    width: 3,
    height: 6,
    background: RED,
    borderRadius: 2,
    animation: `bar${i} 0.8s ease-in-out infinite`,
    animationDelay: `${(i - 1) * 0.15}s`,
  }),
  trackTitle: {
    fontSize: 22,
    fontWeight: 700,
    margin: "0 0 4px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  artistName: {
    fontSize: 15,
    color: "#ccc",
    margin: "0 0 2px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  albumName: {
    fontSize: 13,
    color: "#888",
    margin: "0 0 12px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  progressBar: {
    height: 4,
    background: "#444",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    background: RED,
    borderRadius: 2,
    animation: "progress 30s linear infinite",
  },
  noPlayback: { color: "#666", fontSize: 16 },
  spinner: {
    width: 32,
    height: 32,
    border: `3px solid #333`,
    borderTop: `3px solid ${RED}`,
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
};
