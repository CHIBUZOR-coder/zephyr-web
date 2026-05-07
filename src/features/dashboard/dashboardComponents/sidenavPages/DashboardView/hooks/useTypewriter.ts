import { useState, useEffect } from "react";

export const useTypewriter = (text: string, speed = 45) => {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    setDisplayed(""); // reset immediately when text changes (mode switch)
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(interval);
    }, speed);

    return () => clearInterval(interval); // cleanup on unmount or text change
  }, [text, speed]);

  return displayed;
};
