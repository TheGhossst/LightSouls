"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import TypewriterText from "../game/components/TypewriterText";
import SpeechButton from "../game/components/SpeechButton";
import BossHeader from "./components/BossHeader";

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
  const [showEndStory, setShowEndStory] = useState(false);
  const [endStoryComplete, setEndStoryComplete] = useState(false);
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
  const [bossEnraged, setBossEnraged] = useState(false);
  const [enrageTriggered, setEnrageTriggered] = useState(false);

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

  const enrageStories = [
    "The boss's wounds begin to glow with dark energy!",
    "Blood drips from the boss's wounds, but its eyes burn brighter!",
    "The boss lets out a bone-chilling roar of fury!",
    "Dark flames begin to surround the enraged boss!",
    "The boss's breathing becomes heavy and labored, but more dangerous!",
    "Cracks appear in the arena floor from the boss's increased power!",
    "The boss's movements become more erratic and violent!",
    "A red aura emanates from the wounded boss!",
    "The boss's attacks carry the weight of pure rage!",
    "You can feel the boss's fury radiating through the air!",
  ];

  const victoryStory = `With a final blow, the boss falls. You stand victorious! The battle is won.`;

  const defeatStory = "YOU DIED";

  useEffect(() => {
    if (gameOver && !showEndStory) {
      const timer = setTimeout(() => {
        setShowEndStory(true);
        setCurrentStory(victory ? victoryStory : defeatStory);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [gameOver, showEndStory, victory, victoryStory, defeatStory]);

  const handleAction = (choice: Choice) => {
    setSelectedChoice(choice);
    choice.action();
  };

  const processTurn = useCallback(
    (action: string) => {
      const shouldEnrage = bossHealth <= 75 && !enrageTriggered;

      let storyIntro = "";
      if (shouldEnrage) {
        storyIntro = enrageStories[turn % enrageStories.length] + " ";
        setBossEnraged(true);
        setEnrageTriggered(true);
      } else if (bossEnraged) {
        storyIntro = enrageStories[turn % enrageStories.length] + " ";
      } else {
        storyIntro = stories[turn % stories.length] + " ";
      }

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
          const baseBossDamage = bossCounter > 5 ? rollDice(10) : 0;
          bossDamage = bossEnraged ? baseBossDamage * 2 : baseBossDamage;
          if (bossDamage > 0) {
            outcome += bossEnraged
              ? ` Boss counters with ENRAGED fury for ${bossDamage} damage!`
              : ` Boss counters for ${bossDamage} damage.`;
          }
          break;
        case "Dodge":
          const dodgeRoll = rollDice(20);
          outcome =
            dodgeRoll > 12
              ? "You successfully dodge the boss's attack! No damage taken."
              : "Dodge failed. ";
          const baseDodgeDamage = dodgeRoll > 12 ? 0 : rollDice(15);
          bossDamage = bossEnraged ? baseDodgeDamage * 2 : baseDodgeDamage;
          if (bossDamage > 0) {
            outcome += bossEnraged
              ? `Enraged boss hits you for ${bossDamage} damage!`
              : `Boss hits you for ${bossDamage} damage.`;
          }
          break;
        case "Heal":
          heal = rollDice(10) + 10;
          outcome = `You heal for ${heal} health.`;
          const baseHealDamage = rollDice(8);
          bossDamage = bossEnraged ? baseHealDamage * 2 : baseHealDamage;
          outcome += bossEnraged
            ? ` Enraged boss attacks for ${bossDamage} damage!`
            : ` Boss attacks for ${bossDamage} damage.`;
          break;
        case "Special Attack":
          const specialRoll = rollDice(20);
          playerDamage = specialRoll > 8 ? rollDice(25) + 10 : rollDice(15);
          outcome = `You unleash a special attack! Roll: ${specialRoll}. You deal ${playerDamage} damage.`;
          const baseSpecialDamage = rollDice(5);
          bossDamage = bossEnraged ? baseSpecialDamage * 2 : baseSpecialDamage;
          outcome += bossEnraged
            ? ` Enraged boss retaliates for ${bossDamage} damage!`
            : ` Boss retaliates weakly for ${bossDamage} damage.`;
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

      if (shouldEnrage) {
        outcome =
          "💀 THE BOSS BECOMES ENRAGED! DOUBLE DAMAGE! 💀 " +
          storyIntro +
          outcome;
      } else {
        outcome = storyIntro + outcome;
      }

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
    [
      playerHealth,
      bossHealth,
      history,
      turn,
      specialCooldown,
      bossEnraged,
      enrageTriggered,
    ]
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
          <BossHeader />
        </div>
        <div className="flex-shrink-0 mb-4 sm:mb-6">
          <div
            className="flex justify-between items-center"
            aria-label="Turn count"
          >
            <span className="text-xs sm:text-sm text-zinc-400 font-mono">
              Turn
            </span>
            <span
              className="text-xs sm:text-sm text-white font-mono"
              aria-label={`Current turn is ${turn}`}
            >
              {turn}
            </span>
          </div>
        </div>

        <div className="flex-1 flex flex-col min-h-0">
          {!gameOver || !showEndStory ? (
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 min-h-0 mb-4 sm:mb-6">
                <div
                  className="bg-zinc-900 border border-zinc-700 rounded-lg p-4 sm:p-6 h-full flex flex-col"
                  role="region"
                  aria-label="Game narration and choices"
                >
                  <div
                    className="flex-1 min-h-0 overflow-y-auto"
                    aria-live="polite"
                  >
                    <TypewriterText
                      text={currentStory}
                      onStart={() => setIsWriting(true)}
                      onDone={() => setIsWriting(false)}
                      className="text-zinc-300 leading-relaxed text-sm sm:text-base italic"
                      speed={20}
                    />
                  </div>

                  <div
                    className="flex-shrink-0 mt-4 space-y-2"
                    role="region"
                    aria-label="Health indicators"
                  >
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-xs sm:text-sm text-zinc-400">
                          Your Health
                        </span>
                        <span
                          className="text-xs sm:text-sm text-white"
                          aria-label={`Player health is ${playerHealth} out of 100`}
                        >
                          {playerHealth}/100
                        </span>
                      </div>
                      <div
                        className="w-full bg-zinc-800 rounded-sm h-2"
                        role="progressbar"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={playerHealth}
                        aria-label="Player health bar"
                      >
                        <div
                          className="h-full bg-green-500 rounded-sm transition-all duration-300"
                          style={{ width: `${(playerHealth / 100) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span
                          className={`text-xs sm:text-sm ${
                            bossEnraged ? "text-red-400" : "text-zinc-400"
                          }`}
                        >
                          Boss Health {bossEnraged ? "(ENRAGED)" : ""}
                        </span>
                        <span
                          className="text-xs sm:text-sm text-white"
                          aria-label={`Boss health is ${bossHealth} out of 150`}
                        >
                          {bossHealth}/150
                        </span>
                      </div>
                      <div
                        className="w-full bg-zinc-800 rounded-sm h-2"
                        role="progressbar"
                        aria-valuemin={0}
                        aria-valuemax={150}
                        aria-valuenow={bossHealth}
                        aria-label="Boss health bar"
                      >
                        <div
                          className={`h-full rounded-sm transition-all duration-300 ${
                            bossEnraged ? "bg-red-600" : "bg-red-500"
                          }`}
                          style={{
                            width: `${(bossHealth / 150) * 100}%`,
                            boxShadow: bossEnraged
                              ? "0 0 10px rgba(255, 0, 0, 0.5)"
                              : "none",
                          }}
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
                <div
                  className="grid grid-cols-2 gap-2 sm:gap-3"
                  role="group"
                  aria-label="Action choices"
                >
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
                      aria-label={`Action button: ${choice.text}`}
                    >
                      {choice.text}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col">
              <div className="flex-1 min-h-0 mb-6">
                <div
                  className={`${
                    victory
                      ? "bg-zinc-900 border border-zinc-700"
                      : "bg-red-950/20 border border-red-900/50"
                  } rounded-lg p-6 h-full flex flex-col`}
                  role="region"
                  aria-label="End story"
                >
                  <div
                    className="flex-1 min-h-0 overflow-y-auto flex items-center justify-center"
                    aria-live="polite"
                  >
                    {victory ? (
                      <TypewriterText
                        text={currentStory}
                        onStart={() => setIsWriting(true)}
                        onDone={() => {
                          setIsWriting(false);
                          setEndStoryComplete(true);
                        }}
                        className="text-zinc-300 leading-relaxed text-sm sm:text-base italic text-center max-w-2xl"
                        speed={30}
                      />
                    ) : (
                      <div className="text-center">
                        <div
                          className="text-6xl sm:text-8xl lg:text-9xl font-bold text-red-500 mb-4 tracking-wider"
                          style={{
                            fontFamily: "serif",
                            textShadow:
                              "4px 4px 8px rgba(0,0,0,0.8), 0 0 20px rgba(255,0,0,0.3)",
                            animation: "fadeInPulse 2s ease-out forwards",
                          }}
                        >
                          YOU DIED
                        </div>
                        <div className="text-zinc-400 text-lg sm:text-xl italic">
                          The darkness claims another soul...
                        </div>
                      </div>
                    )}
                  </div>

                  {victory && (
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
                  )}
                </div>
              </div>

              {(endStoryComplete || !victory) && (
                <div className="flex-shrink-0">
                  <div
                    className="bg-zinc-900 border border-zinc-700 rounded-lg p-6 sm:p-8 text-center"
                    role="region"
                    aria-label="Game over options"
                  >
                    <h2 className="text-2xl sm:text-3xl font-mono font-bold mb-4 sm:mb-6">
                      {victory ? "Victory Achieved!" : "Game Over"}
                    </h2>
                    <p className="text-zinc-400 mb-6 sm:mb-8 text-sm sm:text-base">
                      {victory
                        ? "Your legend will be remembered forever."
                        : "Will you rise from the ashes?"}
                    </p>
                    <button
                      onClick={resetGame}
                      className="px-4 py-2 sm:px-6 sm:py-3 bg-white text-black font-mono hover:bg-zinc-200 transition-colors rounded text-sm sm:text-base lg:text-lg"
                      aria-label="Restart the game"
                    >
                      {victory ? "Begin New Quest" : "Try Again"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInPulse {
          0% {
            opacity: 0;
            transform: scale(0.8);
          }
          50% {
            opacity: 1;
            transform: scale(1.1);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default BossPage;
