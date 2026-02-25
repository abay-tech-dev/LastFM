import crypto from "crypto";
import axios from "axios";
import dbConnect from "../../../../lib/mongodb";
import User from "../../../../models/User";

function md5(str) {
  return crypto.createHash("md5").update(str).digest("hex");
}

export default async function handler(req, res) {
  const { token } = req.query;
  const api_key = process.env.LASTFM_API_KEY;
  const secret = process.env.LASTFM_SHARED_SECRET;

  if (!token) {
    return res.status(400).json({ error: "Missing token" });
  }

  try {
    const sig = md5(`api_key${api_key}methodauth.getSessiontoken${token}${secret}`);

    const { data } = await axios.get("https://ws.audioscrobbler.com/2.0/", {
      params: {
        method: "auth.getSession",
        api_key,
        token,
        api_sig: sig,
        format: "json",
      },
    });

    if (data.error) {
      throw new Error(`Last.fm error ${data.error}: ${data.message}`);
    }

    const { name: lastfmUsername, key: sessionKey } = data.session;

    await dbConnect();
    await User.findOneAndUpdate(
      { lastfmUsername },
      { lastfmUsername, sessionKey, updated_at: new Date() },
      { upsert: true, new: true }
    );

    res.redirect(`/?userId=${lastfmUsername}`);
  } catch (err) {
    console.error("Last.fm callback error:", err.response?.data || err.message);
    res.status(400).json({ error: err.response?.data || err.message });
  }
}
