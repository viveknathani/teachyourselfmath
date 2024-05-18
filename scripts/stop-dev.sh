#!/bin/sh

set -e

echo "Stopping development server"

docker-compose -f docker-compose.dev.yml down

echo "Development server stopped"
