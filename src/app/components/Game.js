'use client';

import React, { useEffect, useRef, useState } from 'react';

const Game = () => {
  const canvasRef = useRef(null);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);

  const birdImageRef = useRef(null);
  const backgroundImageRef = useRef(null);
  const topPipeImageRef = useRef(null);
  const bottomPipeImageRef = useRef(null);
  const scoreRef = useRef(score);

  const resetGame = () => {
    setGameOver(false);
    setGameStarted(false);
    setScore(0);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const birdImage = birdImageRef.current;
    const backgroundImage = backgroundImageRef.current;
    const topPipeImage = topPipeImageRef.current;
    const bottomPipeImage = bottomPipeImageRef.current;

    const bird = {
      x: 50,
      y: 300,
      width: 34,
      height: 24,
      gravity: 0.5,
      lift: -6,
      velocity: 0,
    };

    let pipes = [];
    const pipeWidth = 52;
    let pipeGap = 150;
    let pipeInterval = 3000;
    const pipeVelocity = 1;

    const adjustForScreenSize = () => {
      const screenWidth = window.innerWidth;

      if (screenWidth < 600) {
        pipeGap = 115;
        pipeInterval = 2000;
      } else {
        pipeGap = 150;
        pipeInterval = 3000;
      }
    };

    const resizeCanvas = () => {
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;

      if (screenWidth >= 600) {
        const aspectRatio = 4 / 3;
        let width = 800;
        let height = width / aspectRatio;

        if (width > screenWidth * 0.9) {
          width = screenWidth * 0.9;
          height = width / aspectRatio;
        }
        if (height > screenHeight * 0.9) {
          height = screenHeight * 0.9;
          width = height * aspectRatio;
        }

        canvas.width = width;
        canvas.height = height;
      } else {
        let width = screenWidth * 0.9;
        let height = screenHeight * 0.9;
        canvas.width = width;
        canvas.height = height;
      }

      adjustForScreenSize();
      bird.y = canvas.height / 2 - bird.height / 2;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let lastPipeTime = Date.now();
    let animationFrameId;

    const updateGame = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

      if (gameStarted) {
        if (Date.now() - lastPipeTime > pipeInterval) {
          lastPipeTime = Date.now();
          const minHeight = 50;
          const maxHeight = canvas.height - 50 - pipeGap;
          const pipeTopY = Math.floor(Math.random() * (maxHeight - minHeight) + minHeight);
          pipes.push({ x: canvas.width, y: pipeTopY - canvas.height, passed: false });
        }

        pipes = pipes.filter(pipe => pipe.x + pipeWidth > 0); 

        pipes.forEach(pipe => {
          pipe.x -= pipeVelocity;
          ctx.drawImage(topPipeImage, pipe.x, pipe.y, pipeWidth, canvas.height);
          const bottomPipeY = pipe.y + canvas.height + pipeGap;
          ctx.drawImage(bottomPipeImage, pipe.x, bottomPipeY, pipeWidth, canvas.height);

          if (!pipe.passed && pipe.x + pipeWidth < bird.x) {
            pipe.passed = true;
           
            scoreRef.current += 1;
            setScore(scoreRef.current);
          }
        });

        bird.velocity += bird.gravity;
        bird.y += bird.velocity;

        if (bird.y <= 0 || bird.y + bird.height >= canvas.height) {
          setGameOver(true);
        }

        ctx.drawImage(birdImage, bird.x, bird.y, bird.width, bird.height);

        if (pipes.some(pipe => (
          bird.x + bird.width > pipe.x &&
          bird.x < pipe.x + pipeWidth &&
          (bird.y <= pipe.y + canvas.height || bird.y + bird.height >= pipe.y + canvas.height + pipeGap)
        ))) {
          setGameOver(true);
        }


        ctx.fillStyle = '#fff';
        ctx.font = '30px Arial';
        ctx.fillText(`Score: ${scoreRef.current}`, 10, 40);
      } else {
        ctx.fillStyle = '#fff';
        ctx.font = '30px Arial';
        ctx.fillText(`Score: ${scoreRef.current}`, 10, 40);
      }

      if (!gameOver) {
        animationFrameId = requestAnimationFrame(updateGame);
      }
    };

    const handleKeyPress = (e) => {
      if (e.key === ' ' && !gameOver) {
        if (!gameStarted) {
          setGameStarted(true);
        }
        bird.velocity = bird.lift;
      }
    };

    const handleTouchStart = () => {
      if (!gameOver) {
        if (!gameStarted) {
          setGameStarted(true);
        }
        bird.velocity = bird.lift;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    document.addEventListener('touchstart', handleTouchStart);
    animationFrameId = requestAnimationFrame(updateGame);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
      document.removeEventListener('keydown', handleKeyPress);
      document.removeEventListener('touchstart', handleTouchStart);
    };
  }, [gameOver, gameStarted]);

  return (
    <div style={{ 
      position: 'relative', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh', 
      width: '100%', 
      padding: '10px', 
      boxSizing: 'border-box'
    }}>
      <div style={{ 
        position: 'relative', 
        maxWidth: '100%', 
        maxHeight: '100%', 
        overflow: 'hidden', 
        width: 'auto', 
        height: 'auto' 
      }}>
        <canvas ref={canvasRef}></canvas>

        <img ref={birdImageRef} src="/images/bird.png" alt="Bird" style={{ display: 'none' }} />
        <img ref={backgroundImageRef} src="/images/background.png" alt="Background" style={{ display: 'none' }} />
        <img ref={topPipeImageRef} src="/images/top-pipe.png" alt="Top Pipe" style={{ display: 'none' }} />
        <img ref={bottomPipeImageRef} src="/images/bottom-pipe.png" alt="Bottom Pipe" style={{ display: 'none' }} />

        {!gameStarted && !gameOver && (
          <div style={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)', 
            textAlign: 'center', 
            color: '#fff', 
            fontSize: 'calc(12px + 2vmin)', 
            fontFamily: 'Arial, sans-serif', 
            padding: '20px', 
            backgroundColor: 'rgba(0, 0, 0, 0.4)', 
            borderRadius: '10px'
          }}>
            <h1 style={{ margin: '0 0 10px 0' }}>Welcome</h1>
            <p>Press Space or Tap to Start</p>
          </div>
        )}

        {gameOver && (
          <div style={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)', 
            textAlign: 'center', 
            color: '#fff', 
            fontSize: 'calc(12px + 2vmin)', 
            fontFamily: 'Arial, sans-serif', 
            padding: '20px', 
            backgroundColor: 'rgba(0, 0, 0, 0.4)', 
            borderRadius: '10px'
          }}>
            <h1 style={{ margin: '0 0 10px 0' }}>Game Over</h1>
            <p>Final Score: {score}</p>
            <button onClick={resetGame} style={{ 
              fontSize: 'calc(10px + 1vmin)', 
              padding: '10px 20px', 
              cursor: 'pointer', 
              borderRadius: '5px', 
              backgroundColor: '#4CAF50', 
              color: 'white', 
              border: 'none' 
            }}>Start Over</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Game;
