from flask import Flask, render_template, request, jsonify, session
import random

app = Flask(__name__)
app.secret_key = "change_this_to_a_secure_random_value"

MIN_NUMBER = 0
MAX_NUMBER = 100

@app.route("/")
def index():
    if "secret_number" not in session:
        _start_game()
    return render_template("index.html", min_number=MIN_NUMBER, max_number=MAX_NUMBER)

@app.route("/start", methods=["POST"])
def start_game():
    _start_game()
    return jsonify({
        "message": f"A new game has started! Guess a number between {MIN_NUMBER} and {MAX_NUMBER}.",
        "attempts": 0,
        "finished": False,
    })

@app.route("/guess", methods=["POST"])
def guess():
    if "secret_number" not in session:
        _start_game()

    data = request.get_json(force=True)
    try:
        guess_value = int(data.get("guess", ""))
    except (TypeError, ValueError):
        return jsonify({"error": "Please enter a valid number."}), 400

    if not (MIN_NUMBER <= guess_value <= MAX_NUMBER):
        return jsonify({"error": f"Your guess must be between {MIN_NUMBER} and {MAX_NUMBER}."}), 400

    session["attempts"] += 1
    secret = session["secret_number"]

    if guess_value < secret:
        result = "Too low! Try again with a larger number."
        finished = False
    elif guess_value > secret:
        result = "Too high! Try again with a smaller number."
        finished = False
    else:
        result = f"Congratulations! You guessed the correct number in {session['attempts']} attempt(s)!"
        finished = True

    if finished:
        session.pop("secret_number", None)
        session.pop("attempts", None)

    return jsonify({
        "result": result,
        "attempts": session.get("attempts", 0),
        "finished": finished,
    })

def _start_game():
    session["secret_number"] = random.randint(MIN_NUMBER, MAX_NUMBER)
    session["attempts"] = 0

if __name__ == "__main__":
    app.run(debug=True)
