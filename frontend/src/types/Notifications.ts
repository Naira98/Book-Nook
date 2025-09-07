import type { PickUpType } from "./Orders";

export enum NotificationType {
  ORDER_STATUS_UPDATE = "ORDER_STATUS_UPDATE",
  RETURN_ORDER_STATUS_UPDATE = "RETURN_ORDER_STATUS_UPDATE",
  RETURN_REMINDER = "RETURN_REMINDER",
  NEW_PROMO_CODE = "NEW_PROMO_CODE",
  WALLET_UPDATED = "WALLET_UPDATED",
}

export type NotificationData =
  | {
      type: NotificationType.ORDER_STATUS_UPDATE;
      data: { order_id: number; order_status: string; pickup_type: PickUpType };
    }
  | {
      type: NotificationType.RETURN_ORDER_STATUS_UPDATE;
      data: { order_id: number; order_status: string };
    }
  | {
      type: NotificationType.RETURN_REMINDER;
      data: {
        book_title: string;
        due_date: string;
        status: "upcoming" | "overdue";
      };
    }
  | {
      type: NotificationType.NEW_PROMO_CODE;
      data: { code: string; discount: number };
    }
  | {
      type: NotificationType.WALLET_UPDATED;
      data: { amount: number };
    };

export interface NotificationsBase {
  id: number;
  user_id: number;
  read_at: Date | null;
  created_at: Date;
}

export type Notifications = NotificationsBase & NotificationData;
