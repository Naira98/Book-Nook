from decimal import Decimal
from pydantic import BaseModel, ConfigDict

class promoCodeSchema(BaseModel):
    id: int
    code: str
    discount_perc: Decimal
    is_active: bool

    model_config = ConfigDict(from_attributes=True)

class PromoCodeCreate(BaseModel):
    code: str
    discount_perc: Decimal
    is_active: bool = True

    model_config = ConfigDict(from_attributes=True)

class PromoCodeUpdate(BaseModel):
    is_active: bool

    model_config = ConfigDict(from_attributes=True)
