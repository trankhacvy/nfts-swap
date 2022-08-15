import { useState } from "react";
import { Nft } from "@metaplex-foundation/js";
import { OfferModal } from "components/OfferModal";
import { Skeleton } from "components/Skeleton";
import { ListingModal } from "components/ListingModal";
import { Image } from "components/Image";

type NFTCardProps = {
  nft: Nft;
  type: "listing" | "offer";
};

export const NFTCard = ({ nft, type }: NFTCardProps) => {
  const [visible, setVisible] = useState(false);

  return (
    <button onClick={() => setVisible(true)} className="cursor-pointer">
      <div className="card transition duration-500 p-6 hover:scale-105 hover:shadow-z8">
        <div className="w-full rounded-xl overflow-hidden">
          <Image
            className="w-full"
            src={nft.json?.image}
            alt={nft.json?.name}
          />
        </div>
        <div className="pt-6">
          <h2 className="heading-h5">{nft.name}</h2>
        </div>
      </div>
      {nft && type === "listing" && (
        <ListingModal
          nft={nft}
          isOpen={visible}
          onClose={() => setVisible(false)}
        />
      )}
      {type === "offer" && (
        <OfferModal
          nft={nft}
          isOpen={visible}
          onClose={() => setVisible(false)}
        />
      )}
    </button>
  );
};

export const NFTCardSkeleton = () => {
  return (
    <div className="bg-gray-60 overflow-hidden">
      <Skeleton className="aspect-square rounded-xl" />
      <div className="p-4">
        <Skeleton className="w-3/4 h-8 rounded-lg mb-3" />
      </div>
    </div>
  );
};
