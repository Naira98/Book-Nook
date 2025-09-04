from typing import Annotated

from crud.order import (
    create_order_crud,
    get_order_details_crud,
    get_order_details_for_staff_crud,
    get_orders_for_client_crud,
    get_orders_for_staff_crud,
    update_borrow_order_book_problem_crud,
    update_order_status_crud,
)
from db.database import get_db
from fastapi import APIRouter, Body, Depends, status
from models.order import (
    BorrowBookProblem,
)
from models.user import User
from schemas.order import (
    AllOrdersResponse,
    AllUserOrders,
    BorrowOrderBookUpdateProblemResponse,
    CreateOrderRequest,
    GetAllOrdersResponse,
    OrderCreatedUpdateResponse,
    OrderDetailsResponseSchema,
    UpdateOrderStatusRequest,
    UserOrderDetails,
)
from sqlalchemy.ext.asyncio import AsyncSession
from utils.auth import get_staff_user, get_user_via_session

order_router = APIRouter(
    prefix="/order",
    tags=["Orders"],
)


@order_router.get("/my", status_code=status.HTTP_200_OK, response_model=AllUserOrders)
async def get_all_user_orders(
    user: Annotated[User, Depends(get_user_via_session)],
    db: AsyncSession = Depends(get_db),
):
    return await get_orders_for_client_crud(db, user)


@order_router.get(
    "/my/details/{order_id}",
    status_code=status.HTTP_200_OK,
    response_model=UserOrderDetails,
)
async def get_user_order_details(
    user: Annotated[User, Depends(get_user_via_session)],
    order_id: int,
    db: AsyncSession = Depends(get_db),
):
    return get_order_details_crud(db, user, order_id)


@order_router.post(
    "/", response_model=OrderCreatedUpdateResponse, status_code=status.HTTP_201_CREATED
)
async def create_order(
    order_data: CreateOrderRequest,
    user: Annotated[User, Depends(get_user_via_session)],
    db: AsyncSession = Depends(get_db),
):
    return await create_order_crud(db, user, order_data)


@order_router.patch(
    "/borrow_order_book_problem",
    response_model=BorrowOrderBookUpdateProblemResponse,
    status_code=status.HTTP_200_OK,
)
async def update_borrow_order_book_status(
    borrow_order_book_id: Annotated[int, Body()],
    new_status: Annotated[BorrowBookProblem, Body()],
    user: Annotated[User, Depends(get_user_via_session)],
    db: AsyncSession = Depends(get_db),
):
    return await update_borrow_order_book_problem_crud(
        db, user, borrow_order_book_id, new_status
    )


""" Staff Routes """


@order_router.get(
    "/all", response_model=GetAllOrdersResponse, status_code=status.HTTP_200_OK
)
async def get_all_orders(
    staff_user: Annotated[User, Depends(get_staff_user)],
    db: AsyncSession = Depends(get_db),
):
    return await get_orders_for_staff_crud(db, staff_user)


@order_router.get(
    "/{order_id}",
    response_model=OrderDetailsResponseSchema,
    status_code=status.HTTP_200_OK,
)
async def get_order_details(
    order_id: int,
    db: AsyncSession = Depends(get_db),
    staff_user: User = Depends(get_staff_user),
):
    return get_order_details_for_staff_crud(db, staff_user, order_id)


@order_router.patch(
    "/order-status",
    response_model=AllOrdersResponse,
    status_code=status.HTTP_200_OK,
)
async def update_order_status(
    order_data: Annotated[UpdateOrderStatusRequest, Body()],
    db: AsyncSession = Depends(get_db),
    staff_user: User = Depends(get_staff_user),
):
    return await update_order_status_crud(db, staff_user, order_data)
