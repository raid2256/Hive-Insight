export const config = {
  runtime: "edge"
};

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const ign = searchParams.get("ign");

  if (!ign) {
    return new Response(
      JSON.stringify({ error: "IGN missing" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" }
      }
    );
  }

  const hiveURL = `https://api.playhive.com/game/all/main/${ign}`;

  try {
    const response = await fetch(hiveURL);

    if (!response.ok) {
      const text = await response.text();
      return new Response(
        JSON.stringify({
          error: "Hive API returned an error",
          status: response.status,
          body: text
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    const data = await response.json();

    return new Response(
      JSON.stringify(data),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({
        error: "Server error",
        details: err.message
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}
