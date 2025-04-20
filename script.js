console.log("✅ JavaScript loaded!");
let score = 0;
let strikes = 0;
const maxStrikes = 5;
let previousInputLength = 0;

const classicSongs = [
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
  },
  {
    title: "Row Row Row Your Boat",
    codeLines: [
      'PLAY "C C C D E"',
      'PLAY "E D E F G"',
      'PLAY "C C C G G"',
      'PLAY "E E D"'
    ]
  },
   {
    title: "Jingle Bells",
    codeLines: [
      'PLAY "E E E"',
      'PLAY "E E E"',
      'PLAY "E G C D E"',
      'PLAY "F F F F F E E"',
      'PLAY "E E D D E D G"'
    ]
  }
];
const synthwaveSongs = [
  {
    title: "Seven Nation Army",
    codeLines: [
      'PLAY "E E G E D C B"',
      'PLAY "E E G E D C B"',
      'PLAY "C B C D E"',
      'PLAY "E D C B"'
    ]
  },
  {
    title: "Take On Me",
    codeLines: [
      'PLAY "B D# E F# E D# B"',
      'PLAY "B D# E F# E D# C#"',
      'PLAY "A# B C# D# C# B A#"',
      'PLAY "G# A# B C# B A# G#"'
    ]
  },
  {
    title: "Sweet Dreams",
    codeLines: [
      'PLAY "C C C C A# A# G G"',
      'PLAY "F F G G A# A# C C"',
      'PLAY "C C A# A# G G F F"',
      'PLAY "F F G G A# A# C C"'
    ]
  },
  {
    title: "Running Up That Hill",
    codeLines: [
      'PLAY "C D F G F D"',
      'PLAY "C D F G A G"',
      'PLAY "F G A G F D"',
      'PLAY "C C C C C"'
    ]
  }  
];

let timer;
let timeLeft = 30;
let currentLine = 0;
let codeLines = [];
let correctAnswer = '';

function getAvailableSongs() {
  const wins = parseInt(localStorage.getItem('wins') || '0');
  console.log(`🏆 Player wins: ${wins}`);

  if (wins >= 3) {
    return synthwaveSongs; // ✅ Synth-only mode after unlock
  }
  return classicSongs;
}

function startGame() {
  document.getElementById('start-button').style.display = 'none';
  const availableSongs = getAvailableSongs();
  const randomSong = availableSongs[Math.floor(Math.random() * availableSongs.length)];  
  codeLines = randomSong.codeLines;
  correctAnswer = randomSong.title;
  const wins = parseInt(localStorage.getItem('wins') || '0');
  document.getElementById('mode-indicator').style.display = wins >= 3 ? 'block' : 'none';
  document.getElementById('relisten-button').style.display = 'none';

  timeLeft = 30;
  currentLine = 0;
  strikes = 0;
  updateStrikeDisplay();
  updateScoreDisplay();

  document.getElementById('typing-section').style.display = 'block';
  document.getElementById('code-output').textContent = '';
  document.getElementById('timer').textContent = timeLeft;
  document.getElementById('code-input').disabled = false;
  document.getElementById('code-input').value = '';
  document.getElementById('code-input').focus();
  document.getElementById('guess-section').style.display = 'none';
  document.getElementById('guess-feedback').textContent = '';
  // Clear previous guess input and feedback
  document.getElementById('song-guess').value = '';

  showNextLine();
  startTimer();
  //updateUnlockStatus()
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
    
      playSongFromInput(() => {
        console.log("🎵 Played only typed portion. Showing guess section.");
        const guessBox = document.getElementById('guess-section');
        guessBox.style.display = 'block';
        document.getElementById('song-guess').focus();
        document.getElementById('relisten-button').style.display = 'inline-block';
        document.getElementById('relisten-button').disabled = false;
      });
    }
  }, 1000);
}

function playSong(onFinished) {
  const melody = codeLines.flatMap(line => line.slice(6, -1).split(' '));
  const noteDuration = 500;
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();

  if (melody.length === 0) {
    console.log("⚠️ No melody to play. Showing guess prompt anyway.");
    onFinished?.();
    return;
  }

  melody.forEach((note, i) => {
    setTimeout(() => {
      const osc = audioContext.createOscillator();
      osc.type = 'square';
      osc.frequency.setValueAtTime(noteToFrequency(note), audioContext.currentTime);
      osc.connect(audioContext.destination);
      osc.start();
      osc.stop(audioContext.currentTime + 0.4);
    }, i * noteDuration);
  });

  const totalDuration = melody.length * noteDuration;

  setTimeout(() => {
    console.log("✅ Melody finished.");
    onFinished?.(); // call the guess section
  }, totalDuration + 300);
}

function playSongFromInput(onFinished) {
  const songCode = document.getElementById('code-output').textContent
    .split('\n')
    .filter(line => line.startsWith('PLAY'));
    
  const melody = songCode.flatMap(line => line.slice(6, -1).split(' '));
  const noteDuration = 500;
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();

  if (melody.length === 0) {
    console.log("⚠️ No input melody to play.");
    onFinished?.();
    return;
  }

  melody.forEach((note, i) => {
    setTimeout(() => {
      const osc = audioContext.createOscillator();
      osc.type = 'square';
      osc.frequency.setValueAtTime(noteToFrequency(note), audioContext.currentTime);
      osc.connect(audioContext.destination);
      osc.start();
      osc.stop(audioContext.currentTime + 0.4);
    }, i * noteDuration);
  });

  const totalDuration = melody.length * noteDuration;

  setTimeout(() => {
    console.log("🎵 Partial melody finished.");
    onFinished?.();
  }, totalDuration + 300);
}

