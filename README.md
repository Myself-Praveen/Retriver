# Retriever

[![React](https://img.shields.io/badge/React-19-blue.svg)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111+-009688.svg)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB.svg)](https://www.python.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248.svg)](https://www.mongodb.com/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED.svg)](https://www.docker.com/)

An intelligent campus lost and found management system utilizing Computer Vision and Large Language Models for automated metadata extraction and indexing.

Retriever streamlines the recovery of lost items by automatically processing user-uploaded images through the Google Gemini Vision API to extract descriptive tags (color, brand, category). This data is seamlessly indexed to provide a highly accurate, map-integrated search experience.

---

## Capabilities

- **Automated Metadata Extraction**: Leverages the Google Gemini Vision API to automatically identify and tag uploaded items with attributes such as brand, primary color, and category.
- **Real-Time Communication**: Integrates an asynchronous WebSocket chat system, enabling direct, persistent, and secure messaging between finders and owners.
- **Geospatial Tracking**: Utilizes interactive Leaflet maps combined with the OpenStreetMap Nominatim API for precise coordinate plotting and geocoding.
- **Automated Document Generation**: Dynamically generates high-resolution, printable "WANTED" flyers for lost items, complete with scannable QR codes for quick system access.
- **Scalable Media Storage**: Implements Cloudinary for secure, production-grade Content Delivery Network (CDN) image storage, featuring intelligent fallback to local static file serving.
- **Workflow State Management**: Supports full item lifecycle management, allowing users to transition items to a "Resolved" state, which automatically archives associated chat sessions.

---

## Architecture Design

Retriever employs a Modular Monolith architecture, guaranteeing a strict separation of concerns through the Controller-Service-Repository pattern while minimizing operational complexity.

### High-Level System Architecture

```mermaid
graph TD
    classDef client fill:#f9f9f9,stroke:#333,stroke-width:2px,color:#000;
    classDef backend fill:#e1f5fe,stroke:#0288d1,stroke-width:2px,color:#000;
    classDef database fill:#e8f5e9,stroke:#388e3c,stroke-width:2px,color:#000;
    classDef external fill:#fff3e0,stroke:#f57c00,stroke-width:2px,color:#000;

    Client[React Web Client]:::client
    
    subgraph Core Backend
        API[FastAPI Server]:::backend
        WS[WebSocket Manager]:::backend
    end
    
    subgraph Data Persistence
        DB[(MongoDB)]:::database
        Cache[(Redis Cache)]:::database
    end
    
    subgraph External Services
        Gemini[Google Gemini Vision]:::external
        CDN[Cloudinary CDN]:::external
        OSM[OpenStreetMap]:::external
    end

    Client -- REST / HTTPS --> API
    Client -- ws:// --> WS
    Client -- Fetch Tiles --> OSM
    
    API -- Motor / Async --> DB
    WS -- Pub/Sub --> Cache
    WS -- Persist Logs --> DB
    
    API -- Upload Stream --> CDN
    API -- Image URL + Prompt --> Gemini
    
    Client -- Fetch Assets --> CDN
```

### Automated Vision Pipeline

The following sequence details the intelligent tagging workflow triggered upon item submission:

```mermaid
sequenceDiagram
    autonumber
    participant Client
    participant API as FastAPI Gateway
    participant CDN as Cloudinary
    participant LLM as Gemini AI Model
    participant DB as MongoDB

    Client->>API: POST /api/items/ (Multipart Form-Data)
    activate API
    
    API->>CDN: Stream Image Blob
    activate CDN
    CDN-->>API: Return Secure Delivery URL
    deactivate CDN
    
    API->>LLM: Transmit Image URL + Extraction Prompt
    activate LLM
    LLM-->>API: Return Structured JSON (Brand, Color, Category)
    deactivate LLM
    
    API->>DB: Insert Document (Item Data + AI Tags)
    activate DB
    DB-->>API: Acknowledge Insertion
    deactivate DB
    
    API-->>Client: 201 Created (Item Details Payload)
    deactivate API
```

### Real-Time WebSocket Infrastructure

The chat architecture guarantees immediate message delivery while ensuring robust historical persistence.

```mermaid
sequenceDiagram
    autonumber
    participant Finder
    participant Owner
    participant API as Connection Manager
    participant Cache as Redis
    participant DB as MongoDB

    Finder->>API: Establish connection (wss://.../chat/{id})
    Owner->>API: Establish connection (wss://.../chat/{id})
    
    Finder->>API: Transmit Message Payload
    activate API
    
    par Real-Time Broadcast
        API->>Owner: Push Message Payload to Active Socket
    and Distributed Pub/Sub
        API->>Cache: Publish to Room Channel
    and Persistent Storage
        API->>DB: Asynchronously insert chat record
    end
    
    deactivate API
```

---

## Technical Stack

- **Client Infrastructure**: React 19, Vite, Tailwind CSS v4, Framer Motion, React-Leaflet
- **Application Server**: FastAPI, Pydantic, Uvicorn (ASGI)
- **Data Layer**: MongoDB (Motor Async Driver), Upstash Redis
- **Integrations**: Google Gemini 1.5 Flash, Cloudinary SDK, OpenStreetMap
- **DevOps**: Docker, Docker Compose, GitHub Actions (CI/CD)

---

## Getting Started

### Prerequisites
- Docker and Docker Compose
- Node.js environment (optional, for local client debugging)
- Google AI Studio API Key (Gemini)

### Local Deployment (Dockerized)

1. Clone the repository:
   ```bash
   git clone https://github.com/Myself-Praveen/Retriever.git
   cd Retriever
   ```

2. Establish the environment configuration in `backend/.env`:
   ```env
   MONGO_URL=mongodb://mongodb:27017
   GEMINI_API_KEY=your_google_ai_key
   REDIS_URL=redis://redis:6379
   JWT_SECRET=super_secret_key
   ```

3. Initialize the containers:
   ```bash
   docker-compose up --build
   ```

4. Validate the deployment:
   - Client Application: `http://localhost:5173`
   - API Documentation (OpenAPI/Swagger): `http://localhost:8000/docs`

---

## Contributing
We enforce rigorous code quality standards. Ensure all local tests pass by executing `pytest` and `flake8` prior to submitting a Pull Request. Continuous Integration pipelines will automatically reject non-compliant submissions.
