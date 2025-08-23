from decimal import Decimal

from fastapi import HTTPException, status
from models.transaction import Transaction, TransactionType
from models.user import User
from sqlalchemy.ext.asyncio import AsyncSession


async def pay_from_wallet(
    db: AsyncSession,
    user: User,
    amount: Decimal,
    description: str,
    apply_negative_balance: bool = False,
) -> Transaction:
    if user.wallet < amount and not apply_negative_balance:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Insufficient funds in wallet. Current balance: {user.wallet}, required: {amount}",
        )

    user.wallet -= amount

    transaction = Transaction(
        user_id=user.id,
        amount=amount,
        transaction_type=TransactionType.WITHDRAWING.value,
        description=description,
    )
    db.add(transaction)

    return transaction


async def add_to_wallet(
    db: AsyncSession,
    user: User,
    amount: Decimal,
    description: str,
) -> Transaction:
    user.wallet += amount

    transaction = Transaction(
        user_id=user.id,
        amount=amount,
        transaction_type=TransactionType.ADDING.value,
        description=description,
    )

    db.add(transaction)

    return transaction
