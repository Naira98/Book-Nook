from datetime import datetime
from decimal import Decimal

from models.transaction import TransactionType
from pydantic import BaseModel, ConfigDict


class CreateCheckoutRequest(BaseModel):
    amount: int


class TransactionSchema(BaseModel):
    id: int
    amount: Decimal
    transaction_type: TransactionType
    description: str
    created_at: datetime
    user_id: int

    model_config = ConfigDict(from_attributes=True, use_enum_values=True)
