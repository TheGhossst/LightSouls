import React, { useState, useEffect, useRef } from "react";

interface Props {
  text: string;
  speed?: number;
  onStart?: () => void;
  onDone?: () => void;
  className?: string;
}

const TypewriterText: React.FC<Props> = ({
  text,
  speed = 30,
  onStart,
  onDone,
  className,
}) => {
  const [displayedText, setDisplayedText] = useState("");
  const hasStartedRef = useRef(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setDisplayedText("");
    hasStartedRef.current = false;

    let index = 0;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      if (!hasStartedRef.current) {
        hasStartedRef.current = true;
        if (onStart) onStart();
      }

      const nextText = text.slice(0, index + 1);
      setDisplayedText(nextText);
      index++;

      if (index === text.length) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (onDone) onDone();
      }
    }, speed);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [text, speed]);

  return <p className={className}>{displayedText}</p>;
};

export default TypewriterText;
