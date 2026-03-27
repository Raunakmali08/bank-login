FROM python:3.11-slim

# Set the working directory
WORKDIR /app

# Copy the backend requirements and install them
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy the rest of the backend and frontend source code
COPY backend/ ./backend/
COPY frontend/ ./frontend/

# Expose both backend (3000) and frontend (8080) ports
EXPOSE 3000 8080

# Create a startup script that runs both the frontend HTTP server (in background)
# and the Uvicorn backend server (in foreground) binding to 0.0.0.0
RUN echo '#!/bin/bash\n\
echo "Starting Frontend UI on port 8080..."\n\
cd /app/frontend && python -m http.server 8080 &\n\
echo "Starting Backend API on port 3000..."\n\
cd /app/backend && uvicorn main:app --host 0.0.0.0 --port 3000\n\
' > /app/start.sh && chmod +x /app/start.sh

# Run the startup script when the container launches
CMD ["/app/start.sh"]
