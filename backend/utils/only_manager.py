from fastapi import Depends, HTTPException, status
from routers.auth import get_current_user
from models.user import User


def manager_required(current_user: User = Depends(get_current_user)):
    if current_user.role != "MANAGER":  # adjust field name if it's "role" or "user_role"
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access this resource",
        )
    return current_user
