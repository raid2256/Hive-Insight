export default async function handler(req, res) {
  const { ign } = req.query;

  if (!ign) {
    return res.status(400).json({ error: "IGN missing" });
  }

  const hiveURL = `https://api.playhive.com/game/all/main/${ign}`;

  try {
    const response = await fetch(hiveURL);
    const data = await response.json();

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json(data);

  } catch (err) {
    res.status(500).json({ error: "Hive API error" });
  }
}
