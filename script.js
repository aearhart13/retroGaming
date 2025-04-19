const songs = [
  {
    title: "Mary Had a Little Lamb",
    codeLines: [
      'PLAY "E D C D"',
      'PLAY "E E E"',
      'PLAY "D D D"',
      'PLAY "E G G"',
      'PLAY "E D C D"',
      'PLAY "E E E E"',
      'PLAY "D D E D C"'
    ]
  },
  {
    title: "Twinkle Twinkle Little Star",
    codeLines: [
      'PLAY "C C G G"',
      'PLAY "A A G"',
      'PLAY "F F E E"',
      'PLAY "D D C"',
      'PLAY "G G F F"',
      'PLAY "E E D"',
      'PLAY "G G F F"',
      'PLAY "E E D"',
      'PLAY "C C G G"',
      'PLAY "A A G"',
      'PLAY "F F E E"',
      'PLAY "D D C"'
    ]
  },
  {
    title: "Happy Birthday",
    codeLines: [
      'PLAY "C C D C F E"',
      'PLAY "C C D C G F"',
      'PLAY "C C C A F E D"',
      'PLAY "Bb Bb A F G F"'
    ]
  }
];

let timer;
let timeLeft = 30;
let currentLine = 0;
let codeLines = [];
let correctAnswer = '';
const melodyDuration = codeLines.flatMap(line => line.slice(6, -1).split(' ')).length * 500;


function startGame() {
  const randomSong = songs[Math.floor(Math.random() * songs.length)];
  codeLines = randomSong.codeLines;
  correctAnswer = randomSong.title;

  timeLeft = 30;
  currentLine = 0;

  document.getElementById('code-output').textContent = '';
  document.getElementById('timer').textContent = timeLeft;
  document.getElementById('code-input').disabled = false;
  document.getElementById('code-input').value = '';
  document.getElementById('code-input').focus();
  document.getElementById('guess-section').style.display = 'none';
  document.getElementById('guess-feedback').textContent = '';
  
  showNextLine();
  startTimer();
}


function initGame() {
  timeLeft = 30;
  currentLine = 0;
  document.getElementById('code-output').textContent = '';
  document.getElementById('timer').textContent = timeLeft;
  document.getElementById('code-input').disabled = false;
  document.getElementById('code-input').value = '';
  document.getElementById('code-input').focus();
  showNextLine();
  startTimer();
}


function showNextLine() {
  if (currentLine < codeLines.length) {
    document.getElementById('current-line').textContent = `Type this: ${codeLines[currentLine]}`;
  } else {
    document.getElementById('current-line').textContent = `✅ All lines completed!`;
  }
}

function startTimer() {
  timer = setInterval(() => {
    timeLeft--;
    document.getElementById('timer').textContent = timeLeft;
    if (timeLeft <= 0) {
      clearInterval(timer);
      document.getElementById('code-input').disabled = true;
      document.getElementById('current-line').textContent = "⏰ Time's up!";
      playSong();
    }
  }, 1000);
}

function playSong() {
  let songCode = document.getElementById('code-output').textContent.split('\n').filter(line => line.startsWith('PLAY'));
  let melody = songCode.flatMap(line => line.slice(6, -1).split(' '));
  let audioContext = new (window.AudioContext || window.webkitAudioContext)();

  melody.forEach((note, i) => {
    setTimeout(() => {
      const osc = audioContext.createOscillator();
      osc.type = 'square';
      osc.frequency.setValueAtTime(noteToFrequency(note), audioContext.currentTime);
      osc.connect(audioContext.destination);
      osc.start();
      osc.stop(audioContext.currentTime + 0.4);
    }, i * 500);
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
  const inputBox = document.getElementById('code-input');
  const expected = codeLines[currentLine];
  const currentInput = event.target.value;

  if (currentInput === expected) {
    // Correct entry
    document.getElementById('code-output').textContent += expected + '\n';
    currentLine++;
    event.target.value = '';
    inputBox.classList.remove('error');
    document.getElementById('current-line').textContent = currentLine < codeLines.length
      ? `Type this: ${codeLines[currentLine]}`
      : '✅ All lines complete!';
    
      if (currentLine === codeLines.length) {
        clearInterval(timer);
        inputBox.disabled = true;
        playSong();
        setTimeout(() => {
          document.getElementById('guess-section').style.display = 'block';
          document.getElementById('song-guess').focus();
        }, melodyDuration + 500); // add buffer after song
      }
  } else {
    // Check if it's a wrong input (but not just partially incomplete)
    if (!expected.startsWith(currentInput)) {
      inputBox.classList.add('error');
      document.getElementById('current-line').textContent = `❌ Incorrect. Try again: ${expected}`;
      beep(); // ← Add this line
    } else {
      inputBox.classList.remove('error');
      showNextLine();
    }
  }
});

function beep() {
  const context = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = 'square';
  oscillator.frequency.setValueAtTime(880, context.currentTime); // A5 note
  gain.gain.setValueAtTime(0.2, context.currentTime); // Not too loud

  oscillator.connect(gain);
  gain.connect(context.destination);

  oscillator.start();
  oscillator.stop(context.currentTime + 0.1); // Short beep (100ms)
}

function submitGuess() {
  const userGuess = document.getElementById('song-guess').value.trim().toLowerCase();
  const answer = correctAnswer.toLowerCase();
  const feedback = document.getElementById('guess-feedback');

  if (userGuess && answer.includes(userGuess) || userGuess.includes(answer)) {
    feedback.textContent = `🎉 Correct! It was '${correctAnswer}'!`;
    feedback.style.color = '#0f0';
  } else {
    feedback.textContent = `❌ Not quite! The song was '${correctAnswer}'.`;
    feedback.style.color = '#f00';
  }
}


