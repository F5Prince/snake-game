// SnakeGame.jsx
import React, { useEffect, useRef, useState } from "react";
import "./app.css";
import "./main.css";

const SnakeGame = () => {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState("");
  const [level, setLevel] = useState(1);
  const [intervalId, setIntervalId] = useState(null);
  const [muted, setMuted] = useState(false);

  const foodTimerRef = useRef(null);
  const blinkStateRef = useRef(true);
  const tongueStateRef = useRef(false);
  const box = 20;
  const name = "SONAM";
  const snakeRef = useRef([]);
  const directionRef = useRef("RIGHT");
  const letterIndexRef = useRef(0);
  const foodRef = useRef(null);
  const gameRunningRef = useRef(false);

  const hissSound = useRef(null);
  const eatSound = useRef(null);
  const gameOverSound = useRef(null);
  const winSound = useRef(null);
  const buttonClickSound = useRef(null);

  useEffect(() => {
    hissSound.current = new Audio("/hiss.mp3");
    eatSound.current = new Audio("/eat.mp3");
    gameOverSound.current = new Audio("/gameover.mp3");
    winSound.current = new Audio("/win.mp3");
    buttonClickSound.current = new Audio("/click.mp3");
  }, []);

  useEffect(() => {
    const blinkInterval = setInterval(() => {
      blinkStateRef.current = !blinkStateRef.current;
    }, 600);
    return () => clearInterval(blinkInterval);
  }, []);

  useEffect(() => {
    const tongueInterval = setInterval(() => {
      tongueStateRef.current = !tongueStateRef.current;
    }, 400);
    return () => clearInterval(tongueInterval);
  }, []);

  const playSound = (soundRef) => {
    if (!muted && soundRef?.current) {
      soundRef.current.currentTime = 0;
      soundRef.current.play();
    }
  };

  const createFood = () => {
    const canvas = canvasRef.current;
    const letter = name[letterIndexRef.current];
    let x, y;
    do {
      x = Math.floor(Math.random() * (canvas.width / box)) * box;
      y = Math.floor(Math.random() * (canvas.height / box)) * box;
    } while (snakeRef.current.some((s) => s.x === x && s.y === y));
    foodRef.current = { x, y, char: letter };

    if (foodTimerRef.current) clearTimeout(foodTimerRef.current);
    const time = level === 1 ? 20000 : level === 2 ? 15000 : level === 3 ? 10000 : 8000;
    foodTimerRef.current = setTimeout(() => {
      foodRef.current = null;
      createFood();
    }, time);

    playSound(hissSound);
  };

  const draw = () => {
    if (!gameRunningRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const snake = snakeRef.current;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const earnedLetters = letterIndexRef.current;

    snake.forEach((segment, i) => {
      ctx.save();
      const cx = segment.x + box / 2;
      const cy = segment.y + box / 2;

      if (i === 0) {
        ctx.fillStyle = "#00ff99";
        ctx.shadowColor = "#00ffcc";
        ctx.shadowBlur = 18;
        ctx.beginPath();
        const size = box / 2.2;
        const dir = directionRef.current;
        if (dir === "RIGHT") {
          ctx.moveTo(cx - size, cy - size);
          ctx.lineTo(cx - size, cy + size);
          ctx.lineTo(cx + size, cy);
        } else if (dir === "LEFT") {
          ctx.moveTo(cx + size, cy - size);
          ctx.lineTo(cx + size, cy + size);
          ctx.lineTo(cx - size, cy);
        } else if (dir === "UP") {
          ctx.moveTo(cx - size, cy + size);
          ctx.lineTo(cx + size, cy + size);
          ctx.lineTo(cx, cy - size);
        } else if (dir === "DOWN") {
          ctx.moveTo(cx - size, cy - size);
          ctx.lineTo(cx + size, cy - size);
          ctx.lineTo(cx, cy + size);
        }
        ctx.closePath();
        ctx.fill();

        if (blinkStateRef.current) {
          ctx.shadowBlur = 0;
          ctx.fillStyle = "#000";
          const eyeOffset = 4;
          const eyeRadius = 2;
          if (dir === "RIGHT") {
            ctx.beginPath(); ctx.arc(cx - 2, cy - eyeOffset, eyeRadius, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(cx - 2, cy + eyeOffset, eyeRadius, 0, Math.PI * 2); ctx.fill();
          } else if (dir === "LEFT") {
            ctx.beginPath(); ctx.arc(cx + 2, cy - eyeOffset, eyeRadius, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(cx + 2, cy + eyeOffset, eyeRadius, 0, Math.PI * 2); ctx.fill();
          } else if (dir === "UP") {
            ctx.beginPath(); ctx.arc(cx - eyeOffset, cy + 2, eyeRadius, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(cx + eyeOffset, cy + 2, eyeRadius, 0, Math.PI * 2); ctx.fill();
          } else if (dir === "DOWN") {
            ctx.beginPath(); ctx.arc(cx - eyeOffset, cy - 2, eyeRadius, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(cx + eyeOffset, cy - 2, eyeRadius, 0, Math.PI * 2); ctx.fill();
          }
        }

        if (tongueStateRef.current) {
          ctx.strokeStyle = "#f00";
          ctx.lineWidth = 2;
          ctx.beginPath();
          if (dir === "RIGHT") ctx.moveTo(cx + size, cy), ctx.lineTo(cx + size + 10, cy);
          else if (dir === "LEFT") ctx.moveTo(cx - size, cy), ctx.lineTo(cx - size - 10, cy);
          else if (dir === "UP") ctx.moveTo(cx, cy - size), ctx.lineTo(cx, cy - size - 10);
          else if (dir === "DOWN") ctx.moveTo(cx, cy + size), ctx.lineTo(cx, cy + size + 10);
          ctx.stroke();
        }
      } else {
        ctx.fillStyle = "#0ff";
        ctx.shadowColor = "#0ff";
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(cx, cy, box / 2.5, 0, Math.PI * 2);
        ctx.fill();

        const charIndex = i - 1;
        if (charIndex < earnedLetters) {
          ctx.shadowBlur = 0;
          ctx.fillStyle = "#000";
          ctx.font = "bold 14px Courier";
          ctx.fillText(name[charIndex], segment.x + 5, segment.y + 15);
        }
      }
      ctx.restore();
    });

    const food = foodRef.current;
    if (food) {
      ctx.fillStyle = "#ff0";
      ctx.font = "20px Courier";
      ctx.fillText(food.char, food.x + 5, food.y + 18);
    }

    let headX = snake[0].x;
    let headY = snake[0].y;
    const dir = directionRef.current;
    if (dir === "LEFT") headX -= box;
    if (dir === "UP") headY -= box;
    if (dir === "RIGHT") headX += box;
    if (dir === "DOWN") headY += box;
    const newHead = { x: headX, y: headY };

    if (
      headX < 0 || headY < 0 ||
      headX >= canvas.width || headY >= canvas.height ||
      snake.some((s) => s.x === headX && s.y === headY)
    ) {
      clearInterval(intervalId);
      gameRunningRef.current = false;
      setMessage("Game Over!");
      playSound(gameOverSound);
      return;
    }

    const foodEaten = food && headX === food.x && headY === food.y;
    if (foodEaten) {
      playSound(eatSound);
      setScore(prev => prev + 1);
      letterIndexRef.current++;
      if (letterIndexRef.current >= name.length) {
        setMessage("🎉 Congratulations PRASHANT! 🎉");
        playSound(winSound);
        clearInterval(intervalId);
        gameRunningRef.current = false;
      } else {
        createFood();
      }
      if (letterIndexRef.current <= name.length) {
        const tail = snake[snake.length - 1];
        snake.push({ ...tail });
      }
    } else {
      snake.pop();
    }

    snake.unshift(newHead);
  };

  const startGame = () => {
    playSound(buttonClickSound);
    setScore(0);
    setMessage("");
    letterIndexRef.current = 0;
    directionRef.current = "RIGHT";
    snakeRef.current = [{ x: box * 5, y: box * 5 }];
    createFood();
    gameRunningRef.current = true;
    if (intervalId) clearInterval(intervalId);
    const id = setInterval(draw, 1000 / level);
    setIntervalId(id);
  };

  const handleKeyDown = (e) => {
    const key = e.key;
    const dir = directionRef.current;
    if (key === "ArrowLeft" && dir !== "RIGHT") directionRef.current = "LEFT";
    if (key === "ArrowUp" && dir !== "DOWN") directionRef.current = "UP";
    if (key === "ArrowRight" && dir !== "LEFT") directionRef.current = "RIGHT";
    if (key === "ArrowDown" && dir !== "UP") directionRef.current = "DOWN";
  };

  const handleMobileControl = (dir) => {
    const current = directionRef.current;
    if (dir === "LEFT" && current !== "RIGHT") directionRef.current = "LEFT";
    if (dir === "UP" && current !== "DOWN") directionRef.current = "UP";
    if (dir === "RIGHT" && current !== "LEFT") directionRef.current = "RIGHT";
    if (dir === "DOWN" && current !== "UP") directionRef.current = "DOWN";
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="game-container">
      <canvas ref={canvasRef} width="400" height="400" />
      <p id="message">{message}</p>
      <p id="score">Score: {score}</p>

      <div className="top-controls">
        <button className="play" onClick={startGame}>▶ Start</button>
        <select onChange={(e) => setLevel(parseFloat(e.target.value))} defaultValue={1}>
          <option value={1}>🐌 Easy</option>
          <option value={2}>🚶 Medium</option>
          <option value={3}>🏃 Hard</option>
          <option value={4}>⚡ Insane</option>
        </select>
        <button onClick={() => setMuted(!muted)}>{muted ? "🔇 Mute" : "🔊 Sound"}</button>
      </div>

      <div className="mobile-controls">
        <div className="row">
          <button className="arrow" onClick={() => handleMobileControl("UP")}>⬆</button>
        </div>
        <div className="row">
          <button className="arrow" onClick={() => handleMobileControl("LEFT")}>⬅</button>
          <button className="arrow" onClick={() => handleMobileControl("DOWN")}>⬇</button>
          <button className="arrow" onClick={() => handleMobileControl("RIGHT")}>➡</button>
        </div>
      </div>
    </div>
  );
};

export default SnakeGame;
