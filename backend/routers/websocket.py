from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from core.websocket import webSocket_connection_manager
from utils.auth import get_user
from schemas.auth import LoginResponse


websocket_router = APIRouter(tags=["WebSocket"])


@websocket_router.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket, user: LoginResponse = Depends(get_user)
):
    await webSocket_connection_manager.connect(websocket, user.id, user.role)
    try:
        while True:
            # This loop keeps the connection alive and can be used to process incoming messages.
            await websocket.receive_text()
    except WebSocketDisconnect:
        # This is an expected exception when the client closes the connection.
        pass
    finally:
        webSocket_connection_manager.disconnect(user.id, user.role)
