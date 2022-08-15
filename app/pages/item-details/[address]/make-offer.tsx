import { NFTCard, NFTCardSkeleton } from "components/NFTCard";
import { APP_NAME } from "constants/config";
import { useNFTs } from "hooks/useNFTs";
import type { NextPage } from "next";
import { NextSeo } from "next-seo";

const NFTs: NextPage = () => {
  const { nfts, isFirstLoading } = useNFTs();

  return (
    <div className="container mx-auto py-10">
      <NextSeo title="Make Offer" titleTemplate={`%s | ${APP_NAME}`} />
      <h2 className="text-3xl font-semibold text-white mb-10">
        Select your NFTs to swap
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {isFirstLoading
          ? Array.from({ length: 9 }).map((_, idx) => (
              <NFTCardSkeleton key={`skeleton-${idx}`} />
            ))
          : nfts.map((nft) => (
              <NFTCard type="offer" key={nft.address.toBase58()} nft={nft} />
            ))}
      </div>
    </div>
  );
};

export default NFTs;
