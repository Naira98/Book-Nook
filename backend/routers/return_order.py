from typing import Annotated, List

from crud.return_orders import (
    create_return_order_crud,
    get_client_borrows_books_crud,
    get_client_return_order_details_crud,
    get_client_return_orders_crud,
    get_staff_return_order_details_crud,
    update_return_order_status_crud,
)
from db.database import get_db
from fastapi import APIRouter, Body, Depends, status
from models.user import User
from schemas.order import (
    UpdateReturnOrderStatusRequest,
)
from schemas.return_order import (
    AllUserReturnOrders,
    ClientBorrowsResponse,
    ReturnOrderRequest,
    UserOrderDetails,
)
from sqlalchemy.ext.asyncio import AsyncSession
from utils.auth import get_staff_user, get_user_via_session

return_order_router = APIRouter(
    prefix="/return-order",
    tags=["Return Order"],
)


@return_order_router.get("/client-borrows", response_model=List[ClientBorrowsResponse])
async def get_client_borrows(
    user: User = Depends(get_user_via_session), db: AsyncSession = Depends(get_db)
):
    return await get_client_borrows_books_crud(user.id, db)


@return_order_router.get(
    "/my", status_code=status.HTTP_200_OK, response_model=AllUserReturnOrders
)
async def get_all_user_return_orders(
    user: Annotated[User, Depends(get_user_via_session)],
    db: AsyncSession = Depends(get_db),
):
    return await get_client_return_orders_crud(db, user)


@return_order_router.get(
    "/my/details/{return_order_id}",
    status_code=status.HTTP_200_OK,
    response_model=UserOrderDetails,
)
async def get_client_return_order_details(
    return_order_id: int,
    user: Annotated[User, Depends(get_user_via_session)],
    db: AsyncSession = Depends(get_db),
):
    return await get_client_return_order_details_crud(db, user, return_order_id)


@return_order_router.post("/", status_code=status.HTTP_201_CREATED)
async def create_return_order(
    return_return_order_data: ReturnOrderRequest,
    user: User = Depends(get_user_via_session),
    db: AsyncSession = Depends(get_db),
):
    retrun_order = await create_return_order_crud(user, return_return_order_data, db)
    return {
        "message": "Return order created successfully",
        "return_order_id": retrun_order.id,
    }


""" Staff routers """


@return_order_router.patch(
    "/return-order-status",
    response_model=UpdateReturnOrderStatusRequest,
)
async def update_return_order_status(
    return_order_data: Annotated[UpdateReturnOrderStatusRequest, Body()],
    db: AsyncSession = Depends(get_db),
    staff_user: User = Depends(get_staff_user),
):
    return await update_return_order_status_crud(db, staff_user, return_order_data)


@return_order_router.get(
    "/{return_order_id}",
    response_model=UpdateReturnOrderStatusRequest,
    status_code=status.HTTP_200_OK,
)
async def get_return_order_details(
    return_order_id: int,
    db: AsyncSession = Depends(get_db),
    staff_user: User = Depends(get_staff_user),
):
    return await get_staff_return_order_details_crud(db, staff_user, return_order_id)
