#!/bin/zsh
# Doppelklick startet eine lokale Vorschau von osci//log im Browser.
# (Notizen brauchen einen kleinen Webserver; direkt aus dem Finder geöffnet laden sie nicht.)
cd "$(dirname "$0")"
PORT=4173
echo "osci//log Vorschau läuft auf http://localhost:$PORT — zum Beenden dieses Fenster schließen oder Ctrl+C."
(sleep 1 && open "http://localhost:$PORT/") &
python3 -m http.server $PORT --bind 127.0.0.1
