from models.order import Order, ReturnOrder
from schemas.order import AllOrdersResponse
from core.websocket import webSocket_connection_manager
from models.user import UserRole
from models.order import PickUpType


async def send_created_order_via_socket(
    order: Order, borrow_order_books: list, purchase_order_books: list
):
    new_order_object = {
        "id": order.id,
        "created_at": order.created_at.isoformat(),
        "address": order.address,
        "pick_up_type": order.pick_up_type.value,
        "phone_number": order.phone_number,
        "user": {
            "first_name": order.user.first_name,
            "last_name": order.user.last_name,
        },
        "number_of_books": len(borrow_order_books) + len(purchase_order_books),
        "courier_id": order.courier_id,
        "pick_up_date": order.pick_up_date,
        "status": order.status,
    }
    if order.pick_up_type == PickUpType.COURIER:
        await webSocket_connection_manager.broadcast_to_role(
            {"message": "order_created", "order": new_order_object}, UserRole.COURIER
        )

    if order.pick_up_type == PickUpType.SITE:
        await webSocket_connection_manager.broadcast_to_role(
            {"message": "order_created", "order": new_order_object}, UserRole.EMPLOYEE
        )


async def send_created_return_order_via_socket(
    retrun_order: ReturnOrder, borrow_order_books_ids: list
):
    new_order_object = {
        "id": retrun_order.id,
        "created_at": retrun_order.created_at.isoformat(),
        "address": retrun_order.address,
        "pick_up_type": retrun_order.pick_up_type.value,
        "phone_number": retrun_order.phone_number,
        "user": {
            "first_name": retrun_order.user.first_name,
            "last_name": retrun_order.user.last_name,
        },
        "number_of_books": len(borrow_order_books_ids),
        "courier_id": retrun_order.courier_id,
        "status": retrun_order.status.value,
    }
    if retrun_order.pick_up_type == PickUpType.COURIER:
        await webSocket_connection_manager.broadcast_to_role(
            {"message": "return_order_created", "return_order": new_order_object},
            UserRole.COURIER,
        )

    if retrun_order.pick_up_type == PickUpType.SITE:
        await webSocket_connection_manager.broadcast_to_role(
            {"message": "return_order_created", "return_order": new_order_object},
            UserRole.EMPLOYEE,
        )
