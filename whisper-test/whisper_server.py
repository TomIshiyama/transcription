from flask import Flask, request, jsonify
import whisper
import tempfile
import os

app = Flask(__name__)
model = whisper.load_model("base")

@app.route("/transcribe", methods=["POST"])
def transcribe():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    audio_file = request.files["file"]
    with tempfile.NamedTemporaryFile(delete=False, suffix=".m4a") as temp:
        audio_file.save(temp.name)
        result = model.transcribe(temp.name)
        os.unlink(temp.name)  # clean up

    return jsonify({"text": result["text"]})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)