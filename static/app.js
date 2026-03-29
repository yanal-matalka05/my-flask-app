const feedback = document.getElementById("feedback");
const attemptsElement = document.getElementById("attempts");
const guessInput = document.getElementById("guessInput");
const guessButton = document.getElementById("guessButton");
const newGameButton = document.getElementById("newGameButton");

async function callApi(path, payload) {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return await res.json();
}

// Update attempts display
function updateAttempts(count) {
  const span = attemptsElement.querySelector("span");
  span.textContent = count;
}

// Play sound using Web Audio API
function playMelody(frequencies, durations) {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  let startTime = audioContext.currentTime;
  frequencies.forEach((freq, i) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.frequency.value = freq;
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.3, startTime);
    oscillator.start(startTime);
    oscillator.stop(startTime + durations[i]);
    startTime += durations[i];
  });
}

// Note frequencies
const notes = {
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  F4: 349.23,
  G4: 392.00,
  A4: 440.00,
  B4: 493.88,
  C5: 523.25
};

guessButton.addEventListener("click", async () => {
  const guessValue = guessInput.value;
  if (!guessValue) {
    feedback.textContent = "يرجى إدخال رقم أولاً.";
    return;
  }

  const data = await callApi("/guess", { guess: guessValue });

  if (data.error) {
    feedback.textContent = data.error;
    return;
  }

  feedback.textContent = data.result;
  updateAttempts(data.attempts);

  if (data.result.includes("Too low")) {
    playMelody([notes.G4, notes.F4, notes.E4, notes.D4, notes.C4], [0.2, 0.2, 0.2, 0.2, 0.5]);
  } else if (data.result.includes("Too high")) {
    playMelody([notes.C4, notes.D4, notes.E4, notes.F4, notes.G4], [0.2, 0.2, 0.2, 0.2, 0.5]);
  } else if (data.result.includes("Congratulations")) {
    playMelody([notes.C4, notes.E4, notes.G4, notes.C5, notes.G4, notes.E4, notes.C4], [0.3, 0.3, 0.3, 0.6, 0.3, 0.3, 0.6]);
  }

  if (data.finished) {
    guessInput.value = "";
    guessInput.disabled = true;
    guessButton.disabled = true;
  }
});

newGameButton.addEventListener("click", async () => {
  const data = await callApi("/start", {});
  if (data.message) {
    feedback.textContent = data.message;
    updateAttempts(data.attempts);
    guessInput.disabled = false;
    guessButton.disabled = false;
    guessInput.value = "";
    guessInput.focus();
    playMelody([notes.C4, notes.C4, notes.G4, notes.G4, notes.A4, notes.A4, notes.G4], [0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.6]);
  }
});
