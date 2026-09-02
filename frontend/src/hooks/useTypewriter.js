import { useEffect, useState } from "react";

export function useTypewriter(words, typingSpeed = 100, deletingSpeed = 50, pauseDuration = 1500) {
  const [wordIndex, setWordIndex] = useState(0);
  const [text, setText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!words.length) {
      return undefined;
    }

    const currentWord = words[wordIndex % words.length];
    const isWordComplete = text === currentWord;
    const isTextEmpty = text.length === 0;
    const delay = isWordComplete && !isDeleting
      ? pauseDuration
      : isDeleting
        ? deletingSpeed
        : typingSpeed;

    const timer = setTimeout(() => {
      if (isWordComplete && !isDeleting) {
        setIsDeleting(true);
      } else if (isDeleting && isTextEmpty) {
        setIsDeleting(false);
        setWordIndex((currentIndex) => (currentIndex + 1) % words.length);
      } else {
        const nextLength = text.length + (isDeleting ? -1 : 1);
        setText(currentWord.slice(0, nextLength));
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [deletingSpeed, isDeleting, pauseDuration, text, typingSpeed, wordIndex, words]);

  return text;
}
