# Retriever 🐕

> An AI-powered campus lost & found platform built with FastAPI, React, and Gemini Vision for automated visual tagging.

Retriever is a production-grade, highly scalable utility application designed to solve the "Lost and Found" problem on college campuses. By utilizing computer vision (Google Gemini API), Retriever automatically extracts metadata (color, brand, category) from uploaded images, creating a seamless, intelligent search experience.

## ✨ Features

- **Automated AI Tagging**: Upload a photo, and the Gemini API automatically tags it with descriptive metadata.
- **Geospatial & Time Search**: Find items based on exactly where and when they were lost.
- **Premium UI/UX**: Built with React, Tailwind CSS, and Framer Motion for a native-app-like experience.
- **Real-Time WebSockets**: Instantly chat with the finder of your lost item.
- **Secure & Rate-Limited**: JWT authentication (restricted to `.edu` emails) and Redis-backed rate limiting.

## 🏛️ Architecture

Retriever follows a strict **Modular Monolith** pattern:
- **Frontend**: React (Vite), Tailwind CSS, Shadcn/UI
- **Backend**: FastAPI (Python) using Controller/Service/Repository pattern
- **Database**: MongoDB (Motor Async)
- **Caching**: Redis
- **Containerization**: Docker & Docker Compose
- **CI/CD**: GitHub Actions

## 🚀 Getting Started

### Prerequisites
- Docker & Docker Compose installed on your machine.
- A Gemini API Key from Google AI Studio.

### Local Development (Docker)

1. Clone the repository:
   ```bash
   git clone https://github.com/Myself-Praveen/Retriver.git
   cd Retriver
   ```

2. Start the infrastructure (MongoDB, Redis, FastAPI, Frontend):
   ```bash
   docker-compose up --build
   ```

3. Access the application:
   - Frontend: `http://localhost:5173`
   - Backend API Docs (Swagger): `http://localhost:8000/docs`

## 🤝 Contributing
Contributions are welcome. Please ensure that you run `pytest` and `flake8` before submitting a pull request. This repository uses GitHub Actions for continuous integration.
