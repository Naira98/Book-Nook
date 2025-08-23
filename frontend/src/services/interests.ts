import apiReq from "./apiReq";
import type { IInterest, IPurchaseBook } from "../types/Book"; 

// Response interface from backend
interface InterestsResponse {
  message: string;
  interests: string[];
}

// --- Fetch user interests ---
export const fetchUserInterests = async (): Promise<IInterest[]> => {
  const response = (await apiReq("GET", "/api/interests/")) as InterestsResponse;
 
  return response.interests.map(name => ({ id: 0, name }));
};

// --- Update user interests ---
export const updateUserInterests = async (interests: IInterest[]): Promise<void> => {
  const names = interests.map(i => i.name);
  await apiReq("PUT", "/api/interests/", { interests: names });
};

// --- Fetch books by user interests ---
export const fetchBooksByInterests = async (): Promise<IPurchaseBook[]> => {
  const response = await apiReq("GET", "/books/by-interests");
  return response as IPurchaseBook[];
};
