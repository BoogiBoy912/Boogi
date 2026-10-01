export default {
  async fetch(request, env) {

    const url = new URL(request.url);

    // CORS
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: corsHeaders()
      });
    }


    // =========================
    // GENERATE IMAGE
    // =========================

    if (
      url.pathname === "/generate" &&
      request.method === "POST"
    ) {

      try {

        const body = await request.json();


        // Prompt required
        if (
          !body.prompt ||
          !body.prompt.trim()
        ) {

          return json(
            {
              error: "Prompt is required"
            },
            400
          );

        }


        const prompt =
          body.prompt.trim();


        // =========================
        // IMAGE SIZE
        // =========================

        let width =
          Number(body.width) || 1280;

        let height =
          Number(body.height) || 720;


        // Only allow our two Boogi ratios
        if (
          width === 720 &&
          height === 1280
        ) {

          width = 720;
          height = 1280;

        } else {

          width = 1280;
          height = 720;

        }


        // =========================
        // POLLINATIONS URL
        // =========================

        const imageUrl =
          "https://gen.pollinations.ai/image/" +
          encodeURIComponent(prompt) +
          `?model=flux&width=${width}&height=${height}`;


        // =========================
        // POLLINATIONS REQUEST
        // =========================

        const response =
          await fetch(imageUrl, {

            headers: {

              "Authorization":
                `Bearer ${env.POLLINATIONS_API_KEY}`

            }

          });


        // =========================
        // ERROR
        // =========================

        if (!response.ok) {

          const errorText =
            await response.text();

          return json(
            {
              error:
                "Pollinations request failed",

              status:
                response.status,

              details:
                errorText
            },
            502
          );

        }


        // =========================
        // RETURN IMAGE
        // =========================

        return new Response(
          response.body,
          {
            status: 200,

            headers: {

              ...corsHeaders(),

              "Content-Type":
                response.headers.get(
                  "Content-Type"
                ) || "image/jpeg",

              "Cache-Control":
                "no-store"

            }

          }
        );


      } catch (error) {

        return json(
          {
            error:
              error.message ||
              "Generation failed"
          },
          500
        );

      }

    }


    // =========================
    // ROOT / HEALTH CHECK
    // =========================

    if (
      url.pathname === "/" &&
      request.method === "GET"
    ) {

      return json({
        ok: true,
        service: "Boogi API"
      });

    }


    // =========================
    // NOT FOUND
    // =========================

    return json(
      {
        error: "Not found"
      },
      404
    );

  }
};


// =========================
// CORS
// =========================

function corsHeaders() {

  return {

    "Access-Control-Allow-Origin": "*",

    "Access-Control-Allow-Methods":
      "GET,POST,OPTIONS",

    "Access-Control-Allow-Headers":
      "Content-Type"

  };

}


// =========================
// JSON RESPONSE
// =========================

function json(
  data,
  status = 200
) {

  return new Response(
    JSON.stringify(data),
    {

      status,

      headers: {

        ...corsHeaders(),

        "Content-Type":
          "application/json"

      }

    }
  );

}
