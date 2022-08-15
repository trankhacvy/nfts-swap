import cx from "classnames";
import truncate from "utils/truncate";
import { Listings, Offer } from "types/schema";
import toast from "react-hot-toast";
import { PublicKey } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { Button } from "components/Button";
import { useAnchorProvider } from "hooks/useProvider";
import { ExchangeProgram } from "libs/program";
import { ListingsRepository, OffersRepository } from "libs/db";
import { useState } from "react";
import { Image } from "components/Image";
import { SuccessModal } from "components/SuccessModal";
import { useRouter } from "next/router";

type OfferCardProps = {
  className?: string;
  offer: Offer;
  listing: Listings;
  onCancelCompleted: VoidFunction;
};

export const OfferCard = ({
  offer,
  listing,
  className,
  onCancelCompleted,
}: OfferCardProps) => {
  const [loading, setLoading] = useState(false);
  const [tx, setTx] = useState("");
  const [success, setSuccess] = useState(false);
  const { replace } = useRouter();
  const { connected, publicKey } = useWallet();
  const provider = useAnchorProvider();
  const isDone = !!listing.accepted_offer;

  const isInitializer =
    connected && publicKey && publicKey.toBase58() === listing.initializer;

  const isBidder =
    connected && publicKey && publicKey.toBase58() === offer.bidder;

  const cancelOffer = async () => {
    try {
      if (!provider || !publicKey) return;
      const program = new ExchangeProgram(provider);
      const repo = new OffersRepository();
      setLoading(true);
      await program.cancelOffer(
        new PublicKey(offer.mint),
        new PublicKey(offer.listing_id)
      );
      await repo.delete(offer.id);
      toast.success("Your offer has been cancelled.");
      onCancelCompleted();
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      toast.error(error.message);
    }
  };

  const acceptOffer = async () => {
    try {
      if (!provider || !publicKey) return;
      const program = new ExchangeProgram(provider);
      const listingRepo = new ListingsRepository();
      const offerRepo = new OffersRepository();
      setLoading(true);
      const tx = await program.acceptOffer(
        new PublicKey(offer.listing_id),
        new PublicKey(offer.mint),
        new PublicKey(offer.bidder)
      );
      setTx(tx);
      await listingRepo.update(listing.id, {
        accepted_offer: offer.id,
      });
      await offerRepo.update(offer.id, {
        accepted: true,
      });
      onCancelCompleted();
      setSuccess(true);
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      toast.error(error.message);
    }
  };

  return (
    <div
      className={cx(
        "card overflow-hidden transition duration-500 p-5",
        className
      )}
    >
      <div className="bg-gray-500 rounded-xl overflow-hidden">
        <Image src={offer.image} alt={offer.name} />
      </div>
      <div className="pt-5">
        <h4 className="text-body1 font-semibold mb-1">{offer.name}</h4>
        <div className="flex items-center justify-between">
          <p className="text-body3 text-gray-500">
            By:{" "}
            <span className="font-semibold">
              {truncate(offer.bidder, 8, true)}
            </span>
          </p>
          {offer.accepted && (
            <span className="px-2 py-1 text-caption font-semibold rounded-xl bg-green-500">
              Accepted
            </span>
          )}
        </div>
        {isBidder && !offer.accepted && (
          <Button className="mt-3" loading={loading} onClick={cancelOffer}>
            Cancel Offer
          </Button>
        )}
        {isInitializer && !isDone && (
          <Button className="mt-3" loading={loading} onClick={acceptOffer}>
            Accept Offer
          </Button>
        )}
      </div>
      <SuccessModal
        offer={offer}
        isOpen={success}
        onClose={() => {
          setSuccess(false);
          replace("/");
          onCancelCompleted();
        }}
        tx={tx}
      />
    </div>
  );
};
