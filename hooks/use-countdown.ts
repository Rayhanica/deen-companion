"use client";

import { useEffect, useState } from "react";

export function useCountdown(target?: Date | null) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!target) {
      setSeconds(0);
      return;
    }

    const update = () => {
      setSeconds(Math.max(0, Math.floor((target.getTime() - Date.now()) / 1000)));
    };

    update();
    const interval = window.setInterval(update, 1000);
    return () => window.clearInterval(interval);
  }, [target]);

  return seconds;
}
