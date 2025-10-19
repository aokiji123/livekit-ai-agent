FROM python:3.12-slim

WORKDIR /app

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

COPY pyproject.toml uv.lock ./

RUN uv sync --frozen --no-cache

COPY . .

RUN uv run python agent.py download-files

EXPOSE 8080

CMD ["uv", "run", "python", "agent.py", "start"]

