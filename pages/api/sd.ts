const engineId = "stable-diffusion-xl-beta-v2-2-2";
const apiHost = process.env.API_HOST ?? "https://api.stability.ai";
const apiKey = process.env.SD_API_KEY;

if (!apiKey) throw new Error("Missing Stability API key.");

// export const config = {
//   runtime: "edge",
// };

export default async function handler(req, res) {
  const { text, cfgScale, steps } = await req.body;
  try {
    const response = await fetch(
      `${apiHost}/v1/generation/${engineId}/text-to-image`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          text_prompts: [
            {
              text,
            },
          ],
          cfg_scale: cfgScale ? cfgScale : 7,
          clip_guidance_preset: "FAST_BLUE",
          height: 512,
          width: 512,
          samples: 1,
          steps: steps ? steps : 30,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Non-200 response: ${await response.text()}`);
    }
    const responseJSON = (await response.json()) as GenerationResponse;

    res.status(200).json(responseJSON);
  } catch (error) {
    console.error(error);
    res.status(500).json("参数错误");
  }
}

interface GenerationResponse {
  artifacts: Array<{
    base64: string;
    seed: number;
    finishReason: string;
  }>;
}
