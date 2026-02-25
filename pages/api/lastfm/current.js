import axios from "axios";
import dbConnect from "../../../lib/mongodb";
import User from "../../../models/User";

export default async function handler(req, res) {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: "Missing userId" });
  }

  try {
    await dbConnect();
    const user = await User.findOne({ lastfmUsername: userId });

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    const { data } = await axios.get("https://ws.audioscrobbler.com/2.0/", {
      params: {
        method: "user.getRecentTracks",
        user: user.lastfmUsername,
        api_key: process.env.LASTFM_API_KEY,
        format: "json",
        limit: 1,
      },
    });

    const tracks = data.recenttracks?.track;
    if (!tracks || tracks.length === 0) {
      return res.status(200).json({ isPlaying: false });
    }

    const track = Array.isArray(tracks) ? tracks[0] : tracks;
    const isPlaying = track["@attr"]?.nowplaying === "true";

    if (!isPlaying) {
      return res.status(200).json({ isPlaying: false });
    }

    const albumImage = track.image?.find((img) => img.size === "extralarge")?.["#text"] || "";

    const { data: trackInfo } = await axios.get("https://ws.audioscrobbler.com/2.0/", {
      params: {
        method: "track.getInfo",
        artist: track.artist["#text"],
        track: track.name,
        api_key: process.env.LASTFM_API_KEY,
        format: "json",
      },
    });
    const durationMs = parseInt(trackInfo?.track?.duration) || 0;

    return res.status(200).json({
      isPlaying: true,
      title: track.name,
      artist: track.artist["#text"],
      album: track.album["#text"],
      albumImageUrl: albumImage,
      songUrl: track.url,
      durationMs,
    });
  } catch (err) {
    console.error("Last.fm current error:", err.response?.data || err.message);
    res.status(400).json({ error: err.response?.data || err.message });
  }
}
