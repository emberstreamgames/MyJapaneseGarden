#!/bin/zsh -l
# Double-click in Finder to start the dev server. Opens in Terminal.

# Finder-launched scripts may miss Homebrew's PATH.
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"

# Launchers live in Launchers/Mac; run from the project root.
cd "${0:A:h}/../.."

# Already running? Just open the browser.
if lsof -nP -iTCP:5173 -sTCP:LISTEN >/dev/null 2>&1; then
  echo "Server is already running."
  open http://localhost:5173
  sleep 3
  exit 0
fi

if ! command -v npm >/dev/null; then
  echo "npm not found. Install Node.js from https://nodejs.org or with: brew install node"
  read -k 1 "?Press any key to close."
  exit 1
fi

if [[ ! -d node_modules ]]; then
  echo "Installing dependencies, first run only..."
  npm install || { read -k 1 "?Install failed. Press any key to close."; exit 1 }
fi

# Wi-Fi is usually en0, Ethernet en1.
ip=$(ipconfig getifaddr en0 || ipconfig getifaddr en1)

echo
echo "Starting Genki Study..."
echo "  This Mac:  http://localhost:5173"
[[ -n $ip ]] && echo "  Phone/PC:  http://$ip:5173"
echo
echo "Press Ctrl+C, close this window, or run \"Stop Server.command\" to stop."
echo

(sleep 3 && open http://localhost:5173) &
npm run dev
