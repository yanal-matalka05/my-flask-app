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
  }
});
