from pydantic import BaseModel
from typing import List


class InterestsRequest(BaseModel):
    interests: List[str]


class InterestsResponse(BaseModel):
    message: str
    interests: List[str]
