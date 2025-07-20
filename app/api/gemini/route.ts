import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function POST() {
  const prompt = `
You are a game designer creating a dark fantasy, Souls-like RPG text adventure called "Lightsouls". The game lasts exactly 5 rounds. Each round presents the player with:
- A short narrative story (2–3 sentences),
- Two choices, one of which leads to the next round and one which ends the game.

The world is cursed, bleak, and rich in cryptic lore.

Only ONE choice should be correct. Randomize which one is correct each time.
Provide an effect for both outcomes that expands the world or deepens the mystery.

Generate the entire game in one go: backstory and all 5 rounds.
The story should be coherent, assuming the player always chooses the correct choice to progress.
Start with a BACKSTORY to introduce the setting. Keep it mysterious, poetic, and less than 5 sentences.

Then, for each round 1 to 5, generate the story and choices.

Now return ONLY a JSON object in this format:

{
  "backstory": "string",
  "round": [
    {
      "roundno": 1,
      "story": "string",
      "choice1": "string",
      "choice1effect": "string",
      "choice1isCorrect": boolean,
      "choice2": "string",
      "choice2effect": "string",
      "choice2isCorrect": boolean
    },
    ... (for rounds 2 to 5)
  ]
}
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const output = response.text;
    if (!output) throw new Error("Failed!!");
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
