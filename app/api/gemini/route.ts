import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

interface RoundHistory {
  choice: string;
  reason: string;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { history, round } = body;

  if (!Array.isArray(history) || typeof round !== "number") {
    return NextResponse.json(
      { error: "Invalid request: Provide history (array) and round (number)" },
      { status: 400 }
    );
  }

  const context = history
    .map((entry: RoundHistory, index: number) => {
      return `Round ${index + 1}:\n- Choice made: "${entry.choice}"\n- Outcome: ${entry.reason}`;
    })
    .join("\n");

  const prompt = `
You are a game designer creating a dark fantasy, Souls-like RPG text adventure called "Lightsouls". The game lasts exactly 10 rounds. Each round presents the player with:
- A short narrative story (2–3 sentences),
- Two choices, one of which leads to the next round and one which ends the game.

The world is cursed, bleak, and rich in cryptic lore.

Only ONE choice should be correct. Randomize which one is correct each time.
Provide a reason for both outcomes that expands the world or deepens the mystery.

The player is currently at Round ${round} of 10.

${
  round === 1
    ? `Start by generating a BACKSTORY to introduce the setting. Keep it mysterious, poetic, and less than 5 sentences.`
    : `Past decisions:\n${context || "None yet."}`
}

Now return ONLY a JSON object in this format:

{
  "story": "string (short story for this round)",
  "choice1": {
    "text": "string",
    "isCorrect": boolean,
    "reason": "string"
  },
  "choice2": {
    "text": "string",
    "isCorrect": boolean,
    "reason": "string"
  }
}
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const output = response.text;
    if (!output) throw new Error("Failed!!")
    const start = output.indexOf("{");
    const end = output.lastIndexOf("}");
    const jsonText = output.slice(start, end + 1);
    const parsed = JSON.parse(jsonText);

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Error generating round:", error);
    return NextResponse.json(
      { error: "Failed to generate round" },
      { status: 500 }
    );
  }
}
