# Duke Search API

This project provides a basic API for interacting with a Language Model (LLM) to answer FAQ-based questions. It leverages an OpenAI-compatible API.

## Features

- **InvokeLLMUseCase**: This feature allows you to send a prompt along with RAG content to an LLM and receive a generated response. It's designed for FAQ chatbots.

## Setup

1.  **Clone the repository**:

    ```bash
    git clone https://github.com/gabrielSantosLima/duke_search.git
    cd duke_search
    ```

2.  **Install dependencies**:

    ```bash
    pnpm install
    ```

3.  **Environment Variables**:

    Create a `.env` file in the root directory based on `.env.example`. Currently, the LLM interaction uses a local OpenAI-compatible endpoint, so ensure your LLM server is running and accessible at `http://localhost:1234/v1`.

    Example `.env` content:

    ```
    # No specific environment variables are strictly required for this basic setup,
    # but you might add them here if your project evolves.
    ```

4.  **Database Initialization (if applicable)**:

    If the project involves a database, you might need to initialize it. First, start the Docker Compose environment:

    ```bash
    docker-compose up -d
    ```

    Then, you can initialize the database. Check `tools/initialize-db.sh` for database setup scripts.

    ```bash
    # Example for initializing the database
    ./tools/initialize-db.sh
    ```

## Usage

To start the API, you can typically run:

```bash
pnpm start
```

Once the API is running, you can interact with it through its defined routes. The `InvokeLLMUseCase` is exposed via a chat route.

## Project Structure

- `src/`: Contains the main source code.
    - `src/chat/`: Contains chat-related functionalities.
        - `src/chat/features/InvokeLLMUseCase.ts`: Implements the logic for LLM interaction.
    - `src/routes.ts`: Defines API routes.
- `prisma/`: Contains Prisma schema and migrations for database management.
- `db/`: Contains database initialization scripts.
- `tools/`: Contains utility scripts.

## Contributing

Contributions are welcome! Please feel free to open issues or submit pull requests.

## License

This project is licensed under the Apache 2.0 License.
