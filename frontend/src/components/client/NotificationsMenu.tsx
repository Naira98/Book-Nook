import clsx from "clsx";
import { Bell, TriangleAlert, Package, Tag, Undo2, Wallet } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useGetNotifications } from "../../hooks/notifications/useGetNotifications";
import { useMarkNotificationsRead } from "../../hooks/notifications/useMarkNotificationsRead";
import {
  NotificationType,
  type Notifications,
} from "../../types/Notifications";
import { formatDateTime, formatMoney } from "../../utils/formatting";
import FullScreenSpinner from "../shared/FullScreenSpinner";

const NotificationsMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const prevIsOpenRef = useRef(isOpen);
  const { notifications, isPending: isNotificationsPending } =
    useGetNotifications();
  const { markAsRead } = useMarkNotificationsRead();
  const navigate = useNavigate();

  const unreadCount = notifications?.filter((n) => !n.read_at).length || 0;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const wasOpen = prevIsOpenRef.current;

    if (wasOpen && !isOpen && unreadCount > 0) {
      const ids =
        notifications?.filter((n) => !n.read_at).map((n) => n.id) || [];
      if (ids.length > 0) markAsRead(ids);
    }

    prevIsOpenRef.current = isOpen;
  }, [isOpen, markAsRead, unreadCount, notifications]);

  const handleNotificationClick = (notification: Notifications) => {
    switch (notification.type) {
      case NotificationType.ORDER_STATUS_UPDATE:
        navigate(`/orders-history/order/${notification.data.order_id}`);
        break;
      case NotificationType.RETURN_ORDER_STATUS_UPDATE:
        navigate(`/orders-history/return-order/${notification.data.order_id}`);
        break;
      case NotificationType.WALLET_UPDATED:
        navigate("/transactions?tab=history");
        break;
      case NotificationType.RETURN_REMINDER:
        navigate("/current-borrows");
        break;
      case NotificationType.NEW_PROMO_CODE:
        navigate("/purchase-books");
        break;
      default:
        break;
    }

    setIsOpen(false);
  };

  if (isNotificationsPending) return <FullScreenSpinner />;

  return (
    <div className="relative" ref={menuRef}>
      <button
        className="text-primary hover:text-secondary relative flex h-9 w-9 cursor-pointer items-center justify-center transition-all duration-200"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Notifications"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="bg-secondary absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-xs text-white shadow-sm">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="ring-opacity-5 absolute right-0 z-50 mt-2 w-90 origin-top-right rounded-lg border border-gray-200 bg-white shadow-lg transition-all duration-200">
          <div className="bg-accent sticky top-0 z-10 flex items-center justify-between rounded-t-lg border-b border-gray-200 px-4 py-3">
            <h3 className="text-md text-primary font-semibold">
              Notifications
            </h3>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications?.length ? (
              notifications.map((notification, index) => {
                const isUnread = !notification.read_at;
                return (
                  <div
                    key={notification.id}
                    className={clsx(
                      "group hover:bg-accent flex cursor-pointer items-start gap-3 border-l-4 px-4 py-3 transition-all duration-150",
                      {
                        "border-l-secondary": isUnread,
                        "border-l-transparent": !isUnread,
                        "border-b border-b-gray-100":
                          index < notifications.length - 1,
                      },
                    )}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div
                      className={clsx(
                        "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                        {
                          "bg-secondary/20": isUnread,
                          "bg-gray-100": !isUnread,
                        },
                      )}
                    >
                      {notificationIcons[notification.type] || (
                        <Bell className="h-4 w-4 text-gray-500" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className={clsx("text-sm leading-tight", {
                          "text-primary font-medium": isUnread,
                          "text-layout": !isUnread,
                        })}
                      >
                        {getNotificationMessage(notification)}
                      </p>
                      <div className="mt-1.5 flex items-center justify-between">
                        <span
                          className={clsx("text-xs", {
                            "text-secondary font-medium": isUnread,
                            "text-gray-500": !isUnread,
                          })}
                        >
                          {formatDateTime(
                            notification.created_at.toLocaleString(),
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center px-4 py-8 text-center">
                <Bell className="mb-2 h-10 w-10 text-gray-300" />
                <p className="text-layout text-sm">No notifications yet</p>
                <p className="mt-1 text-xs text-gray-500">
                  We'll notify you when something arrives
                </p>
              </div>
            )}
          </div>

          {notifications && notifications.length > 0 && (
            <div className="bg-accent sticky bottom-0 rounded-b-lg border-t border-gray-200 px-4 py-2.5">
              <p className="text-layout text-center text-xs">
                {unreadCount} unread • showing {notifications?.length} latest
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationsMenu;

const notificationIcons: Record<string, ReactNode> = {
  ORDER_STATUS_UPDATE: <Package className="text-primary h-4 w-4" />,
  RETURN_ORDER_STATUS_UPDATE: <Undo2 className="text-primary h-4 w-4" />,
  RETURN_REMINDER: <TriangleAlert className="text-primary h-4 w-4" />,
  NEW_PROMO_CODE: <Tag className="text-primary-500 h-4 w-4" />,
  WALLET_UPDATED: <Wallet className="text-primary-600 h-4 w-4" />,
};

function getNotificationMessage(notification: Notifications) {
  const orderStatusMap = (pickupType?: string): Record<string, string> => ({
    ON_THE_WAY: "is on its way to you",
    PICKED_UP:
      pickupType === "SITE"
        ? "has been collected from the library"
        : "has been delivered to you",
    PROBLEM: "has an issue",
  });

  const returnStatusMap: Record<string, string> = {
    ON_THE_WAY: "A courier is on the way to collect your books",
    PICKED_UP: "A courier has picked up your returned books",
    CHECKING: "Your returned books are being checked at the library",
    DONE: "Your return order has been successfully completed",
    PROBLEM: "There’s an issue with your return order",
  };

  switch (notification.type) {
    case NotificationType.ORDER_STATUS_UPDATE:
      return `Your order #${notification.data.order_id} ${
        orderStatusMap(notification.data.pickup_type)[
          notification.data.order_status
        ] || "was updated"
      }`;

    case NotificationType.RETURN_ORDER_STATUS_UPDATE:
      return `Your return order #${notification.data.order_id} ${
        returnStatusMap[notification.data.order_status] || "was updated"
      }`;
    case NotificationType.RETURN_REMINDER: {
      const reminderData = notification.data;
      const today = new Date();
      const dueDate = new Date(reminderData.due_date);
      const overdueDays = Math.floor(
        (today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (reminderData.status === "tomorrow") {
        return `Just a reminder! Your book, "${reminderData.book_title}", is due for return tomorrow.`;
      } else if (reminderData.status === "overdue") {
        return `Your book, "${reminderData.book_title}", is ${overdueDays} days overdue. This may lead to a deduction from your deposit.`;
      }
      return `Your return reminder for "${reminderData.book_title}" has been updated.`;
    }
    case NotificationType.NEW_PROMO_CODE:
      return `New promo! Use code "${notification.data.code}" for ${notification.data.discount}% off`;
    case NotificationType.WALLET_UPDATED:
      if (notification.data.amount > 0 && notification.data.return_order_id) {
        return `Deposit returned for Return Order #${notification.data.return_order_id}: ${formatMoney(notification.data.amount.toString())} EGP has been credited to your wallet.`;
      }
      if (notification.data.amount < 0 && notification.data.return_order_id) {
        return `Penalty charged for Return Order #${notification.data.return_order_id}: ${formatMoney(Math.abs(notification.data.amount).toString())} EGP has been debited from your wallet.`;
      }
      return `Wallet ${notification.data.amount > 0 ? "credited" : "debited"}: ${formatMoney(notification.data.amount.toString())} EGP`;

    default:
      return "You have a new notification";
  }
}
