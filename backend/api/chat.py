from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from typing import Dict, List
import json
from core.database import get_db

router = APIRouter()

def get_chat_collection():
    return get_db()["chats"]

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

@router.get("/{item_id}/history")
async def get_chat_history(item_id: str):
    cursor = get_chat_collection().find({"item_id": item_id}).sort("timestamp", 1)
    messages = await cursor.to_list(length=100)
    for m in messages:
        m["_id"] = str(m["_id"])
    return messages

@router.websocket("/ws/{item_id}")
async def websocket_endpoint(websocket: WebSocket, item_id: str):
    await manager.connect(websocket, item_id)
    try:
        while True:
            data = await websocket.receive_text()
            msg_dict = json.loads(data)
            msg_dict["item_id"] = item_id
            
            # Save to DB
            await get_chat_collection().insert_one(msg_dict.copy())
            
            # Broadcast
            await manager.broadcast({"message": json.dumps(msg_dict)}, item_id)
    except WebSocketDisconnect:
        manager.disconnect(websocket, item_id)
