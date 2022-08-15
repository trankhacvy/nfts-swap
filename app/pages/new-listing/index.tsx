import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { NFTCard, NFTCardSkeleton } from "components/NFTCard";
import { APP_NAME } from "constants/config";
import { useNFTs } from "hooks/useNFTs";
import type { NextPage } from "next";
import { NextSeo } from "next-seo";

const NewListing: NextPage = () => {
  const { connected } = useWallet();
  const { nfts, isFirstLoading } = useNFTs();

  return (
    <div className="container mx-auto py-10">
      <NextSeo title="New Listing" titleTemplate={`%s | ${APP_NAME}`} />
      <h2 className="heading-h3 mb-10">Select your NFTs to swap</h2>
      {!connected ? (
        <div className="flex flex-col items-center py-20">
          <h2 className="heading-h4 mb-10">Please connect to your wallet</h2>
          <WalletMultiButton className="h-10 btn btn-solid" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {isFirstLoading
            ? Array.from({ length: 9 }).map((_, idx) => (
                <NFTCardSkeleton key={`skeleton-${idx}`} />
              ))
            : nfts.map((nft) => (
                <NFTCard
                  type="listing"
                  key={nft.address.toBase58()}
                  nft={nft}
                />
              ))}
        </div>
      )}
    </div>
  );
};

export default NewListing;
