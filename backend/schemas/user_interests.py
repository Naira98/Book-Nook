import re
from typing import List

from pydantic import BaseModel, field_validator


class InterestsRequest(BaseModel):
    interests: List[str]

    @field_validator("interests")
    @classmethod
    def validate_interests(cls, v):
        if not v:
            raise ValueError("At least one interest is required")
        if len(v) > 10:  # Limit to 10 interests
            raise ValueError("Cannot add more than 10 interests")

        # Validate each interest
        for interest in v:
            if not interest.strip():
                raise ValueError("Interest cannot be empty")
            if len(interest) > 50:
                raise ValueError("Interest cannot exceed 50 characters")
            if not re.match(r"^[a-zA-Z0-9\s\-_&]+$", interest):
                raise ValueError(
                    "Interest can only contain letters, numbers, spaces, hyphens, underscores, and ampersands"
                )

        return v


class UserInterestsResponse(BaseModel):
    user_id: int
    interests: List[str]
    message: str


class InterestsResponse(BaseModel):
    message: str
    interests: List[str]
