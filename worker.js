export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: corsHeaders()
      });
    }

    if (url.pathname === "/generate" && request.method === "POST") {
      try {
        const body = await request.json();

        if (!body.prompt) {
          return json({ error: "Prompt is required" }, 400);
        }

        const prompt = body.prompt;

        const imageUrl =
          "https://image.pollinations.ai/prompt/" +
          encodeURIComponent(prompt);

        const response = await fetch(imageUrl);

        if (!response.ok) {
          return json({
            error: "Pollinations request failed",
            status: response.status
          }, 502);
        }

        return new Response(response.body, {
          status: 200,
          headers: {
            ...corsHeaders(),
            "Content-Type":
              response.headers.get("Content-Type") || "image/jpeg"
          }
        });

      } catch (error) {
        return json({
          error: error.message || "Generation failed"
        }, 500);
      }
    }

    return json({
      ok: true,
      service: "Boogi API"
    });
  }
};

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders(),
      "Content-Type": "application/json"
    }
  });
}
