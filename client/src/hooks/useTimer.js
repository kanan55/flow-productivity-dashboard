// Custom hook — countdown timer for Pomodoro focus sessions
// Returns time remaining, running state, and control functions

import { useState, useEffect, useRef, useCallback } from "react";

export function useTimer(initialMinutes = 25) {
    const [totalSeconds, setTotalSeconds] = useState(initialMinutes * 60);
    const [isRunning, setIsRunning] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    const intervalRef = useRef(null);

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const progress = 1 - totalSeconds / (initialMinutes * 60);

    const start = useCallback(() => {
        setIsRunning(true);
        setIsComplete(false);
    }, []);

    const pause = useCallback(() => {
        setIsRunning(false);
    }, []);

    const reset = useCallback(
        (newMinutes) => {
            setIsRunning(false);
            setIsComplete(false);
            setTotalSeconds((newMinutes || initialMinutes) * 60);
        },
        [initialMinutes]
    );

    useEffect(() => {
        if (isRunning) {
            intervalRef.current = setInterval(() => {
                setTotalSeconds((prev) => {
                    if (prev <= 1) {
                        clearInterval(intervalRef.current);
                        setIsRunning(false);
                        setIsComplete(true);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            clearInterval(intervalRef.current);
        }

        return () => clearInterval(intervalRef.current);
    }, [isRunning]);

    return {
        minutes,
        seconds,
        progress,
        isRunning,
        isComplete,
        totalSeconds,
        start,
        pause,
        reset,
    };
}
