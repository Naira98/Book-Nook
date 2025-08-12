from pydantic import BaseModel


class CreateCheckoutRequest(BaseModel):
    amount: int
