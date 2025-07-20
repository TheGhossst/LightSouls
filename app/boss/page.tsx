"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import GameHeader from "../game/components/GameHeader";
import TypewriterText from "../game/components/TypewriterText";
import SpeechButton from "../game/components/SpeechButton";

interface Choice {
  text: string;
  action: () => void;
}

interface HistoryEntry {
  action: string;
  outcome: string;
}

const BossPage = () => {
  const router = useRouter();
  const [playerHealth, setPlayerHealth] = useState(100);
  const [bossHealth, setBossHealth] = useState(150);
  const [turn, setTurn] = useState(1);
  const [currentStory, setCurrentStory] = useState(
    "The mighty boss appears! You must fight to win. Your health: 100, Boss health: 150."
  );
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [victory, setVictory] = useState(false);
  const [speechState, setSpeechState] = useState<
    "idle" | "generating" | "playing" | "paused"
  >("idle");
  const [currentText, setCurrentText] = useState<string | null>(null);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(
    null
  );
  const [isWriting, setIsWriting] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<Choice | null>(null);
  const [specialCooldown, setSpecialCooldown] = useState(0);

  const rollDice = (sides: number) => Math.floor(Math.random() * sides) + 1;

  const stories = [
    "The boss roars menacingly as the battle begins.",
    "Shadows dance around the arena, heightening the tension.",
    "You feel the ground tremble under the boss's might.",
    "A fierce wind blows, carrying the scent of danger.",
    "The boss's eyes glow with otherworldly power.",
    "Echoes of past battles fill your mind.",
    "You steel yourself for the next exchange.",
    "The air crackles with energy.",
    "Victory seems within reach, but caution is key.",
    "The final clash approaches.",
    "A low growl echoes, promising pain.",
    "The boss's armor gleams under the eerie light.",
    "Dust and debris rise from the fractured ground.",
    "You spot a brief opening in the boss's defense.",
    "A moment of silence—the calm before the storm.",
    "The boss stumbles, showing a rare sign of weakness.",
    "Your heart pounds, a drumbeat for the fight.",
    "Arcane symbols on the floor begin to pulse with light.",
    "The scent of ozone fills the air as magic gathers.",
    "A glint of desperation appears in the boss's eyes.",
    "You parry a heavy blow, sending sparks flying.",
    "The beast prepares for a devastating charge.",
    "Memories of your training sharpen your focus.",
    "The arena itself seems to hold its breath.",
    "A sudden chill runs down your spine.",
  ];

  const handleAction = (choice: Choice) => {
    setSelectedChoice(choice);
    choice.action();
  };

  const processTurn = useCallback(
    (action: string) => {
      const storyIntro = stories[turn % stories.length] + " ";
      let outcome = "";
      let playerDamage = 0;
      let bossDamage = 0;
      let heal = 0;

      switch (action) {
        case "Attack":
          const attackRoll = rollDice(20);
          playerDamage = attackRoll > 10 ? rollDice(15) + 5 : rollDice(10);
          outcome = `You attack! Roll: ${attackRoll}. You deal ${playerDamage} damage.`;
          const bossCounter = rollDice(10);
          bossDamage = bossCounter > 5 ? rollDice(10) : 0;
          if (bossDamage > 0)
            outcome += ` Boss counters for ${bossDamage} damage.`;
          break;
        case "Dodge":
          const dodgeRoll = rollDice(20);
          outcome =
            dodgeRoll > 12
              ? "You successfully dodge the boss's attack! No damage taken."
              : "Dodge failed. ";
          bossDamage = dodgeRoll > 12 ? 0 : rollDice(15);
          if (bossDamage > 0)
            outcome += `Boss hits you for ${bossDamage} damage.`;
          break;
        case "Heal":
          heal = rollDice(10) + 10;
          outcome = `You heal for ${heal} health.`;
          bossDamage = rollDice(8);
          outcome += ` Boss attacks for ${bossDamage} damage.`;
          break;
        case "Special Attack":
          if (specialCooldown > 0) {
            outcome = "Special Attack is on cooldown! You miss your turn. ";
            bossDamage = rollDice(12);
            outcome += `Boss attacks for ${bossDamage} damage.`;
            break;
          }
          const specialRoll = rollDice(20);
          playerDamage = specialRoll > 8 ? rollDice(25) + 10 : rollDice(15);
          outcome = `You unleash a special attack! Roll: ${specialRoll}. You deal ${playerDamage} damage.`;
          bossDamage = rollDice(5);
          outcome += ` Boss retaliates weakly for ${bossDamage} damage.`;
          break;
        default:
          outcome = "Invalid action.";
          break;
      }

      const rawPlayerHealth = playerHealth + heal - bossDamage;
      const newPlayerHealth = Math.min(100, Math.max(0, rawPlayerHealth));
      const newBossHealth = Math.max(0, bossHealth - playerDamage);

      setPlayerHealth(newPlayerHealth);
      setBossHealth(newBossHealth);

      outcome = storyIntro + outcome;
      outcome += ` Your health: ${newPlayerHealth}, Boss health: ${newBossHealth}.`;
      setCurrentStory(outcome);
      setHistory([...history, { action, outcome }]);

      if (newPlayerHealth <= 0) {
        setGameOver(true);
        setVictory(false);
      } else if (newBossHealth <= 0) {
        setGameOver(true);
        setVictory(true);
      } else {
        setTurn((prev) => prev + 1);
        setSpecialCooldown((prev) =>
          action === "Special Attack" && prev === 0 ? 3 : Math.max(0, prev - 1)
        );
      }
    },
    [playerHealth, bossHealth, history, turn, specialCooldown]
  );

  const choices = useMemo(
    () => [
      { text: "Attack", action: () => processTurn("Attack") },
      { text: "Dodge", action: () => processTurn("Dodge") },
      { text: "Heal", action: () => processTurn("Heal") },
      {
        text:
          "Special Attack" +
          (specialCooldown > 0 ? ` (Cooldown: ${specialCooldown})` : ""),
        action: () => processTurn("Special Attack"),
      },
    ],
    [specialCooldown, processTurn]
  );

  async function handleSpeechStart(text: string) {
    if (speechState !== "idle" && currentText !== text) {
      handleSpeechCancel();
    }
    setSpeechState("generating");
    setCurrentText(text);
    try {
      const res = await fetch("/api/generateAudio", {
        method: "POST",
        body: text,
      });
      if (!res.ok) throw new Error("Failed to fetch audio");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      setCurrentAudio(audio);
      audio.play();
      setSpeechState("playing");

      audio.onended = () => {
        setSpeechState("idle");
        setCurrentText(null);
        setCurrentAudio(null);
      };
      audio.onpause = () => {
        if (!audio.ended) setSpeechState("paused");
      };
      audio.onplay = () => setSpeechState("playing");
    } catch (err) {
      console.error("Speech error:", err);
      setSpeechState("idle");
      setCurrentText(null);
    }
  }

  function handleSpeechPause() {
    if (currentAudio && speechState === "playing") {
      currentAudio.pause();
    }
  }

  function handleSpeechResume() {
    if (currentAudio && speechState === "paused") {
      currentAudio.play();
    }
  }

  function handleSpeechCancel() {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setCurrentAudio(null);
    }
    setSpeechState("idle");
    setCurrentText(null);
  }

  const resetGame = () => {
    router.push("/game");
  };

  return (
    <div className="h-screen bg-black text-white font-sans overflow-hidden flex flex-col">
      <div className="flex-1 max-w-4xl mx-auto w-full px-3 py-4 sm:px-4 sm:py-6 flex flex-col">
        <div className="flex-shrink-0">
          <GameHeader />
        </div>
        <div className="flex-shrink-0 mb-4 sm:mb-6">
          <div className="flex justify-between items-center">
            <span className="text-xs sm:text-sm text-zinc-400 font-mono">
              Turn
            </span>
            <span className="text-xs sm:text-sm text-white font-mono">
              {turn}
            </span>
          </div>
        </div>
        <div className="flex-1 flex flex-col min-h-0">
          {!gameOver ? (
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 min-h-0 mb-4 sm:mb-6">
                <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-4 sm:p-6 h-full flex flex-col">
                  <div className="flex-1 min-h-0 overflow-y-auto">
                    <TypewriterText
                      text={currentStory}
                      onStart={() => setIsWriting(true)}
                      onDone={() => setIsWriting(false)}
                      className="text-zinc-300 leading-relaxed text-sm sm:text-base italic"
                      speed={20}
                    />
                  </div>

                  <div className="flex-shrink-0 mt-4 space-y-2">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-xs sm:text-sm text-zinc-400">
                          Your Health
                        </span>
                        <span className="text-xs sm:text-sm text-white">
                          {playerHealth}/100
                        </span>
                      </div>
                      <div className="w-full bg-zinc-800 rounded-sm h-2">
                        <div
                          className="h-full bg-green-500 rounded-sm transition-all duration-300"
                          style={{ width: `${(playerHealth / 100) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-xs sm:text-sm text-zinc-400">
                          Boss Health
                        </span>
                        <span className="text-xs sm:text-sm text-white">
                          {bossHealth}/150
                        </span>
                      </div>
                      <div className="w-full bg-zinc-800 rounded-sm h-2">
                        <div
                          className="h-full bg-red-500 rounded-sm transition-all duration-300"
                          style={{ width: `${(bossHealth / 150) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0 mt-4">
                    <SpeechButton
                      text={currentStory}
                      speechState={speechState}
                      currentText={currentText}
                      onStart={handleSpeechStart}
                      onPause={handleSpeechPause}
                      onResume={handleSpeechResume}
                      onCancel={handleSpeechCancel}
                    />
                  </div>
                </div>
              </div>

              <div className="flex-shrink-0">
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  {choices.map((choice, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAction(choice)}
                      disabled={
                        (choice.text.includes("Special Attack") &&
                          specialCooldown > 0) ||
                        isWriting ||
                        gameOver
                      }
                      className={`px-3 py-3 sm:px-4 sm:py-4 text-sm sm:text-base lg:text-lg rounded-lg border transition text-center ${
                        (choice.text.includes("Special Attack") &&
                          specialCooldown > 0) ||
                        isWriting ||
                        gameOver
                          ? "bg-zinc-900 opacity-50 cursor-not-allowed border-zinc-700"
                          : "bg-zinc-800 hover:bg-zinc-700 border-zinc-600 hover:border-zinc-500"
                      }`}
                      aria-label={`Choose ${choice.text}`}
                    >
                      {choice.text}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6 sm:p-8 max-w-sm mx-auto w-full text-center">
                <h2 className="text-2xl sm:text-3xl font-mono font-bold mb-4 sm:mb-6">
                  {victory ? "Victory!" : "Defeat!"}
                </h2>
                <p className="text-zinc-400 mb-6 sm:mb-8 text-sm sm:text-base">
                  {victory
                    ? "You defeated the boss!"
                    : "The boss was too strong."}
                </p>
                <button
                  onClick={resetGame}
                  className="px-4 py-2 sm:px-6 sm:py-3 bg-white text-black font-mono hover:bg-zinc-200 transition-colors rounded text-sm sm:text-base lg:text-lg"
                >
                  Play Again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BossPage;