function noteToFrequency(note) {
  const frequencies = {
    'C': 261.63,
    'D': 293.66,
    'E': 329.63,
    'F': 349.23,
    'G': 392.00,
    'G#': 415.30,
    'A': 440.00,
    'B': 493.88,
    'D#': 311.13,
    'F#': 369.99,
    'A#': 466.16,
    'C#': 277.18
  };
  return frequencies[note] || 440;
}

document.getElementById('code-input').addEventListener('input', (event) => {
  const inputBox = document.getElementById('code-input');
  const expected = codeLines[currentLine];
  const currentInput = event.target.value;

  if (currentInput === expected) {
    // Correct full line
    document.getElementById('code-output').textContent += expected + '\n';
    currentLine++;
    event.target.value = '';
    inputBox.classList.remove('error');
    
    // Add points for completed line (already includes keystrokes)
    score += expected.length - previousInputLength;
    updateScoreDisplay();
    previousInputLength = 0;
  
    document.getElementById('current-line').textContent = currentLine < codeLines.length
      ? `Type this: ${codeLines[currentLine]}`
      : '✅ All lines complete!';
  
    if (currentLine === codeLines.length) {
      clearInterval(timer);
      inputBox.disabled = true;
      playSong(() => {
        const guessBox = document.getElementById('guess-section');
        guessBox.style.display = 'block';
        document.getElementById('song-guess').focus();
      });
    }
  
  } else {
    // Partial input
    if (!expected.startsWith(currentInput)) {
      inputBox.classList.add('error');
      document.getElementById('current-line').textContent = `❌ Incorrect. Try again: ${expected}`;
      beep();
      strikes++;
      updateStrikeDisplay();
      if (strikes >= maxStrikes) {
        inputBox.disabled = true;
        clearInterval(timer);
        document.getElementById('current-line').innerHTML =
          `<span class="strikeout-message">💥 Too many errors! You get one last chance to guess the song...</span>`;
      
        // Play what they typed so far
        playSongFromInput(() => {
          const guessBox = document.getElementById('guess-section');
          guessBox.style.display = 'block';
          document.getElementById('song-guess').focus();
          guessBox.dataset.recovery = "true";
          document.getElementById('relisten-button').style.display = 'inline-block';
          document.getElementById('relisten-button').disabled = false;
        });
      }      
    } else {
      inputBox.classList.remove('error');
      showNextLine();
  
      // ✅ Only add score for newly typed characters
      const newChars = currentInput.length - previousInputLength;
      if (newChars > 0) {
        score += newChars;
        updateScoreDisplay();
      }
      previousInputLength = currentInput.length;
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
  const guessBox = document.getElementById('guess-section');
  const isRecoveryGuess = guessBox.dataset.recovery === "true";
  const userGuess = document.getElementById('song-guess').value.trim().toLowerCase();
  const answer = correctAnswer.toLowerCase();
  const feedback = document.getElementById('guess-feedback');
  
  if (userGuess && answer.includes(userGuess) || userGuess.includes(answer)) {
    feedback.textContent = `🎉 Correct! It was '${correctAnswer}'! Total score: ${score}`;
    feedback.style.color = '#0f0';

    if (isRecoveryGuess) {
      // ✨ Recover from strike-out
      strikes = maxStrikes - 1;
      updateStrikeDisplay();
      document.getElementById('current-line').textContent = `👍 You're back in the game! Keep typing: ${codeLines[currentLine]}`;
      document.getElementById('code-input').disabled = false;
      document.getElementById('code-input').focus();
      guessBox.style.display = 'none';
      guessBox.dataset.recovery = "false";
      return;
    }

    let wins = parseInt(localStorage.getItem('wins') || '0');
    wins++;
    localStorage.setItem('wins', wins);
    if (wins === 3) {
      alert("🎉 You unlocked the Synthwave Pack!\nGet ready for retro synth madness. 🎛️✨");
    }
    score += 10;
    updateScoreDisplay();
  } else {
    if (isRecoveryGuess) {
      feedback.textContent = `❌ Not quite! The song was '${correctAnswer}'. Game over.`;
      feedback.style.color = '#f00';
      document.getElementById('code-input').disabled = true;
      guessBox.dataset.recovery = "false";
    }
    else {
      feedback.textContent = `❌ Not quite! The song was '${correctAnswer}'.`;
      feedback.style.color = '#f00';  
    }
    document.getElementById('relisten-button').style.display = 'none';    
  }
  //updateUnlockStatus()
}

function relisten() {
  const button = document.getElementById('relisten-button');
  button.disabled = true;

  playSongFromInput(() => {
    console.log("🔁 Replayed for recovery guess.");
  });
}

/*function updateUnlockStatus() {
  const wins = parseInt(localStorage.getItem('wins') || '0');
  document.getElementById('unlocked-status').textContent =
    wins >= 3 ? "Unlocked Songs: Classics + Synthwave Pack" : `Unlocked Songs: Classics (${wins}/3 correct guesses)`;
}*/

function updateScoreDisplay() {
  document.getElementById('score-display').textContent = score;
}

function updateStrikeDisplay() {
  document.getElementById('strike-display').textContent = strikes;
}

