import { Readable } from "stream";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest): Promise<Response> {
  try {
    const storyText = await req.text();

    if (!storyText?.trim()) {
      return new Response("No input text provided.", { status: 400 });
    }

    const tokenRes = await fetch(
      "https://voiceover-demo-server--us-central1-5hlswwmzra-uc.a.run.app/token"
    );
    const token = await tokenRes.json();

    console.log(token);

    const ttsResponse = await fetch(
      "https://api.sws.speechify.com/v1/audio/stream",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token["access_token"]}`,
          "Content-Type": "text/plain;charset=UTF-8",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          input: `<speak><speechify:emotion emotion="bright">${storyText}</speechify:emotion></speak>`,
          voice_id: "oliver",
          model: "simba-english",
          language: "en-US",
        }),
      }
    );

    if (!ttsResponse.body) {
      return new Response("No audio stream received.", { status: 500 });
    }
    console.log(ttsResponse);

    const webReadableStream: ReadableStream<Uint8Array> = ttsResponse.body;
    const nodeReadable = Readable.from(
      webReadableStream as unknown as AsyncIterable<Uint8Array>
    );

    return new Response(nodeReadable as unknown as BodyInit, {
      headers: {
        "Content-Type": "audio/mpeg",
      },
    });
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    console.error("TTS error:", error);
    return new Response("Server error: " + error, { status: 500 });
  }
}
