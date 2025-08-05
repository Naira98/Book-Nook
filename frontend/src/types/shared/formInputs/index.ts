import { type InputHTMLAttributes } from "react";

export interface TextInputTypes extends InputHTMLAttributes<HTMLInputElement> {
  placeholder?: string;
  type?: string;
  containerClassName?: string;
  name: string;
}
