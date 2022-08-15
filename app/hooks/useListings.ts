import { ListingsRepository } from "libs/db";
import { useFetchWithCache } from "./useFetchWithCache";

export const useListings = () => {
  const { data, isFirstLoading } = useFetchWithCache(
    ["LISTINGS"],
    async () => {
      const repo = new ListingsRepository();
      return repo.findAll();
    },
    {
      revalidateOnFocus: false,
    }
  );

  return {
    listings: (data ?? []).filter((listing) => !listing.accepted_offer),
    acceptedListings: (data ?? []).filter((listing) => listing.accepted_offer),
    isFirstLoading,
  };
};
