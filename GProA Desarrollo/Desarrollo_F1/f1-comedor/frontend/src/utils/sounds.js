export const playSound = (type) => {
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  
  const playTone = (frequency, duration, type = 'sine', volume = 0.5) => {
    const oscillator = audioCtx.createOscillator()
    const gainNode = audioCtx.createGain()
    
    oscillator.type = type
    oscillator.frequency.value = frequency
    
    gainNode.gain.setValueAtTime(volume, audioCtx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration)
    
    oscillator.connect(gainNode)
    gainNode.connect(audioCtx.destination)
    
    oscillator.start()
    oscillator.stop(audioCtx.currentTime + duration)
  }

  // F1 / Industrial themed sounds
  switch(type) {
    case 'success':
      // High-pitched double beep (like pit lane entry)
      playTone(880, 0.1, 'sine', 0.5) // A5
      setTimeout(() => playTone(1760, 0.2, 'sine', 0.5), 100) // A6
      break
    case 'error':
      // Low-pitched buzz/horn (Access denied)
      playTone(150, 0.4, 'sawtooth', 0.8)
      break
    case 'duplicate':
      // Warning double mid-pitch beep
      playTone(440, 0.15, 'square', 0.4)
      setTimeout(() => playTone(440, 0.15, 'square', 0.4), 200)
      break
    case 'scan':
      // Very short, very high pip (Scanner read)
      playTone(2000, 0.05, 'sine', 0.1)
      break
    default:
      playTone(440, 0.1)
  }
}
