#!/usr/bin/env bash

set -euo pipefail

script_dir="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
pid_file="$script_dir/earth-landing/.run/viviane-route.pid"

if [[ ! -f "$pid_file" ]]; then
  echo "No Viviane's Route server was started by ./launch.sh."
  exit 0
fi

route_pid="$(tr -cd '0-9' < "$pid_file")"

if [[ -z "$route_pid" ]] || ! kill -0 "$route_pid" 2>/dev/null; then
  rm -f "$pid_file"
  echo "Viviane's Route is not running."
  exit 0
fi

kill "$route_pid"

for _ in {1..20}; do
  if ! kill -0 "$route_pid" 2>/dev/null; then
    rm -f "$pid_file"
    echo "Viviane's Route stopped."
    exit 0
  fi
  sleep 0.25
done

echo "The server is still shutting down. Run ./close.sh again in a moment."
