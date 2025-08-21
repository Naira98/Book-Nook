export interface PromoCodeData {
  id: number;
  code: string;
  discount_perc: string;
  is_active: boolean;
}

export interface PromoCodeCreate {
  code: string;
  discount_perc: string;
  is_active?: boolean;
}

export interface PromoCodeUpdate {
  is_active: boolean;
}
