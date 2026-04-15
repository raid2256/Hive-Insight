export default async function handler(req, res) {
  const { user } = req.query;

  if (!user) {
    return res.status(400).json({ error: "Missing ?user=" });
  }

  const url = `https://mcprofile.io/api/v1/bedrock/gamertag/${encodeURIComponent(
    user
  )}`;

  try {
    const mcRes = await fetch(url);

    if (!mcRes.ok) {
      return res.status(mcRes.status).json({ error: "MCProfile error" });
    }

    const data = await mcRes.json();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: "Server error", details: err.message });
  }
}
