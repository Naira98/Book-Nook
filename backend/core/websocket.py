import json
from typing import Dict, Set
from fastapi import WebSocket
from models.user import UserRole


class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[int, WebSocket] = {}

        self.connections_by_role: Dict[UserRole, Set[int]] = {
            UserRole.CLIENT: set(),
            UserRole.EMPLOYEE: set(),
            UserRole.MANAGER: set(),
            UserRole.COURIER: set(),
        }

    async def connect(self, websocket: WebSocket, user_id: int, user_role: UserRole):
        await websocket.accept()
        self.active_connections[user_id] = websocket

        # Add the user_id to the set for their role
        if user_role in self.connections_by_role:
            self.connections_by_role[user_role].add(user_id)

    def disconnect(self, user_id: int, user_role: UserRole):
        if user_id in self.active_connections:
            del self.active_connections[user_id]

            # Remove the user_id from the set for their role
            if user_role in self.connections_by_role:
                self.connections_by_role[user_role].discard(user_id)

    async def send_personal_message(self, message: dict, user_id: int):
        if user_id in self.active_connections:
            websocket = self.active_connections[user_id]
            await websocket.send_text(json.dumps(message))

    async def broadcast_to_role(self, message: dict, role: UserRole):
        message_str = json.dumps(message)
        if role in self.connections_by_role:
            user_ids = self.connections_by_role[role]
            for user_id in user_ids:
                if user_id in self.active_connections:  # Safety check
                    websocket = self.active_connections[user_id]
                    await websocket.send_text(message_str)

    async def broadcast(self, message: dict):
        message_str = json.dumps(message)
        for connection in self.active_connections.values():
            await connection.send_text(message_str)


webSocket_connection_manager = ConnectionManager()
