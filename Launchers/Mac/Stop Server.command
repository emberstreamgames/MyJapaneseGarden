#!/bin/zsh
# Double-click in Finder to stop the dev server on port 5173.

pids=$(lsof -nP -tiTCP:5173 -sTCP:LISTEN)
if [[ -n $pids ]]; then
  kill ${=pids}
  echo "Server stopped."
else
  echo "Server was not running."
fi
sleep 2
