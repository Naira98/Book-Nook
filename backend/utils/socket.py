from models.order import Order, ReturnOrder
from core.websocket import webSocket_connection_manager
from models.user import UserRole
from models.order import PickUpType


async def send_created_order(
    order: Order, borrow_order_books: list, purchase_order_books: list
):
    new_order_object = {
        "id": order.id,
        "created_at": order.created_at.isoformat(),
        "address": order.address,
        "pickup_type": order.pickup_type.value,
        "phone_number": order.phone_number,
        "user": {
            "first_name": order.user.first_name,
            "last_name": order.user.last_name,
        },
        "number_of_books": len(borrow_order_books) + len(purchase_order_books),
        "courier_id": order.courier_id,
        "pickup_date": order.pickup_date,
        "status": order.status,
    }
    if order.pickup_type == PickUpType.COURIER:
        await webSocket_connection_manager.broadcast_to_role(
            {"message": "order_created", "order": new_order_object}, UserRole.COURIER
        )

    if order.pickup_type == PickUpType.SITE:
        await webSocket_connection_manager.broadcast_to_role(
            {"message": "order_created", "order": new_order_object}, UserRole.EMPLOYEE
        )


async def send_created_return_order(
    return_order: ReturnOrder, borrow_order_books_ids: list
):
    new_order_object = {
        "id": return_order.id,
        "created_at": return_order.created_at.isoformat(),
        "address": return_order.address,
        "pickup_type": return_order.pickup_type.value,
        "phone_number": return_order.phone_number,
        "user": {
            "first_name": return_order.user.first_name,
            "last_name": return_order.user.last_name,
        },
        "number_of_books": len(borrow_order_books_ids),
        "courier_id": return_order.courier_id,
        "status": return_order.status.value,
    }
    if return_order.pickup_type == PickUpType.COURIER:
        await webSocket_connection_manager.broadcast_to_role(
            {"message": "return_order_created", "return_order": new_order_object},
            UserRole.COURIER,
        )

    if return_order.pickup_type == PickUpType.SITE:
        await webSocket_connection_manager.broadcast_to_role(
            {"message": "return_order_created", "return_order": new_order_object},
            UserRole.EMPLOYEE,
        )


async def send_updated_order(order: Order, userRole: UserRole):
    await webSocket_connection_manager.broadcast_to_role(
        {
            "message": "order_status_updated",
            "courier_id": order.courier_id,
            "order_id": order.id,
            "status": order.status.value,
        },
        userRole,
    )


async def send_updated_return_order(return_order: Order, userRole: UserRole):
    await webSocket_connection_manager.broadcast_to_role(
        {
            "message": "return_order_status_updated",
            "return_order_id": return_order.id,
            "status": return_order.status.value,
            "courier_id": return_order.courier_id,
        },
        userRole,
    )


async def send_courier_return_order(return_order: ReturnOrder):
    new_order_object = {
        "id": return_order.id,
        "created_at": return_order.created_at.isoformat(),
        "address": return_order.address,
        "pickup_type": return_order.pickup_type.value,
        "phone_number": return_order.phone_number,
        "user": {
            "first_name": return_order.user.first_name,
            "last_name": return_order.user.last_name,
        },
        "number_of_books": len(return_order.borrow_order_books_details),
        "courier_id": return_order.courier_id,
        "status": return_order.status.value,
    }

    await webSocket_connection_manager.broadcast_to_role(
        {"message": "courier_return_order", "return_order": new_order_object},
        UserRole.EMPLOYEE,
    )
