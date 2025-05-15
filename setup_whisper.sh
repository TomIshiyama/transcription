# 任意の作業ディレクトリを作成
mkdir whisper-test && cd whisper-test

# 仮想環境を作成
python3 -m venv .venv

# 仮想環境をアクティベート
source .venv/bin/activate

# pip を最新版にアップグレード
pip install --upgrade pip

pip install flask

# Whisper をインストール
pip install git+https://github.com/openai/whisper.git
python whisper_server.py