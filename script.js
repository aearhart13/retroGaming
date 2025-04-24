console.log("✅ JavaScript loaded!");
let score = 0;
let strikes = 0;
const maxStrikes = 10;
let previousInputLength = 0;
let timer;
let timeLeft = 30;
let currentLine = 0;
let codeLines = [];
let correctAnswer = '';
let playedSongs = [];
let noteDuration = 500;

const classicSongs = [
  {
    title: "Mary Had a Little Lamb",
    tempo: 500,
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
    tempo: 550,
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
    tempo: 450,
    codeLines: [
      'PLAY "C C D C F E"',
      'PLAY "C C D C G F"',
      'PLAY "C C C A F E D"',
      'PLAY "Bb Bb A F G F"'
    ]
  },
   {
    title: "Jingle Bells",
    tempo: 420,
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
    tempo: 400,
    codeLines: [
      'PLAY "E E G E D C B"',
      'PLAY "E E G E D C B"',
      'PLAY "C B C D E"',
      'PLAY "E D C B"'
    ]
  },
  {
    title: "Take On Me",
    tempo: 350,
    codeLines: [
      'PLAY "B D# E F# E D# B"',
      'PLAY "B D# E F# E D# C#"',
      'PLAY "A# B C# D# C# B A#"',
      'PLAY "G# A# B C# B A# G#"'
    ]
  },
  {
    title: "Sweet Dreams",
    tempo: 375,
    codeLines: [
      'PLAY "C C C C A# A# G G"',
      'PLAY "F F G G A# A# C C"',
      'PLAY "C C A# A# G G F F"',
      'PLAY "F F G G A# A# C C"'
    ]
  },
  {
    title: "Running Up That Hill",
    tempo: 420,
    codeLines: [
      'PLAY "C D F G F D"',
      'PLAY "C D F G A G"',
      'PLAY "F G A G F D"',
      'PLAY "C C C C C"'
    ]
  }, 
  {
    title: "E-Pro",
    tempo: 300,
    codeLines: [
      'PLAY "D D D F D F"',
      'PLAY "D D D F D F"',
      'PLAY "G G G A G A"',
      'PLAY "F F F G F D"'
    ]
  }
];

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
  const remainingSongs = availableSongs.filter(song => !playedSongs.includes(song.title));

  if (remainingSongs.length === 0) {
    alert("🎉 You've played all songs in this pack!\nResetting the list...");
    playedSongs = []; // Clear memory if all songs used
    startGame();
    return;
  }
  const randomSong = remainingSongs[Math.floor(Math.random() * remainingSongs.length)];
  playedSongs.push(randomSong.title);
  codeLines = randomSong.codeLines;
  correctAnswer = randomSong.title;
  noteDuration = randomSong.tempo || 500;

  const wins = parseInt(localStorage.getItem('wins') || '0');
  document.getElementById('mode-indicator').style.display = wins >= 3 ? 'block' : 'none';
  document.getElementById('relisten-button').style.display = 'none';
  document.getElementById('max-strikes').textContent = maxStrikes;

  timeLeft = getTimerDuration();
  currentLine = 0;
  updateScoreDisplay();
  updateStrikeDisplay();
  document.getElementById('timer').textContent = timeLeft;

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
    const line = codeLines[currentLine];
    if (line.startsWith("PLAY")) {
      document.getElementById('current-line').innerHTML = `Type this: <code>${line}</code>`;
    } else {
      document.getElementById('current-line').textContent = `Type this: ${line}`;
    }
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
        document.querySelector('#guess-section button[onclick="submitGuess()"]').style.display = 'inline-block';
      });
    }
  }, 1000);
}

