import React, { useState } from "react";

const BOX_SIZE = 400;
const CIRCLE_SIZE = 50;

const getRandomPosition = () => {
  const max = BOX_SIZE - CIRCLE_SIZE;
  const x = Math.floor(Math.random() * max);
  const y = Math.floor(Math.random() * max);
  return { x, y };
};

const ClickCircleGame: React.FC = () => {
  const [score, setScore] = useState(0);
  const [position, setPosition] = useState(getRandomPosition());

  const handleCircleClick = () => {
    setScore((prev) => prev + 1);
    setPosition(getRandomPosition());
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <h2 className="text-xl font-mono text-zinc-300">Score: {score}</h2>

      <div
        className="relative border-4 border-zinc-700 rounded-lg bg-zinc-900"
        style={{ width: BOX_SIZE, height: BOX_SIZE }}
      >
        <div
          onClick={handleCircleClick}
          className="absolute bg-zinc-500 hover:bg-zinc-400 rounded-full cursor-pointer transition-all duration-150"
          style={{
            width: CIRCLE_SIZE,
            height: CIRCLE_SIZE,
            left: position.x,
            top: position.y,
          }}
        />
      </div>
    </div>
  );
};

export default ClickCircleGame;
