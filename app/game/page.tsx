"use client";

import React, { useState, useEffect, useCallback } from "react";
import GameHeader from "./components/GameHeader";
import GameLoading from "./components/GameLoading";

interface Choice {
  text: string;
  isCorrect: boolean;
  reason: string;
}

interface RoundData {
  story: string;
  choice1: Choice;
  choice2: Choice;
}

interface HistoryEntry {
  choice: string;
  reason: string;
}

const LightsoulsPage = () => {
  const [round, setRound] = useState(0);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [roundData, setRoundData] = useState<RoundData | null>(null);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [backstory, setBackstory] = useState<string | null>(null);
  const [started, setStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<Choice | null>(null);
  const [shuffledChoices, setShuffledChoices] = useState<Choice[]>([]);

  const fetchBackstory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ history: [], round: 1 }),
      });

      const data = await res.json();
      setBackstory(data.story);
    } catch (err) {
      console.error("Failed to fetch backstory", err);
    }
    setLoading(false);
  }, []);

  const fetchGameRound = async (
    currentRound: number,
    currentHistory: HistoryEntry[]
  ) => {
    setLoading(true);
    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ history: currentHistory, round: currentRound }),
      });

      const data = await res.json();
      setRoundData(data);

      const choices = [data.choice1, data.choice2];
      setShuffledChoices(Math.random() > 0.5 ? choices : choices.reverse());

      setSelectedReason(null);
      setSelectedChoice(null);
    } catch (err) {
      console.error("Failed to fetch round", err);
    }
    setLoading(false);
  };

  const handleStartJourney = () => {
    setStarted(true);
    setRound(1);
    fetchGameRound(1, []);
  };

  const handleChoice = (choice: Choice) => {
    setSelectedChoice(choice);
    setSelectedReason(choice.reason);

    const newHistoryEntry = { choice: choice.text, reason: choice.reason };
    const newHistory = [...history, newHistoryEntry];
    setHistory(newHistory);

    if (!choice.isCorrect) {
      setTimeout(() => setGameOver(true), 3000);
    } else if (round >= 10) {
      setTimeout(() => setGameOver(true), 3000);
    } else {
      setTimeout(() => {
        const nextRound = round + 1;
        setRound(nextRound);
        fetchGameRound(nextRound, newHistory);
      }, 5000);
    }
  };

  const resetGame = () => {
    setRound(0);
    setHistory([]);
    setRoundData(null);
    setSelectedReason(null);
    setSelectedChoice(null);
    setBackstory(null);
    setGameOver(false);
    setStarted(false);
    setShuffledChoices([]);
    fetchBackstory();
  };

  useEffect(() => {
    fetchBackstory();
  }, [fetchBackstory]);

  const getChoiceButtonStyle = (choice: Choice) => {
    if (!selectedChoice) {
      return "bg-zinc-800 hover:bg-zinc-700 border-zinc-600 hover:border-zinc-500 hover:shadow-lg";
    }
    if (selectedChoice === choice) {
      return choice.isCorrect
        ? "bg-emerald-900/50 border-emerald-600 text-emerald-100"
        : "bg-red-900/50 border-red-600 text-red-100";
    }
    return "bg-zinc-800/50 opacity-50 cursor-not-allowed border-zinc-700";
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 sm:py-8">
        <GameHeader />

        {started && !gameOver && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-zinc-400 font-mono">Round</span>
              <span className="text-sm text-white font-mono">{round}/10</span>
            </div>
            <div className="w-full bg-zinc-800 rounded-sm h-1">
              <div
                className="h-full bg-white transition-all duration-500 ease-out rounded-sm"
                style={{ width: `${(round / 10) * 100}%` }}
              />
            </div>
          </div>
        )}

        {loading && <GameLoading />}

        {!started && backstory && !roundData && !loading && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6 sm:p-8">
              <div className="mb-6">
                <h2 className="text-xl font-mono text-white mb-4">Begin</h2>
                <p className="text-zinc-300 leading-relaxed text-base italic sm:text-lg">
                  {backstory}
                </p>
              </div>
              <button
                onClick={handleStartJourney}
                className="w-full sm:w-auto px-6 py-3 bg-white text-black font-mono hover:bg-zinc-200 transition-colors rounded"
              >
                Start Journey
              </button>
            </div>
          </div>
        )}

        {started && roundData && !gameOver && !loading && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6">
              <p className="text-zinc-300 leading-relaxed text-base italic sm:text-lg">
                {roundData.story}
              </p>
            </div>

            <div className="space-y-4">
              {shuffledChoices.map((choice, idx) => (
                <button
                  key={idx}
                  onClick={() => handleChoice(choice)}
                  disabled={!!selectedChoice}
                  className={`w-full px-4 py-3 rounded-lg text-left transition border ${getChoiceButtonStyle(
                    choice
                  )}`}
                >
                  {choice.text}
                </button>
              ))}
            </div>

            {selectedChoice && selectedReason && (
              <div
                className={`p-5 rounded-lg border animate-in fade-in duration-300 ${
                  selectedChoice.isCorrect
                    ? "bg-emerald-950/30 border-emerald-800"
                    : "bg-red-950/30 border-red-800"
                }`}
              >
                <div className="flex items-start space-x-3">
                  <span
                    className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 ${
                      selectedChoice.isCorrect
                        ? "bg-emerald-600 text-white"
                        : "bg-red-600 text-white"
                    }`}
                  >
                    {selectedChoice.isCorrect ? "✓" : "✗"}
                  </span>
                  <div className="flex-1">
                    <p
                      className={`text-sm font-medium mb-1 ${
                        selectedChoice.isCorrect
                          ? "text-emerald-400"
                          : "text-red-400"
                      }`}
                    >
                      {selectedChoice.isCorrect ? "Success" : "Failure"}
                    </p>
                    <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
                      {selectedReason}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {gameOver && (
          <div className="max-w-xl mx-auto text-center">
            <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-8 sm:p-10">
              <h2 className="text-3xl sm:text-4xl font-mono font-bold mb-6">
                {round >= 10 ? "Victory" : "Game Over"}
              </h2>
              <p className="text-zinc-400 mb-2">
                {round >= 10
                  ? "You completed all 10 rounds!"
                  : `Journey ended at round ${round}`}
              </p>
              <p className="text-zinc-500 text-sm mb-8">
                Choices made: {history.length}
              </p>
              <button
                onClick={resetGame}
                className="px-6 py-3 bg-white text-black font-mono hover:bg-zinc-200 transition-colors rounded"
              >
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LightsoulsPage;
