FROM python:3.13-alpine

WORKDIR /app

# Install PostgreSQL development libraries and build dependencies
RUN apk add --no-cache \
    postgresql-dev \
    gcc \
    musl-dev \
    libffi-dev \
    && rm -rf /var/cache/apk/*

COPY requirements.txt .

RUN pip install -r requirements.txt

CMD ["fastapi", "dev", "--host", "0.0.0.0"]
