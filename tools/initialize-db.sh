#!/bin/bash


# Exit immediately if a command exits with a non-zero status.
set -e

echo "Starting database initialization..."

# Run Prisma migrations to deploy schema changes
echo "Running Prisma migrations..."
pnpm dlx prisma migrate deploy --preview-feature

# Generate Prisma client and pull the database schema
echo "Pulling database schema and generating Prisma client..."
pnpm dlx prisma db pull
pnpm dlx prisma generate

# Seed initializing
echo "Pulling database schema and generating Prisma client..."
pnpm dlx prisma db seed

echo "Database initialization complete."
