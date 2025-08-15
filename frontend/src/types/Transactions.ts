export enum TransactionType {
  WITHDRAWING = "WITHDRAWING",
  ADDING = "ADDING",
}

export interface ITransaction {
  id: string;
  amount: string;
  transaction_type: TransactionType;
  description: string;
  created_at: Date;
  user_id: number;
  order_id?: number;
}
