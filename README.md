# Retriever 🐕

> An AI-powered campus lost & found platform built with FastAPI, React, and Gemini Vision for automated visual tagging.

Retriever is a production-grade, highly scalable utility application designed to solve the "Lost and Found" problem on college campuses. By utilizing computer vision (Google Gemini API), Retriever automatically extracts metadata (color, brand, category) from uploaded images, creating a seamless, intelligent search experience.

## ✨ Features

- **Automated AI Tagging**: Upload a photo, and the Gemini API automatically tags it with descriptive metadata (brand, color, category, detailed description).
- **Neo-Brutalist UI**: Completely custom "Comic Cool" design system featuring thick borders, hard drop shadows, vibrant high-contrast colors, and bouncy Framer Motion animations.
- **Interactive Map Search**: Select exact lost/found locations using interactive Leaflet maps. Features an integrated geocoding search bar powered by OpenStreetMap Nominatim API with real-time autocomplete suggestions.
- **Real-Time Persistent Chat**: Communicate securely with finders via FastAPI WebSockets. All chat histories are instantly persisted in MongoDB and loaded on demand.
- **Complete Item Workflow**: Owners can mark their items as "Resolved", locking the chat feature and automatically updating the public feed.
- **Flexible Media Storage**: Supports direct local image uploads served via FastAPI `StaticFiles`, with an optional Cloudinary integration for production.
- **User Profiles**: Dedicated dashboard to view, manage, and track all your reported lost or found items.

## 🏛️ Architecture

Retriever follows a strict **Modular Monolith** pattern:
- **Frontend**: React 19 (Vite), Tailwind CSS v4, Framer Motion, Leaflet Maps
- **Backend**: FastAPI (Python) using Controller/Service/Repository pattern
- **Database**: MongoDB (Motor Async) for items, users, and chat persistence
- **Caching**: Redis
- **Real-time Engine**: FastAPI WebSockets
- **Containerization**: Docker & Docker Compose
- **CI/CD**: GitHub Actions

## 🚀 Getting Started

### Prerequisites
- Docker & Docker Compose installed on your machine.
- A Gemini API Key from Google AI Studio.

### Local Development (Docker)

1. Clone the repository:
   ```bash
   git clone https://github.com/Myself-Praveen/Retriever.git
   cd Retriever
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
