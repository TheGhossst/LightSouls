"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import TypewriterText from "../game/components/TypewriterText";
import SpeechButton from "../game/components/SpeechButton";
import Image from "next/image";
import GameHeader from "../game/components/GameHeader";

interface Choice {
  text: string;
  action: () => void;
  disabled?: boolean;
  ariaLabel?: string;
}

interface HistoryEntry {
  action: string;
  playerDamage: number;
  bossDamage: number;
  heal: number;
  turn: number;
  timestamp: string;
  special?: boolean;
}

const bossNames = [
  "The Penitent King, Valerius",
  "Grave-Limb, the Amalgamation",
  "The Sentinel of a Faded Star",
  "The Thrice-Blasphemed Pontiff",
  "Matriarch of the Rusting Fen",
  "The Final, Lingering Echo",
  "The Twin Heresiarchs, Ilsa and Orin",
  "The Eyeless Watcher",
  "Cainhurst, the Gloom-Warden",
  "The Aureate Lullaby",
];

const bossImageMap: { [key: string]: string } = {
  "The Penitent King, Valerius": "Valerius.png",
  "Grave-Limb, the Amalgamation": "Amalgamation.png",
  "The Sentinel of a Faded Star": "Sentinel.png",
  "The Thrice-Blasphemed Pontiff": "Pontiff.png",
  "Matriarch of the Rusting Fen": "Matriarch.png",
  "The Final, Lingering Echo": "Echo.png",
  "The Twin Heresiarchs, Ilsa and Orin": "The-Twin-Heresiarchs.png",
  "The Eyeless Watcher": "Watcher.png",
  "Cainhurst, the Gloom-Warden": "Warden.png",
  "The Aureate Lullaby": "lullaby.png",
};

