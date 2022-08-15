import { AnchorProvider } from "@project-serum/anchor";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { useMemo } from "react";

export const useAnchorProvider = () => {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  const provider = useMemo(() => {
    if (!wallet) return undefined;

    return new AnchorProvider(
      connection,
      wallet,
      AnchorProvider.defaultOptions()
    );
  }, [connection, wallet]);

  return provider;
};
