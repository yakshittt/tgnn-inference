FROM python:3.11-slim

# Set up a new user named "user" with user ID 1000 for non-root compatibility
RUN useradd -m -u 1000 user

WORKDIR /app

# Install minimal system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies (CPU-only PyTorch + FastAPI)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy service code and artifacts
COPY app/ ./app/
COPY artifacts/ ./artifacts/

# Switch to non-root user
USER user

# Default port (Render overrides PORT via environment variable; local fallback is 7860)
ENV PORT=7860
EXPOSE 7860

# Start FastAPI application dynamically resolving PORT
CMD ["sh", "-c", "exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-7860}"]
