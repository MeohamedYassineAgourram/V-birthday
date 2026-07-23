#!/usr/bin/env bash

set -euo pipefail

script_dir="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
project_dir="$script_dir/earth-landing"
runtime_dir="$project_dir/.run"
pid_file="$runtime_dir/viviane-route.pid"
log_file="$runtime_dir/viviane-route.log"
server_port="3003"

if [[ ! -x "$project_dir/node_modules/.bin/next" ]]; then
  echo "Dependencies are missing. Run: cd earth-landing && npm install"
  exit 1
fi

if [[ -f "$pid_file" ]]; then
  route_pid="$(tr -cd '0-9' < "$pid_file")"
  if [[ -n "$route_pid" ]] && kill -0 "$route_pid" 2>/dev/null; then
    echo "Viviane's Route is already running at http://localhost:$server_port"
    exit 0
  fi
  rm -f "$pid_file"
fi

if lsof -nP -iTCP:"$server_port" -sTCP:LISTEN >/dev/null 2>&1; then
  echo "Port $server_port is already in use. Run ./close.sh if it is an older Viviane's Route server."
  exit 1
fi

mkdir -p "$runtime_dir"
cd "$project_dir"

echo "Building Viviane's Route…"
npm run build

nohup ./node_modules/.bin/next start -p "$server_port" > "$log_file" 2>&1 &
route_pid="$!"
echo "$route_pid" > "$pid_file"

for _ in {1..20}; do
  if lsof -nP -iTCP:"$server_port" -sTCP:LISTEN >/dev/null 2>&1; then
    echo "Viviane's Route is running at http://localhost:$server_port"
    exit 0
  fi
  sleep 0.25
done

echo "The server did not start. Check $log_file"
exit 1
