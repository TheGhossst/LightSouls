import React, { useState } from "react";

const BOX_SIZE = 400;
const SOUL_SIZE = 50;

const getRandomPosition = () => {
  const max = BOX_SIZE - SOUL_SIZE;
  const x = Math.floor(Math.random() * max);
  const y = Math.floor(Math.random() * max);
  return { x, y };
};

const ClickSoulGame: React.FC = () => {
  const [score, setScore] = useState(0);
  const [position, setPosition] = useState(getRandomPosition());

  const handleSoulClick = () => {
    setScore((prev) => prev + 1);
    setPosition(getRandomPosition());
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <h2 className="text-xl font-mono text-zinc-300">
        Souls Collected: {score}
      </h2>

      <div
        className="relative rounded-lg"
        style={{
          width: BOX_SIZE,
          height: BOX_SIZE,
          background: "radial-gradient(circle at center, #0f0f0f, #000000)",
        }}
      >
        <div
          onClick={handleSoulClick}
          className="absolute rounded-full cursor-pointer shadow-lg transition-all duration-150"
          style={{
            width: SOUL_SIZE,
            height: SOUL_SIZE,
            left: position.x,
            top: position.y,
            background:
              "radial-gradient(circle, #fff 0%, #ccc 60%, #0000 100%)",
            boxShadow: "0 0 12px 6px rgba(255, 255, 255, 0.5)",
          }}
        />
      </div>
    </div>
  );
};

export default ClickSoulGame;
