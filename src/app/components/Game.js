'use client'

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

const Game = () => {
  const canvasRef = useRef(null);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [score, setScore] = useState(0);

  let birdImage, backgroundImage, topPipeImage, bottomPipeImage;

  if (typeof window !== "undefined") {
    birdImage = new Image();
    birdImage.src = '/images/bird.png';
    backgroundImage = new Image();
    backgroundImage.src = '/images/background.png';
    topPipeImage = new Image();
    topPipeImage.src = '/images/top-pipe.png';
    bottomPipeImage = new Image();
    bottomPipeImage.src = '/images/bottom-pipe.png';
  }

  const bird = {
    x: 50,
    y: 300,
    width: 34,
    height: 24,
    gravity: 0.5,
    lift: -6,
    velocity: 0
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

  const resetGame = () => {
    setGameOver(false);
    setGameStarted(false);
    setShowInstructions(true);
    setScore(0);
    bird.y = 300;
    bird.velocity = 0;
    pipes = [];
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

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

        pipes.forEach(pipe => {
          pipe.x -= pipeVelocity;
          ctx.drawImage(topPipeImage, pipe.x, pipe.y, pipeWidth, canvas.height);
          let bottomPipeY = pipe.y + canvas.height + pipeGap;
          ctx.drawImage(bottomPipeImage, pipe.x, bottomPipeY, pipeWidth, canvas.height);

          if (!pipe.passed && pipe.x + pipeWidth < bird.x) {
            pipe.passed = true;
            setScore(prevScore => prevScore + 1);
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
      }

      if (!gameOver) {
        animationFrameId = requestAnimationFrame(updateGame);
      }
    };

    const handleKeyPress = (e) => {
      if (e.key === ' ' && !gameOver) {
        if (!gameStarted) {
          setGameStarted(true);
          setShowInstructions(false);
        }
        bird.velocity = bird.lift;
      }
    };

    const handleTouchStart = () => {
      if (!gameOver) {
        if (!gameStarted) {
          setGameStarted(true);
          setShowInstructions(false);
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

        {showInstructions && !gameStarted && (
          <div style={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)', 
            textAlign: 'center', 
            color: '#fff', 
            fontSize: 'calc(10px + 2vmin)', 
            fontFamily: 'Arial, sans-serif', 
            padding: '0 10px', 
            boxSizing: 'border-box'
          }}>
            <h1 style={{ margin: '0 0 10px 0' }}>Welcome!</h1>
            <p>Press <strong>Space</strong> or tap the screen to start and control the bird.</p>
          </div>
        )}
        {gameStarted && (
          <div style={{ 
            position: 'absolute', 
            top: '5%', 
            left: '50%', 
            transform: 'translateX(-50%)', 
            textAlign: 'center', 
            color: '#fff', 
            fontSize: 'calc(10px + 2vmin)', 
            fontFamily: 'Arial, sans-serif', 
            padding: '0 10px', 
            boxSizing: 'border-box'
          }}>
            <h1 style={{ margin: '0 0 10px 0' }}>Score: {score}</h1>
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
            fontSize: 'calc(10px + 2vmin)', 
            fontFamily: 'Arial, sans-serif', 
            padding: '0 10px', 
            boxSizing: 'border-box'
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
