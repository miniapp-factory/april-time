"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Share } from "@/components/share";
import { url } from "@/lib/metadata";

const fruits = ["apple", "banana", "cherry", "lemon"] as const;
type Fruit = typeof fruits[number];

function randomFruit(): Fruit {
  return fruits[Math.floor(Math.random() * fruits.length)];
}

export default function SlotMachine() {
  const [grid, setGrid] = useState<Fruit[][]>(
    Array.from({ length: 3 }, () => Array.from({ length: 3 }, randomFruit))
  );
  const [spinning, setSpinning] = useState(false);
  const [win, setWin] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setGrid(
      Array.from({ length: 3 }, () => Array.from({ length: 3 }, randomFruit))
    );
  }, []);

  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    setWin(false);
    let ticks = 0;
    let lastGrid: Fruit[][] | null = null;
    intervalRef.current = setInterval(() => {
      setGrid((prev) => {
        const newGrid = prev.map((col) => [...col]); // copy
        for (let c = 0; c < 3; c++) {
          for (let r = 2; r > 0; r--) {
            newGrid[c][r] = newGrid[c][r - 1];
          }
          newGrid[c][0] = randomFruit();
        }
        lastGrid = newGrid;
        return newGrid;
      });
      ticks++;
      if (ticks >= 10) {
        clearInterval(intervalRef.current!);
        intervalRef.current = null;
        setSpinning(false);
        if (lastGrid) {
          // check rows
          for (let r = 0; r < 3; r++) {
            if (
              lastGrid[0][r] === lastGrid[1][r] &&
              lastGrid[1][r] === lastGrid[2][r]
            ) {
              setWin(true);
              return;
            }
          }
          // check columns
          for (let c = 0; c < 3; c++) {
            if (
              lastGrid[c][0] === lastGrid[c][1] &&
              lastGrid[c][1] === lastGrid[c][2]
            ) {
              setWin(true);
              return;
            }
          }
        }
      }
    }, 200);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="grid grid-cols-3 gap-2">
        {grid.map((col, cIdx) =>
          col.map((fruit, rIdx) => (
            <img
              key={`${cIdx}-${rIdx}`}
              src={`/${fruit}.png`}
              alt={fruit}
              width={64}
              height={64}
            />
          ))
        )}
      </div>
      <Button onClick={spin} disabled={spinning}>
        {spinning ? "Spinning..." : "Spin"}
      </Button>
      {win && !spinning && (
        <div className="flex flex-col items-center gap-2">
          <span className="text-xl font-bold">You win!</span>
          <Share text={`I just won with the Fruit Slot Machine! ${url}`} />
        </div>
      )}
    </div>
  );
}
