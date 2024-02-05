#!/bin/sh

set -e

echo "Starting development server"

docker-compose -f docker-compose.dev.yml up --build -d

echo "Development server started"
