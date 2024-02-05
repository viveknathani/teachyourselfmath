#!/bin/sh

set -e

if [ $# -eq 0 ]; then
    echo "Please provide a migration command [up | down]"
    exit 0
fi

# if the first argument is up or down, run the migration
if [ $1 = "up" ] || [ $1 = "down" ]; then
    echo "Running migration with command: $1"
    docker exec webapp yarn migrate $1
    echo "Migration complete"
    exit 0
fi
