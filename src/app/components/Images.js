import Image from 'next/image';

const GameComponent = () => {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}>
      {}
      <Image 
        src="/images/background.png" 
        alt="Background" 
        fill 
        style={{ objectFit: 'cover', position: 'absolute', top: 0, left: 0, zIndex: -1 }}
        priority 
      />
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 1 }}>
        <Image 
          src="/images/bird.png" 
          alt="Bird" 
          width={50} 
          height={50} 
          priority 
        />
      </div>
    </div>
  );
};

export default GameComponent;
