# OrderFlow Deployment Guide

## Prerequisites
- Docker Engine 24+ & Docker Compose v2+
- Java 21 JDK (for local builds)
- Apache Maven 3.9+

## 1. Quickstart with Docker Compose
Clone the repository and run the entire platform with one command:
```bash
# Copy environment variables template
cp .env.example .env

# Build and start all 8 microservices and infrastructure
docker compose build
docker compose up -d
```

## 2. Service Endpoints
- **API Gateway**: `http://localhost:8080`
- **Mailpit Web UI (Emails)**: `http://localhost:8025`
- **Prometheus**: `http://localhost:9090`
- **Grafana**: `http://localhost:3000` (User: `admin`, Pass: `admin`)
- **Zipkin Tracing**: `http://localhost:9411`

## 3. Local Development Mode
To run infrastructure in Docker and services locally in IDE:
```bash
# Start only data stores and messaging
docker compose up -d postgres mongodb redis kafka mailpit prometheus grafana zipkin

# Build parent and common library
mvn clean install -DskipTests
```
You can now start any service independently from your IDE.
