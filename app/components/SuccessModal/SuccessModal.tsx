import { Button } from "components/Button";
import { Modal } from "components/Modal";
import { Image } from "components/Image";
import { Offer } from "types/schema";
import Link from "next/link";

interface SuccessModalProps {
  offer: Offer;
  tx: string;
  isOpen: boolean;
  onClose: VoidFunction;
}

export const SuccessModal = ({
  offer,
  tx,
  isOpen,
  onClose,
}: SuccessModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-full bg-gray-800 text-center rounded-2xl relative z-10 max-w-3xl p-8">
        <h2 className="heading-h3 text-primary mb-1">Congratulation 🎉🎉</h2>
        <p className="text-body1 mb-10">You&apos;ve received new NFT</p>
        <div className="max-w-md mx-auto rounded-2xl overflow-hidden mb-10">
          <Image className="w-full" src={offer?.image} alt={offer?.name} />
        </div>
        <a
          href={`https://explorer.solana.com/tx/${tx}?cluster=devnet`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <p className="text-body1 underline mb-4">Check Transaction</p>
        </a>
        <Link href="/">
          <Button>Go Home</Button>
        </Link>
      </div>
    </Modal>
  );
};
