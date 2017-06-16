#!/bin/bash

while true; do
    RESP=$(echo '[{"foo":3}]' | curl -X POST http://localhost:3000 -H 'content-type: application/json' -d @-)
    echo "$(date -u -R) $RESP" >> request.log
    sleep 30
done
