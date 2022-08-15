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
    listings: data ?? [],
    isFirstLoading,
  };
};
