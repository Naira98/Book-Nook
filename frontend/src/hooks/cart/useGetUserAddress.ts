import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";

interface GeocodingResponse {
  latitude: number;
  longitude: number;
  principalSubdivision: string;
  city: string;
  locality: string;
  postcode: string;
  countryName: string;
  formattedAddress: string;
}

interface GeocodingVariables {
  latitude: number;
  longitude: number;
}

export function useGetAddress() {
  const {
    mutate: getAddress,
    isPending,
    data: addressData,
    isSuccess,
  } = useMutation<GeocodingResponse, Error, GeocodingVariables>({
    mutationFn: async (values) => {
      const { latitude, longitude } = values;
      const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to get address. Please try again.");
      }
      return (await response.json()) as GeocodingResponse;
    },

    onSuccess: () => {},

    onError: (err) => {
      toast.error(err.message || "An unexpected error occurred.");
    },
  });

  return { getAddress, isPending, addressData, isSuccess };
}
