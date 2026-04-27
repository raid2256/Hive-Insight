export default async function handler(req, res) {
  const { ign } = req.query;

  if (!ign) {
    return res.status(400).json({ error: "IGN missing" });
  }

  const hiveURL = `https://api.playhive.com/game/all/main/${ign}`;

  try {
    const response = await fetch(hiveURL);

    // If Hive blocks the request
    if (!response.ok) {
      const text = await response.text();
      return res.status(500).json({
        error: "Hive API returned an error",
        status: response.status,
        body: text
      });
    }

    const data = await response.json();

    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.status(200).json(data);

  } catch (err) {
    return res.status(500).json({
      error: "Server error",
      details: err.message
    });
  }
}
