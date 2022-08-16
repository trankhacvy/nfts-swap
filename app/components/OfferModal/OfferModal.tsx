import { useState } from "react";
import { Nft } from "@metaplex-foundation/js";
import { useWallet } from "@solana/wallet-adapter-react";
import { Button } from "components/Button";
import { Modal } from "components/Modal";
import toast from "react-hot-toast";
import { useRouter } from "next/router";
import { useAnchorProvider } from "hooks/useProvider";
import { ExchangeProgram } from "libs/program";
import { OffersRepository } from "libs/db";
import { PublicKey } from "@solana/web3.js";
import { Image } from "components/Image";
import { TraitCard } from "components/TraitCard";

interface OfferModalProps {
  nft: Nft;
  isOpen: boolean;
  onClose: VoidFunction;
}

export const OfferModal = ({ nft, isOpen, onClose }: OfferModalProps) => {
  const {
    push,
    query: { address },
  } = useRouter();
  const [loading, setLoading] = useState(false);

  const { publicKey } = useWallet();
  const provider = useAnchorProvider();

  const handleBidding = async (nft: Nft) => {
    try {
      if (!provider || !publicKey) return;
      const program = new ExchangeProgram(provider);
      const repo = new OffersRepository();
      setLoading(true);
      await program.createOffer(
        nft.mint.address,
        new PublicKey(address as string)
      );
      await repo.create({
        id: nft.mint.address.toBase58(),
        bidder: publicKey.toBase58(),
        listing_id: address as string,
        mint: nft.mint.address.toBase58(),
        image: nft.json?.image,
        name: nft.json?.name,
        description: nft.json?.description,
        attributes: nft.json?.attributes,
        collection_address: nft.collection?.address.toBase58(),
        collection_name: nft.json?.collection?.name,
      });
      toast.success("Your Offer has been submitted.");
      push(`/item-details/${address}`);
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      toast.error(error.message);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-full flex items-start relative z-10 max-w-5xl">
        <div className="max-w-md rounded-xl overflow-hidden bg-gray-800">
          <Image
            className="w-full"
            src={nft.json?.image}
            alt={nft.json?.name}
          />
        </div>
        <div className="card ml-8 w-full flex flex-col justify-between p-6">
          <h2 className="heading-h4">{nft.name}</h2>
          <div className="mt-10">
            <h4 className="heading-h5">🖼️ Attributes</h4>
            <div className="mt-4 grid grid-cols-3 gap-6">
              {nft.json?.attributes?.map(({ trait_type, value }, id) => (
                <TraitCard
                  key={`${trait_type}-${value}`}
                  property={trait_type ?? ""}
                  value={value ?? ""}
                />
              ))}
            </div>
          </div>

          <Button
            loading={loading}
            onClick={() => handleBidding(nft)}
            size="lg"
            className="mt-10"
          >
            Place Offer
          </Button>
        </div>
      </div>
    </Modal>
  );
};