const BossPage = () => {
  const router = useRouter();
  const [playerHealth, setPlayerHealth] = useState(100);
  const [bossHealth, setBossHealth] = useState(150);
  const [turn, setTurn] = useState(1);
  const [bossName, setBossName] = useState("");
  const [currentStory, setCurrentStory] = useState("");
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
  const [battlePhase, setBattlePhase] = useState<
    "action" | "result" | "waiting"
  >("action");
  const [buttonsDisabled, setButtonsDisabled] = useState(false);
  // Pre-battle states
  const [showIntro, setShowIntro] = useState(true);
  const [introComplete, setIntroComplete] = useState(false);
  // Victory/Defeat screen states
  const [showVictoryDefeatScreen, setShowVictoryDefeatScreen] = useState(false);
  const [victoryDefeatStoryComplete, setVictoryDefeatStoryComplete] =
    useState(false);
  // Accessibility states
  const [reducedMotion, setReducedMotion] = useState(false);
  const [focusedChoiceIndex, setFocusedChoiceIndex] = useState(0);

  // Refs for accessibility
  const battleLogRef = useRef<HTMLDivElement>(null);
  const choicesRef = useRef<HTMLDivElement>(null);
  const tryAgainButtonRef = useRef<HTMLButtonElement>(null);

  const rollDice = (sides: number) => Math.floor(Math.random() * sides) + 1;

  const stories = [
    "The boss roars menacingly as it prepares its next move!",
    "The boss is gathering energy for a powerful attack!",
    "The ground trembles beneath the boss's mighty presence!",
    "The boss's eyes glow with an otherworldly power!",
    "A tense moment passes as both fighters size each other up...",
    "The boss seems to be planning something devious!",
    "Lightning crackles around the boss's form!",
    "The boss appears more determined than ever!",
    "The air grows thick with magical energy!",
    "The boss prepares to unleash its fury!",
  ];

  const enrageStories = [
    "The boss BECOMES ENRAGED! Its power has doubled!",
    "The boss is burning with uncontrollable fury!",
    "The boss entered RAGE MODE! All attacks deal double damage!",
    "The boss's wounds only make it stronger!",
    "The boss is consumed by primal rage!",
  ];

  // Initialize boss name and intro on component mount
  useEffect(() => {
    const randomBoss = bossNames[Math.floor(Math.random() * bossNames.length)];
    setBossName(randomBoss);
  }, []);

  // Check for user preferences
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);
    const handleMotionChange = (e: MediaQueryListEvent) =>
      setReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handleMotionChange);
    return () => {
      mediaQuery.removeEventListener("change", handleMotionChange);
    };
  }, []);

  // Focus management for victory/defeat screen
  useEffect(() => {
    if (
      showVictoryDefeatScreen &&
      victoryDefeatStoryComplete &&
      tryAgainButtonRef.current
    ) {
      tryAgainButtonRef.current.focus();
    }
  }, [showVictoryDefeatScreen, victoryDefeatStoryComplete]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showIntro && !introComplete) return;
      if (showVictoryDefeatScreen) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (victoryDefeatStoryComplete) {
            resetGame();
          }
        }
        return;
      }
      if (buttonsDisabled || gameOver) return;

      switch (e.key) {
        case "1":
        case "2":
        case "3":
        case "4":
          e.preventDefault();
          if (showIntro && introComplete) {
            // Handle intro choices
            if (e.key === "1" || e.key === "2") {
              startBattle();
            }
          } else {
            const choiceIndex = Number.parseInt(e.key) - 1;
            if (choices[choiceIndex] && !choices[choiceIndex].disabled) {
              handleAction(choices[choiceIndex]);
            }
          }
          break;
        case "ArrowUp":
        case "ArrowDown":
        case "ArrowLeft":
        case "ArrowRight":
          e.preventDefault();
          if (!showIntro) {
            const newIndex =
              e.key === "ArrowUp" || e.key === "ArrowLeft"
                ? Math.max(0, focusedChoiceIndex - 1)
                : Math.min(choices.length - 1, focusedChoiceIndex + 1);
            setFocusedChoiceIndex(newIndex);
          }
          break;
        case "Enter":
        case " ":
          e.preventDefault();
          if (showIntro && introComplete) {
            startBattle();
          } else if (
            !showIntro &&
            choices[focusedChoiceIndex] &&
            !choices[focusedChoiceIndex].disabled
          ) {
            handleAction(choices[focusedChoiceIndex]);
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    showIntro,
    introComplete,
    buttonsDisabled,
    gameOver,
    focusedChoiceIndex,
    showVictoryDefeatScreen,
    victoryDefeatStoryComplete,
  ]);

  const startBattle = () => {
    setShowIntro(false);
    setCurrentStory(`${bossName} appears before you! What will you do?`);
  };

  const victoryStory = `${bossName} has been defeated! You emerge victorious from this epic battle! Your courage and skill have proven superior in this legendary encounter.`;
  const defeatStory = `You have fallen in battle... ${bossName} stands triumphant over your defeated form. But heroes are forged in defeat as much as victory - rise again and face the challenge anew!`;

  useEffect(() => {
    if (gameOver && !showEndStory) {
      const timer = setTimeout(() => {
        setShowEndStory(true);
        setShowVictoryDefeatScreen(true);
        setCurrentStory(victory ? victoryStory : defeatStory);
        setBattlePhase("result");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [gameOver, showEndStory, victory, victoryStory, defeatStory]);

  const handleAction = (choice: Choice) => {
    setSelectedChoice(choice);
    setButtonsDisabled(true);
    setBattlePhase("waiting");
    choice.action();
  };

  const processTurn = useCallback(
    (action: string) => {
      const shouldEnrage = bossHealth <= 75 && !enrageTriggered;
      let storyIntro = "";

      if (shouldEnrage) {
        storyIntro =
          enrageStories[Math.floor(Math.random() * enrageStories.length)];
        setBossEnraged(true);
        setEnrageTriggered(true);
      } else if (bossEnraged) {
        storyIntro = `The enraged boss continues its rampage! `;
      } else {
        storyIntro = stories[Math.floor(Math.random() * stories.length)] + " ";
      }

      let outcome = "";
      let playerDamage = 0;
      let bossDamage = 0;
      let heal = 0;
      let isSpecial = false;

      switch (action) {
        case "Attack":
          const attackRoll = rollDice(20);
          playerDamage = attackRoll > 10 ? rollDice(15) + 5 : rollDice(10);
          outcome = `You attack ${bossName}! (Roll: ${attackRoll}) Dealing ${playerDamage} damage!`;
          const bossCounter = rollDice(10);
          const baseBossDamage = bossCounter > 5 ? rollDice(10) : 0;
          bossDamage = bossEnraged ? baseBossDamage * 2 : baseBossDamage;
          if (bossDamage > 0) {
            outcome += bossEnraged
              ? ` ${bossName} retaliates with ENRAGED fury, dealing ${bossDamage} damage!`
              : ` ${bossName} counters for ${bossDamage} damage!`;
          }
          break;
        case "Dodge":
          const dodgeRoll = rollDice(20);
          outcome =
            dodgeRoll > 12
              ? `You successfully dodge ${bossName}'s attack!`
              : "Dodge failed! ";
          const baseDodgeDamage = dodgeRoll > 12 ? 0 : rollDice(15);
          bossDamage = bossEnraged ? baseDodgeDamage * 2 : baseDodgeDamage;
          if (bossDamage > 0) {
            outcome += `${bossName} hits you for ${bossDamage} damage!`;
          }
          break;
        case "Heal":
          heal = rollDice(10) + 10;
          outcome = `You heal for ${heal} HP!`;
          const baseHealDamage = rollDice(8);
          bossDamage = bossEnraged ? baseHealDamage * 2 : baseHealDamage;
          outcome += ` ${bossName} attacks for ${bossDamage} damage!`;
          break;
        case "Special Attack":
          const specialRoll = rollDice(20);
          playerDamage = specialRoll > 8 ? rollDice(25) + 10 : rollDice(15);
          outcome = `You unleash SPECIAL ATTACK against ${bossName}! (Roll: ${specialRoll}) CRITICAL HIT for ${playerDamage} damage!`;
          const baseSpecialDamage = rollDice(5);
          bossDamage = bossEnraged ? baseSpecialDamage * 2 : baseSpecialDamage;
          outcome += ` ${bossName} retaliates for ${bossDamage} damage!`;
          isSpecial = true;
          break;
        default:
          outcome = "Nothing happened...";
          break;
      }

      const rawPlayerHealth = playerHealth + heal - bossDamage;
      const newPlayerHealth = Math.min(100, Math.max(0, rawPlayerHealth));
      const newBossHealth = Math.max(0, bossHealth - playerDamage);

      setPlayerHealth(newPlayerHealth);
      setBossHealth(newBossHealth);

      const fullOutcome = shouldEnrage
        ? storyIntro + " " + outcome
        : storyIntro + outcome;
      const timestamp = new Date().toLocaleTimeString();

      // Add to history with summarized data
      const historyEntry: HistoryEntry = {
        action,
        playerDamage,
        bossDamage,
        heal,
        turn,
        timestamp,
        special: isSpecial,
      };

      if (shouldEnrage) {
        setCurrentStory(storyIntro);
        setBattlePhase("result");
        setTimeout(() => {
          setCurrentStory(outcome);
          setTimeout(() => {
            if (newPlayerHealth > 0 && newBossHealth > 0) {
              setButtonsDisabled(false);
              setBattlePhase("action");
              setFocusedChoiceIndex(0);
            }
          }, 3000);
        }, 2500);
      } else {
        setCurrentStory(fullOutcome);
        setBattlePhase("result");
        setTimeout(() => {
          if (newPlayerHealth > 0 && newBossHealth > 0) {
            setButtonsDisabled(false);
            setBattlePhase("action");
            setFocusedChoiceIndex(0);
          }
        }, 3000);
      }

      setHistory([...history, historyEntry]);

      if (newPlayerHealth <= 0) {
        setGameOver(true);
        setVictory(false);
        setButtonsDisabled(false);
      } else if (newBossHealth <= 0) {
        setGameOver(true);
        setVictory(true);
        setButtonsDisabled(false);
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
      bossName,
    ]
  );

  const choices = useMemo(
    () => [
      {
        text: "ATTACK",
        action: () => processTurn("Attack"),
        ariaLabel: "Attack the boss with a basic attack",
      },
      {
        text: "DODGE",
        action: () => processTurn("Dodge"),
        ariaLabel: "Attempt to dodge the boss's next attack",
      },
      {
        text: "HEAL",
        action: () => processTurn("Heal"),
        ariaLabel: "Heal yourself to restore health points",
      },
      {
        text: specialCooldown > 0 ? `SPECIAL (${specialCooldown})` : "SPECIAL",
        action: () => processTurn("Special Attack"),
        disabled: specialCooldown > 0,
        ariaLabel:
          specialCooldown > 0
            ? `Special attack on cooldown for ${specialCooldown} more turns`
            : "Use special attack for high damage",
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

  // Render victory/defeat screen
  if (showVictoryDefeatScreen) {
    return (
      <div className="h-screen bg-black text-white font-mono overflow-hidden flex items-center justify-center">
        <div className="max-w-4xl mx-auto p-8 text-center">
          <div
            className={`bg-gray-900 border-2 rounded-lg p-8 shadow-2xl ${
              victory ? "border-green-600" : "border-red-600"
            }`}
          >
            {/* Victory/Defeat Icon */}
            <div className="mb-8">
              <h1
                className={`text-4xl sm:text-6xl font-bold mb-6 ${
                  victory ? "text-green-400" : "text-red-400"
                }`}
              >
                {victory ? "VICTORY!" : "DEFEAT!"}
              </h1>
            </div>

            {/* Battle Summary */}
            <div className="mb-8 p-4 bg-gray-800 border border-gray-600 rounded-lg">
              <h2 className="text-xl font-bold mb-4 text-gray-300">
                Battle Summary
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-gray-400">Turns Survived</div>
                  <div className="text-2xl font-bold text-white">{turn}</div>
                </div>
                <div className="text-center">
                  <div className="text-gray-400">Final Health</div>
                  <div
                    className={`text-2xl font-bold ${
                      playerHealth > 0 ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {playerHealth}/100
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-gray-400">Boss Health</div>
                  <div
                    className={`text-2xl font-bold ${
                      bossHealth > 0 ? "text-red-400" : "text-green-400"
                    }`}
                  >
                    {bossHealth}/150
                  </div>
                </div>
              </div>
            </div>

            {/* Story Text */}
            <div className="mb-8">
              <TypewriterText
                text={currentStory}
                onStart={() => setIsWriting(true)}
                onDone={() => {
                  setIsWriting(false);
                  setVictoryDefeatStoryComplete(true);
                }}
                className="text-lg sm:text-xl leading-relaxed text-gray-300 italic"
                speed={reducedMotion ? 5 : 30}
              />
            </div>

            {victoryDefeatStoryComplete && (
              <div className="space-y-6">
                {/* Speech Button */}
                <div className="flex justify-center mb-6">
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

                {/* Try Again Button */}
                <button
                  ref={tryAgainButtonRef}
                  onClick={resetGame}
                  className={`px-8 py-4 border-2 rounded-lg font-bold text-xl transition-all transform focus:outline-none focus:ring-4 ${
                    !reducedMotion ? "hover:scale-105 active:scale-95" : ""
                  } ${
                    victory
                      ? "bg-gray-800 text-green-400 border-green-400 hover:bg-gray-700 focus:ring-green-500"
                      : "bg-gray-800 text-red-400 border-red-400 hover:bg-gray-700 focus:ring-red-500"
                  }`}
                  aria-label={
                    victory
                      ? "Start a new quest and face another boss"
                      : "Try the battle again with a new boss"
                  }
                >
                  {victory ? "NEW QUEST" : "TRY AGAIN"}
                </button>

                <div className="text-gray-500 text-sm mt-4">
                  Press Enter or Space to continue
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Screen Reader Announcement */}
        <div className="sr-only" aria-live="assertive" aria-atomic="true">
          {victory
            ? `Victory! You have defeated ${bossName} in ${turn} turns with ${playerHealth} health remaining.`
            : `Defeat! You were defeated by ${bossName} after ${turn} turns.`}
        </div>
      </div>
    );
  }

  // Render intro screen
  if (showIntro) {
    const introMessage =
      "A dark aura emanates from the depths before you... You sense an overwhelming evil lurking in the darkness.";

    return (
      <div className="h-screen bg-black text-white font-mono overflow-hidden flex flex-col items-center justify-center">
        <GameHeader/>
        <div className="max-w-4xl mx-auto p-8 text-center">
          <div className="bg-black p-8 ">
            <div className="mb-8">
              <TypewriterText
                text={introMessage}
                onStart={() => setIsWriting(true)}
                onDone={() => {
                  setIsWriting(false);
                  setIntroComplete(true);
                }}
                className="text-lg sm:text-xl leading-relaxed text-gray-300 italic"
                speed={30}
              />
            </div>

            {introComplete && (
              <div className="space-y-6">
                <div className="text-red-400 font-bold text-xl sm:text-2xl mb-6">
                  Do you dare to continue?
                </div>
                {/* Speech Button for Intro */}
                <div className="flex justify-center mb-6">
                  <SpeechButton
                    text={introMessage}
                    speechState={speechState}
                    currentText={currentText}
                    onStart={handleSpeechStart}
                    onPause={handleSpeechPause}
                    onResume={handleSpeechResume}
                    onCancel={handleSpeechCancel}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
                  <button
                    onClick={startBattle}
                    className="px-6 py-4 bg-gray-800 text-red-400 border-2 border-red-600 rounded-lg font-bold text-base hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                    aria-label="Enter the battle arena and face the boss courageously"
                  >
                    FACE THE DARKNESS
                  </button>
                  <button
                    onClick={startBattle}
                    className="px-6 py-4 bg-gray-800 text-gray-300 border-2 border-gray-600 rounded-lg font-bold text-base hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
                    aria-label="Proceed with caution into the battle"
                  >
                    PROCEED CAREFULLY
                  </button>
                </div>
                <div className="text-gray-500 text-sm mt-4">
                  Press 1, 2, or Enter to continue
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-black text-white font-mono overflow-hidden">
      <div className="h-full flex flex-col lg:flex-row">
        <div className="flex-1 lg:flex-none lg:w-3/5 p-2 sm:p-4 flex flex-col">
          <div className="mb-2 sm:mb-4">
            <div className="bg-gray-900 border-2 border-gray-600 rounded-lg p-2 text-center">
              <span
                className="text-white font-bold text-base sm:text-lg"
                aria-live="polite"
                aria-label={`Current turn number ${turn}`}
              >
                TURN {turn}
              </span>
            </div>
          </div>

          <div className="flex-1 relative mb-2 sm:mb-4">
            <div
              className="h-full bg-gray-800 border-2 border-gray-600 rounded-lg relative overflow-hidden"
              role="img"
              aria-label={`Battle arena showing player versus ${bossName}`}
            >
              <Image
                src="/images/arena-background.png"
                alt="Battle arena background showing a dark, mystical battleground"
                fill
                className="absolute inset-0 w-full h-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-b from-gray-700/20 to-gray-800/40" />

              <div className="absolute bottom-4 left-4 w-2/5">
                <div className="flex justify-center mb-2 sm:mb-4">
                  <div
                    className={`relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-transparent border-2 border-gray-500 rounded-lg flex items-center justify-center transform transition-all duration-300 ${
                      !reducedMotion ? "hover:scale-105" : ""
                    }`}
                    role="img"
                    aria-label={`Player character with ${playerHealth} health points`}
                  >
                    <Image
                      src="/images/player.png"
                      alt="Player character sprite"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>

                <div className="bg-gray-900 border border-gray-600 rounded-lg p-2">
                  <div className="text-white font-bold text-xs sm:text-sm mb-1">
                    PLAYER
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-xs">HP:</span>
                    <div
                      className="flex-1 h-2 bg-gray-700 border border-gray-500 rounded"
                      role="progressbar"
                      aria-valuenow={playerHealth}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`Player health: ${playerHealth} out of 100 hit points`}
                    >
                      <div
                        className={`h-full transition-all duration-500 rounded ${
                          playerHealth > 60
                            ? "bg-green-500"
                            : playerHealth > 20
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        } ${
                          !reducedMotion && playerHealth < 20
                            ? "animate-pulse"
                            : ""
                        }`}
                        style={{ width: `${playerHealth}%` }}
                      />
                    </div>
                    <span className="text-white text-xs">
                      {playerHealth}/100
                    </span>
                  </div>
                </div>
              </div>

              <div className="absolute top-4 right-4 w-2/5">
                <div className="bg-gray-900 border border-gray-600 rounded-lg p-2">
                  <div
                    className="text-white font-bold text-xs sm:text-sm mb-1 truncate"
                    title={bossName}
                  >
                    {bossName.length > 20
                      ? bossName.substring(0, 20) + "..."
                      : bossName}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-xs">HP:</span>
                    <div
                      className="flex-1 h-2 bg-gray-700 border border-gray-500 rounded"
                      role="progressbar"
                      aria-valuenow={bossHealth}
                      aria-valuemin={0}
                      aria-valuemax={150}
                      aria-label={`${bossName} health: ${bossHealth} out of 150 hit points${
                        bossEnraged ? ", currently enraged" : ""
                      }`}
                    >
                      <div
                        className={`h-full transition-all duration-500 rounded ${
                          bossHealth > 100
                            ? "bg-green-500"
                            : bossHealth > 50
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        } ${
                          !reducedMotion && bossEnraged ? "animate-pulse" : ""
                        }`}
                        style={{ width: `${(bossHealth / 150) * 100}%` }}
                      />
                    </div>
                    <span className="text-white text-xs">{bossHealth}/150</span>
                  </div>
                  {bossEnraged && (
                    <div
                      className={`text-red-400 font-bold text-xs mt-1 ${
                        !reducedMotion ? "animate-pulse" : ""
                      }`}
                    >
                      ENRAGED
                    </div>
                  )}
                </div>
                <div className="flex justify-center mt-2 sm:mt-4">
                  <div
                    className={`relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-transparent border-2 border-gray-500 rounded-lg flex items-center justify-center transform transition-all duration-300 ${
                      !reducedMotion && bossEnraged
                        ? "animate-bounce border-red-500"
                        : !reducedMotion
                        ? "hover:scale-105"
                        : ""
                    }`}
                    role="img"
                    aria-label={`${bossName}${
                      bossEnraged ? " in an enraged state" : ""
                    } with ${bossHealth} health points`}
                  >
                    {bossName && (
                      <Image
                        src={`/images/${bossImageMap[bossName]}`}
                        alt={`${bossName} boss sprite${
                          bossEnraged ? " (enraged)" : ""
                        }`}
                        fill
                        className={`object-contain ${
                          bossEnraged
                            ? "filter hue-rotate-0 saturate-150 brightness-110"
                            : ""
                        }`}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-shrink-0">
            {!gameOver && (
              <div
                ref={choicesRef}
                className="grid grid-cols-2 gap-2 sm:gap-3"
                role="group"
                aria-label="Battle actions. Use arrow keys to navigate, Enter to select, or press 1-4 for quick selection"
              >
                {choices.map((choice, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAction(choice)}
                    disabled={choice.disabled || buttonsDisabled || isWriting}
                    className={`p-2 sm:p-3 md:p-4 border-2 rounded-lg font-bold text-xs sm:text-sm md:text-base transition-all transform focus:outline-none focus:ring-2 focus:ring-gray-400 ${
                      choice.disabled || buttonsDisabled || isWriting
                        ? "bg-gray-700 text-gray-500 cursor-not-allowed opacity-50 border-gray-600"
                        : `bg-gray-800 text-white hover:bg-gray-700 active:bg-gray-600 border-gray-600 hover:border-gray-500 ${
                            !reducedMotion
                              ? "hover:scale-105 active:scale-95"
                              : ""
                          } ${
                            focusedChoiceIndex === idx
                              ? "ring-2 ring-gray-400"
                              : ""
                          }`
                    }`}
                    aria-label={choice.ariaLabel}
                    tabIndex={focusedChoiceIndex === idx ? 0 : -1}
                  >
                    <span className="sr-only">Press {idx + 1} or </span>
                    {choice.text}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 lg:flex-none lg:w-2/5 p-2 sm:p-4 flex flex-col">
          <div className="h-64 sm:h-80 bg-gray-900 border-2 border-gray-600 rounded-lg overflow-hidden mb-2 sm:mb-4">
            <div className="bg-gray-800 text-white p-2 sm:p-3 border-b-2 border-gray-600">
              <h1 className="text-base sm:text-lg font-bold text-center">
                BATTLE LOG
              </h1>
            </div>
            <div
              ref={battleLogRef}
              className="flex-1 p-3 sm:p-4 overflow-y-auto"
              role="log"
              aria-live="polite"
              aria-label="Current battle narrative and events"
            >
              <div className="min-h-full flex flex-col justify-center">
                <div className="text-white text-sm sm:text-base leading-relaxed">
                  <TypewriterText
                    text={currentStory}
                    onStart={() => setIsWriting(true)}
                    onDone={() => {
                      setIsWriting(false);
                      if (gameOver) setEndStoryComplete(true);
                    }}
                    className="font-medium"
                    speed={reducedMotion ? 5 : 25}
                  />
                </div>
              </div>
            </div>
            <div className="border-t-2 border-gray-600 p-2 sm:p-3 bg-gray-800">
              <div className="flex justify-center">
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

          {/* Battle History - Fixed Scrolling */}
          <div className="flex-1 bg-gray-900 border-2 border-gray-600 rounded-lg overflow-hidden flex flex-col">
            <div className="bg-gray-800 text-white p-2 border-b-2 border-gray-600 flex-shrink-0">
              <h2 className="text-sm font-bold text-center">BATTLE HISTORY</h2>
            </div>
            <div
              className="flex-1 p-2 sm:p-3 overflow-y-auto"
              role="log"
              aria-label="Previous battle actions and their results"
              style={{ maxHeight: "calc(100% - 40px)" }}
            >
              {history.length === 0 ? (
                <div className="text-gray-500 text-xs text-center mt-4">
                  No previous actions
                </div>
              ) : (
                <div className="space-y-2">
                  {history.slice(-8).map((entry, idx) => (
                    <div
                      key={idx}
                      className="text-xs bg-gray-800 border border-gray-700 rounded p-2"
                    >
                      <div className="text-gray-400 font-bold flex justify-between items-center">
                        <span className="flex items-center gap-1">
                          Turn {entry.turn}: {entry.action}
                          {entry.special && (
                            <span
                              className="text-purple-400"
                              aria-label="Special attack"
                            >
                              ✨
                            </span>
                          )}
                        </span>
                        <span className="text-xs">{entry.timestamp}</span>
                      </div>
                      <div className="text-gray-300 text-xs mt-1 flex justify-between">
                        <div className="flex gap-3">
                          {entry.playerDamage > 0 && (
                            <span
                              className="text-red-400"
                              aria-label={`Dealt ${entry.playerDamage} damage`}
                            >
                              ⚔️ {entry.playerDamage} dmg
                            </span>
                          )}
                          {entry.heal > 0 && (
                            <span
                              className="text-green-400"
                              aria-label={`Healed ${entry.heal} health points`}
                            >
                              💚 +{entry.heal} HP
                            </span>
                          )}
                        </div>
                        {entry.bossDamage > 0 && (
                          <span
                            className="text-orange-400"
                            aria-label={`Took ${entry.bossDamage} damage`}
                          >
                            💥 -{entry.bossDamage} HP
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Screen Reader Instructions */}
      <div className="sr-only">
        <h1>Pokemon-style Boss Battle Game</h1>
        <p>
          Use keyboard navigation: Arrow keys to navigate choices, Enter to
          select, or press 1-4 for quick actions. The battle log will announce
          new events automatically. Current battle is against {bossName}.
        </p>
      </div>
    </div>
  );
};

export default BossPage;
