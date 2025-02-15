import React, { useState, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

interface SoundControlProps {
  isDarkMode: boolean;
}

const SoundControl: React.FC<SoundControlProps> = ({ isDarkMode }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const toggleSound = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio('https://cdn.pixabay.com/download/audio/2022/03/24/audio_1b1cad00c2.mp3');
      audioRef.current.loop = true;
    }

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <button
      onClick={toggleSound}
      className={`p-2 rounded-full transition-colors duration-300 ${
        isDarkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-800'
      } hover:bg-gray-200`}
    >
      {isPlaying ? (
        <Volume2 className="w-5 h-5" />
      ) : (
        <VolumeX className="w-5 h-5" />
      )}
    </button>
  );
};

export default SoundControl;