function playSong(onFinished) {
  const melody = codeLines.flatMap(line => line.slice(6, -1).split(' '));
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
    score += 1; // One point per line
    updateScoreDisplay();
  
    showNextLine();
  
    if (currentLine === codeLines.length) {
      clearInterval(timer);
      inputBox.disabled = true;
      playSong(() => {
        const guessBox = document.getElementById('guess-section');
        guessBox.style.display = 'block';
        document.getElementById('song-guess').focus();
        document.querySelector('#guess-section button[onclick="submitGuess()"]').style.display = 'inline-block';
      });

      document.getElementById('relisten-button').style.display = 'inline-block';
      document.getElementById('relisten-button').disabled = false;
    }
  
  } else {
    if (!expected.startsWith(currentInput)) {
      inputBox.classList.add('error');
      document.getElementById('current-line').textContent = `❌ Incorrect. Try again: ${expected}`;
    
      // ✅ Only count a strike if the input got longer (not backspace)
      if (currentInput.length >= previousInputLength) {
        beep();
        strikes++;
        updateStrikeDisplay();
    
        if (strikes >= maxStrikes) {
          inputBox.disabled = true;
          clearInterval(timer);
          document.getElementById('current-line').innerHTML =
            `<span class="strikeout-message">💥 Too many errors! You get one last chance to guess the song...</span>`;
    
          playSongFromInput(() => {
            const guessBox = document.getElementById('guess-section');
            guessBox.style.display = 'block';
            document.getElementById('song-guess').focus();
            guessBox.dataset.recovery = "true";
            document.getElementById('relisten-button').style.display = 'inline-block';
            document.getElementById('relisten-button').disabled = false;
            document.querySelector('#guess-section button[onclick="submitGuess()"]').style.display = 'inline-block';
          });
        }
      }
    
    } else {
      inputBox.classList.remove('error');
      showNextLine();
    }
    previousInputLength = currentInput.length;    
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

  const isCorrect = userGuess && (answer.includes(userGuess) || userGuess.includes(answer));
  document.getElementById('relisten-button').style.display = 'none';

  const submitBtn = document.querySelector('#guess-section button[onclick="submitGuess()"]');
  const playAgainBtn = document.querySelector('#guess-section button[onclick="startGame()"]');

  if (isCorrect) {
    score += 10;
    updateScoreDisplay();

    if (isRecoveryGuess) {
      // ✅ Recovered on last chance
      strikes = maxStrikes - 1;
      updateStrikeDisplay();
      guessBox.dataset.recovery = "false";

      feedback.textContent = `🎉 Correct! It was '${correctAnswer}'! You survived with ${score} point${score !== 1 ? 's' : ''}. Click 'Play Again' to continue.`;
      feedback.style.color = '#0f0';

      submitBtn.style.display = 'none';
      playAgainBtn.style.display = 'inline-block';
      return;
    }

    // ✅ Normal correct guess
    feedback.textContent = `🎉 Correct! It was '${correctAnswer}'! Total score: ${score}`;
    feedback.style.color = '#0f0';

    let wins = parseInt(localStorage.getItem('wins') || '0');
    wins++;
    localStorage.setItem('wins', wins);

    if (wins === 3) {
      alert("🎉 You unlocked the Synthwave Pack!\nGet ready for retro synth madness. 🎛️✨");
      startGame();
      return;
    }

    submitBtn.style.display = 'none';
    playAgainBtn.style.display = 'inline-block';
    return;
  }

  // ❌ Incorrect
  if (isRecoveryGuess) {
    // 💥 Recovery failed — full game over
    document.getElementById('code-input').disabled = true;
    guessBox.dataset.recovery = "false";
    document.getElementById('mode-indicator').style.display = 'none';
    localStorage.setItem('wins', '0');

    const finalScore = score;
    strikes = 0;
    score = 0;
    updateStrikeDisplay();
    updateScoreDisplay();

    const wantsRestart = confirm(`💥 Game over — you had ${finalScore} point${finalScore !== 1 ? 's' : ''}.\n\nStart over?`);
    if (wantsRestart) {
      resetGame();
    } else {
      document.getElementById('start-button').style.display = 'inline-block';
    }
  } else {
    // ❌ Regular incorrect guess
    feedback.textContent = `❌ Not quite! The song was '${correctAnswer}'.`;
    feedback.style.color = '#f00';

    submitBtn.style.display = 'none';
    playAgainBtn.style.display = 'inline-block';
  }
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
  document.getElementById('max-strikes').textContent = maxStrikes;
}

document.addEventListener('DOMContentLoaded', () => {
  updateStrikeDisplay();
});

function resetGame() {
  const confirmed = confirm("This will reset your progress and unlocks. Are you sure?");
  if (!confirmed) return;

  localStorage.setItem('wins', '0');
  score = 0;
  strikes = 0;
  playedSongs = [];

  updateScoreDisplay();
  updateStrikeDisplay();
  clearInterval(timer);
  timeLeft = getTimerDuration();
  document.getElementById('timer').textContent = timeLeft;
  document.getElementById('mode-indicator').style.display = 'none';
  document.getElementById('guess-feedback').textContent = '';
  document.getElementById('start-button').style.display = 'inline-block';
  document.getElementById('typing-section').style.display = 'none';
  document.getElementById('guess-section').style.display = 'none';
  document.getElementById('code-output').textContent = '';
  document.getElementById('code-input').value = '';
  alert("🔄 Game reset! Start fresh when you're ready."); 
}

function getTimerDuration() {
  const wins = parseInt(localStorage.getItem('wins') || '0');
  return wins >= 3 ? 45 : 30; // Synthwave gets more time
}
