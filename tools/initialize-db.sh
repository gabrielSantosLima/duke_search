#!/usr/bin/env bash

set -Eeuo pipefail

DB_SERVICE="dukedb"
ADMINER_SERVICE="adminer"
ENV_FILE=".env"
WAIT_TIMEOUT_SECONDS="${WAIT_TIMEOUT_SECONDS:-60}"

log() {
    printf '\n[%s] %s\n' "$(date '+%H:%M:%S')" "$*"
}

fail() {
    printf '\n[ERROR] %s\n' "$*" >&2
    exit 1
}

command_exists() {
    command -v "$1" >/dev/null 2>&1
}

compose() {
    docker compose "$@"
}

load_env_file() {
    if [[ ! -f "$ENV_FILE" ]]; then
        fail "Missing $ENV_FILE. Copy .env.example to .env and adjust the database values before running this script."
    fi

    set -a
    # shellcheck disable=SC1090
    source "$ENV_FILE"
    set +a
}

validate_prerequisites() {
    command_exists docker || fail "Docker is required but was not found in PATH."
    docker compose version >/dev/null 2>&1 || fail "Docker Compose v2 is required but is not available."
    command_exists pnpm || fail "pnpm is required but was not found in PATH."
}

validate_environment() {
    local required_variables=(
        DATABASE_USER
        DATABASE_PASSWORD
        DATABASE_DB
        DATABASE_PORT
        DATABASE_URL
    )

    for variable in "${required_variables[@]}"; do
        if [[ -z "${!variable:-}" ]]; then
            fail "Missing required environment variable: $variable"
        fi
    done
}

start_database_containers() {
    log "Starting pgvector ($DB_SERVICE) and Adminer ($ADMINER_SERVICE) containers..."
    compose up -d "$DB_SERVICE" "$ADMINER_SERVICE"
}

wait_for_database() {
    log "Waiting for PostgreSQL/pgvector to become healthy..."

    local elapsed=0
    while ((elapsed < WAIT_TIMEOUT_SECONDS)); do
        if compose exec -T "$DB_SERVICE" pg_isready -U "$DATABASE_USER" -d "$DATABASE_DB" >/dev/null 2>&1; then
            log "Database is ready."
            return 0
        fi

        sleep 2
        elapsed=$((elapsed + 2))
    done

    fail "Database did not become ready within ${WAIT_TIMEOUT_SECONDS}s. Check logs with: docker compose logs $DB_SERVICE"
}

run_prisma_setup() {
    log "Applying Prisma migrations..."
    pnpm prisma migrate deploy

    log "Generating Prisma client..."
    pnpm prisma generate
}

print_connection_info() {
    log "Database initialization complete."
    printf '\nServices:\n'
    printf '  - PostgreSQL/pgvector: localhost:%s\n' "$DATABASE_PORT"
    printf '  - Adminer: http://localhost:8080\n'
    printf '\nAdminer login:\n'
    printf '  - System: PostgreSQL\n'
    printf '  - Server: %s\n' "$DB_SERVICE"
    printf '  - Username: %s\n' "$DATABASE_USER"
    printf '  - Password: %s\n' "$DATABASE_PASSWORD"
    printf '  - Database: %s\n' "$DATABASE_DB"
}

main() {
    log "Starting development database initialization..."
    validate_prerequisites
    load_env_file
    validate_environment
    start_database_containers
    wait_for_database
    run_prisma_setup
    print_connection_info
}

main "$@"
