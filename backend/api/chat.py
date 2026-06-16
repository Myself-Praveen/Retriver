from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from typing import Dict, List

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        # item_id -> list of WebSockets
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, item_id: str):
        await websocket.accept()
        if item_id not in self.active_connections:
            self.active_connections[item_id] = []
        self.active_connections[item_id].append(websocket)

    def disconnect(self, websocket: WebSocket, item_id: str):
        if item_id in self.active_connections:
            self.active_connections[item_id].remove(websocket)
            if not self.active_connections[item_id]:
                del self.active_connections[item_id]

    async def broadcast(self, message: dict, item_id: str):
        if item_id in self.active_connections:
            for connection in self.active_connections[item_id]:
                await connection.send_json(message)

manager = ConnectionManager()

@router.websocket("/ws/{item_id}")
async def websocket_endpoint(websocket: WebSocket, item_id: str):
    await manager.connect(websocket, item_id)
    try:
        while True:
            data = await websocket.receive_text()
            # Simple broadcast
            await manager.broadcast({"message": data}, item_id)
    except WebSocketDisconnect:
        manager.disconnect(websocket, item_id)
        # await manager.broadcast({"message": "A user left the chat"}, item_id)
