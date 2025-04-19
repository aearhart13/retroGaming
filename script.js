function playMelody() {
    const melody = [
      { note: 'E', duration: 400 },
      { note: 'D', duration: 400 },
      { note: 'C', duration: 400 },
      { note: 'D', duration: 400 },
      { note: 'E', duration: 400 },
      { note: 'E', duration: 400 },
      { note: 'E', duration: 400 },
      // Add more notes as needed
    ];
  
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  
    melody.forEach((tone, index) => {
      setTimeout(() => {
        const oscillator = audioContext.createOscillator();
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(noteToFrequency(tone.note), audioContext.currentTime);
        oscillator.connect(audioContext.destination);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + tone.duration / 1000);
      }, index * 500); // Delay between notes
    });
  
    document.getElementById('code-output').textContent = 'Code executed successfully!';
  }
  
  function noteToFrequency(note) {
    const frequencies = {
      'C': 261.63,
      'D': 293.66,
      'E': 329.63,
      // Add other notes as needed
    };
    return frequencies[note] || 440; // Default to A4 if note is not found
  }
  