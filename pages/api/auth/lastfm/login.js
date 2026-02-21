import crypto from "crypto";
import axios from "axios";

function md5(str) {
  return crypto.createHash("md5").update(str).digest("hex");
}

export default async function handler(req, res) {
  const api_key = process.env.LASTFM_API_KEY;
  const secret = process.env.LASTFM_SHARED_SECRET;
  const callback_url = process.env.LASTFM_REDIRECT_URI;

  try {
    // Signature : paramètres triés alphabétiquement + secret
    const sig = md5(`api_key${api_key}methodauth.getToken${secret}`);

    const { data } = await axios.get("http://ws.audioscrobbler.com/2.0/", {
      params: {
        method: "auth.getToken",
        api_key,
        api_sig: sig,
        format: "json",
      },
    });

    const token = data.token;

    res.redirect(
      `https://www.last.fm/api/auth/?api_key=${api_key}&token=${token}&cb=${encodeURIComponent(callback_url)}`
    );
  } catch (err) {
    console.error("Last.fm login error:", err.response?.data || err.message);
    res.status(400).json({ error: err.response?.data || err.message });
  }
}
