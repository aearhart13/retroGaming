let timer;
let timeLeft = 30;
let codeLines = [
  'PLAY "E D C D"',
  'PLAY "E E E"',
  'PLAY "D D D"',
  'PLAY "E G G"',
  'PLAY "E D C D"',
  'PLAY "E E E E"',
  'PLAY "D D E D C"'
];
let currentLine = 0;

function startGame() {
  document.getElementById('code-input').value = '';
  document.getElementById('code-output').textContent = '';
  document.getElementById('timer').textContent = timeLeft;
  document.getElementById('code-input').disabled = false;
  document.getElementById('code-input').focus();
  currentLine = 0;
  startTimer();
}

function startTimer() {
  timer = setInterval(() => {
    timeLeft--;
    document.getElementById('timer').textContent = timeLeft;
    if (timeLeft <= 0) {
      clearInterval(timer);
      document.getElementById('code-input').disabled = true;
      playSong();
    }
  }, 1000);
}

function playSong() {
  let songCode = document.getElementById('code-output').textContent.split('\n').filter(line => line.startsWith('PLAY'));
  let melody = songCode.map(line => line.slice(6, -1).split(' '));
  let audioContext = new (window.AudioContext || window.webkitAudioContext)();
  melody.forEach((notes, index) => {
    setTimeout(() => {
      notes.forEach((note, noteIndex) => {
        let oscillator = audioContext.createOscillator();
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(noteToFrequency(note), audioContext.currentTime + noteIndex * 0.5);
        oscillator.connect(audioContext.destination);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.5);
      });
    }, index * 1000);
  });
}

function noteToFrequency(note) {
  const frequencies = {
    'C': 261.63,
    'D': 293.66,
    'E': 329.63,
    'F': 349.23,
    'G': 392.00,
    'A': 440.00,
    'B': 493.88
  };
  return frequencies[note] || 440;
}

document.getElementById('code-input').addEventListener('input', (event) => {
  if (event.target.value === codeLines[currentLine]) {
    document.getElementById('code-output').textContent += codeLines[currentLine] + '\n';
    currentLine++;
    event.target.value = '';
    if (currentLine === codeLines.length) {
      clearInterval(timer);
      document.getElementById('code-input').disabled = true;
      playSong();
    }
  }
});
