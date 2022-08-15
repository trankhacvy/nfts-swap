import { mutate as swrMutate } from "swr";
import { ListingsRepository } from "libs/db";
import { useFetchWithCache } from "./useFetchWithCache";
import { useCallback } from "react";

export const useListingDetails = (mint: string) => {
  const { data, isFirstLoading } = useFetchWithCache(
    ["LISTINGS", mint],
    async (_, mint) => {
      const repo = new ListingsRepository();
      return repo.findByMint(mint as string);
    },
    {
      revalidateOnFocus: false,
    }
  );

  const mutate = useCallback(() => {
    swrMutate(["LISTINGS", mint]);
  }, [mint]);

  return {
    listing: data,
    isFirstLoading,
    mutate,
  };
};
