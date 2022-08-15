import { Metaplex, Metadata, Nft } from "@metaplex-foundation/js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useFetchWithCache } from "./useFetchWithCache";

export const useNFTs = () => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();

  const { data, isFirstLoading } = useFetchWithCache(
    publicKey ? ["NFTS", publicKey.toBase58()] : null,
    async (_, address) => {
      const metaplex = new Metaplex(connection);

      const metadataNfts = (await metaplex
        .nfts()
        .findAllByOwner(new PublicKey(address as string))
        .run()) as Metadata[];

      metadataNfts.sort((item1, item2) => item1.name.localeCompare(item2.name));

      const slide = metadataNfts.slice(0, 10);

      return Promise.all(
        slide.map(
          (meta) =>
            metaplex.nfts().findByMint(meta.mintAddress).run() as Promise<Nft>
        )
      );
    },
    {
      revalidateOnFocus: false,
    }
  );

  return {
    nfts: data ?? [],
    isFirstLoading,
  };
};
