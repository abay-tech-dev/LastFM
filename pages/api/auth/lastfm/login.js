export default function handler(req, res) {
  const api_key = process.env.LASTFM_API_KEY;
  const callback_url = process.env.LASTFM_REDIRECT_URI;

  res.redirect(
    `https://www.last.fm/api/auth/?api_key=${api_key}&cb=${encodeURIComponent(callback_url)}`
  );
}
