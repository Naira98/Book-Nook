from pydantic import BaseModel, ConfigDict


class InterestInput(BaseModel):
    interests: list[str]
    model_config = ConfigDict(from_attributes=True, use_enum_values=True)
