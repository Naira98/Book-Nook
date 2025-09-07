import asyncio
from datetime import datetime, timedelta, timezone
import httpx

from apscheduler.schedulers.asyncio import AsyncIOScheduler  # type: ignore
from db.database import AsyncSessionLocal
from models.book import BookDetails
from models.notification import NotificationType
from models.order import BorrowBookProblem, BorrowOrderBook
from pytz import utc  # type: ignore
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from settings import settings

SCHEDULER_SECRET = settings.SCHEDULER_SECRET
BACKEND_URL = "http://backend:8000/api/notifications/notify"


async def send_notification_via_api(user_id: int, type: NotificationType, data: dict):
    if SCHEDULER_SECRET is None:
        raise ValueError("SCHEDULER_SECRET must be set in environment variables.")

    payload = {"user_id": user_id, "type": type.value, "data": data}
    headers = {"X-Scheduler-Secret": SCHEDULER_SECRET}

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(BACKEND_URL, json=payload, headers=headers)
            response.raise_for_status()
            print(f"Successfully sent notification for user {user_id} via API.")
        except httpx.HTTPStatusError as e:
            print(
                f"Failed to send notification via API. Status: {e.response.status_code}, Detail: {e.response.text}"
            )
        except Exception as e:
            print(f"An error occurred while calling the notification API: {e}")


async def check_for_due_books():
    print("Checking for books due for return tomorrow...")
    async with AsyncSessionLocal() as db:
        try:
            now_utc = datetime.now(timezone.utc)
            tomorrow_start = datetime.combine(
                now_utc.date() + timedelta(days=1),
                datetime.min.time(),
                tzinfo=timezone.utc,
            )
            tomorrow_end = tomorrow_start + timedelta(days=1)

            stmt = (
                select(BorrowOrderBook)
                .where(
                    BorrowOrderBook.return_order_id.is_(None),
                    BorrowOrderBook.actual_return_date.is_(None),
                    BorrowOrderBook.expected_return_date >= tomorrow_start,
                    BorrowOrderBook.expected_return_date < tomorrow_end,
                    BorrowOrderBook.borrow_book_problem == BorrowBookProblem.NORMAL,
                )
                .options(
                    selectinload(BorrowOrderBook.book_details).selectinload(
                        BookDetails.book
                    )
                )
            )
            result = await db.execute(stmt)
            books_to_notify = result.scalars().all()
            if books_to_notify:
                print(f"Found {len(books_to_notify)} books due for return tomorrow.")
                for book in books_to_notify:
                    book_title = book.book_details.book.title
                    due_date_str = (
                        book.expected_return_date.isoformat()
                        if book.expected_return_date
                        else None
                    )
                    notification_data = {
                        "status": "upcoming",
                        "book_title": book_title,
                        "due_date": due_date_str,
                    }
                    await send_notification_via_api(
                        user_id=book.user_id,
                        type=NotificationType.RETURN_REMINDER,
                        data=notification_data,
                    )
            else:
                print("No books due for return tomorrow.")
        except Exception as e:
            print(f"An error occurred in the 'due books' cron job: {e}")
            await db.rollback()
        finally:
            await db.close()


async def check_for_delayed_returns():
    print("Checking for delayed book returns...")
    async with AsyncSessionLocal() as db:
        try:
            now = datetime.now(timezone.utc)
            stmt = (
                select(BorrowOrderBook)
                .where(
                    BorrowOrderBook.return_order_id.is_(None),
                    BorrowOrderBook.actual_return_date.is_(None),
                    BorrowOrderBook.expected_return_date < now,
                    BorrowOrderBook.borrow_book_problem == BorrowBookProblem.NORMAL,
                )
                .options(
                    selectinload(BorrowOrderBook.book_details).selectinload(
                        BookDetails.book
                    )
                )
            )
            result = await db.execute(stmt)
            delayed_books = result.scalars().all()
            if delayed_books:
                print(f"Found {len(delayed_books)} delayed book returns.")
                for book in delayed_books:
                    book_title = book.book_details.book.title
                    due_date_str = (
                        book.expected_return_date.isoformat()
                        if book.expected_return_date
                        else None
                    )
                    notification_data = {
                        "status": "overdue",
                        "book_title": book_title,
                        "due_date": due_date_str,
                    }
                    await send_notification_via_api(
                        user_id=book.user_id,
                        type=NotificationType.RETURN_REMINDER,
                        data=notification_data,
                    )
            else:
                print("No delayed book returns found.")
        except Exception as e:
            print(f"An error occurred in the 'delayed returns' cron job: {e}")
            await db.rollback()
        finally:
            await db.close()


async def main():
    scheduler = AsyncIOScheduler(timezone=utc)

    scheduler.add_job(
        check_for_due_books,
        "cron",
        hour=11,  # 11AM(utc) => 2PM(EEST)
        minute=0,
        # minute="*/1",
    )

    scheduler.add_job(
        check_for_delayed_returns,
        "cron",
        hour=11,  # 11AM(utc) => 2PM(EEST)
        minute=0,
        # minute="*/1",
    )

    scheduler.start()
    print("Scheduler started. Press Ctrl+C to exit.")

    # This is the correct way to keep the async loop running indefinitely.
    # It creates a future that never completes, preventing the script from exiting.
    try:
        await asyncio.Future()
    except asyncio.CancelledError:
        pass


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except (KeyboardInterrupt, SystemExit):
        pass
