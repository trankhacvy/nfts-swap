import { useWallet } from "@solana/wallet-adapter-react";
import { ParsedQuery } from "query-string";
import { Button } from "components/Button";
import truncate from "utils/truncate";
import toast from "react-hot-toast";
import { useListingDetails } from "hooks/useListingDetails";
import type { GetStaticPropsContext } from "next";
import { useRouter } from "next/router";
import { OfferCard } from "components/OfferCard";
import { Skeleton } from "components/Skeleton";
import { TraitCard } from "components/TraitCard";
import { Image } from "components/Image";
import { useAnchorProvider } from "hooks/useProvider";
import { useState } from "react";
import { ExchangeProgram } from "libs/program";
import { ListingsRepository } from "libs/db";
import { Listings } from "types/schema";
import { PublicKey } from "@solana/web3.js";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { NextSeo } from "next-seo";
import { APP_NAME } from "constants/config";

type ItemDetailsProps = {
  listing: Listings;
};

const ItemDetails = ({ listing: preloadListing }: ItemDetailsProps) => {
  const {
    push,
    query: { address },
    asPath,
  } = useRouter();
  const { listing, isFirstLoading, mutate } = useListingDetails(
    address as string
  );

  const offers = listing?.offers ?? [];

  const { connected, publicKey } = useWallet();
  const isOwner = connected && publicKey?.toBase58() === listing?.initializer;
  const isNotOwner =
    connected && publicKey?.toBase58() !== listing?.initializer;
  const isDone = !!listing?.accepted_offer;

  return (
    <div className="max-w-screen-xl mx-auto pt-20 pb-40">
      <NextSeo
        title={preloadListing?.name}
        titleTemplate={`%s | ${APP_NAME}`}
        openGraph={{
          title: preloadListing?.name,
          description: [
            `Collection: ${preloadListing?.collection_name ?? "--"} ✔`,
            "\n",
            "Attributes:",
            (preloadListing?.attributes ?? [])
              .map(({ trait_type, value }) => `${trait_type}: ${value}`)
              .join("\n"),
          ]
            .filter(Boolean)
            .join("\n"),
          images: [
            {
              width: 400,
              height: 400,
              url: preloadListing?.image ?? "",
            },
          ],
        }}
      />
      {isFirstLoading || !listing ? (
        <ItemDetailSkeleton />
      ) : (
        <>
          <div className="w-full flex mb-20">
            <div className="w-1/2 px-4">
              <div className="rounded-3xl overflow-hidden">
                <Image
                  className="w-full"
                  src={listing?.image}
                  alt={listing?.name}
                />
              </div>
            </div>
            <div className="w-1/2 px-4">
              <div className="flex items-center space-x-2">
                <h2 className="heading-h3 mb-1">{listing?.name}</h2>
                {isDone && (
                  <span className="px-2 py-1 text-body2 font-semibold rounded-xl bg-green-500">
                    Offer Accepted
                  </span>
                )}
              </div>
              {listing?.initializer && (
                <p className="text-body1 text-gray-500">
                  Owner:{" "}
                  <span className="font-semibold text-primary">
                    {truncate(listing?.initializer, 8, true)}
                  </span>
                </p>
              )}
              <div className="mt-10">
                <h4 className="heading-h4">🖼️ Attributes</h4>
                <div className="mt-4 grid grid-cols-3 gap-6">
                  {listing?.attributes?.map(({ trait_type, value }) => (
                    <TraitCard
                      key={`${trait_type}-${value}`}
                      property={trait_type}
                      value={value}
                    />
                  ))}
                </div>
              </div>
              <div className="mt-10">
                <CancelButton isOwner={isOwner} listing={listing} />
                {isNotOwner && !isDone && (
                  <Button
                    onClick={() => push(`${asPath}/make-offer`)}
                    className="w-full"
                    size="lg"
                  >
                    Place Offer
                  </Button>
                )}
                {!connected && (
                  <WalletMultiButton className="h-10 w-full btn btn-solid" />
                )}
              </div>
            </div>
          </div>
          <div>
            <h3 className="mb-4 heading-h4">
              {" "}
              {offers.length === 0 ? "No offer yet 😒." : "Offers"}
            </h3>
            <div className="w-full flex flex-nowrap overflow-x-auto space-x-6">
              {offers.map((offer) => (
                <OfferCard
                  key={offer.id}
                  offer={offer}
                  listing={listing}
                  className="w-[24%] flex-shrink-0 "
                  onCancelCompleted={mutate}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

type CancelButtonProps = {
  listing: Listings;
  isOwner: boolean;
};

const CancelButton = ({ listing, isOwner }: CancelButtonProps) => {
  const { push } = useRouter();
  const [loading, setLoading] = useState(false);
  const provider = useAnchorProvider();
  const { publicKey } = useWallet();

  const cancelListing = async (listing: Listings) => {
    try {
      if (!provider || !publicKey) return;
      const program = new ExchangeProgram(provider);
      const repo = new ListingsRepository();
      setLoading(true);
      await program.cancelListing(new PublicKey(listing.mint));
      await repo.delete(listing.id);
      toast.success("Your listing has been cancelled.");
      push("/");
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      toast.error(error.message);
    }
  };

  if (!isOwner || !!listing.accepted_offer) return null;

  return (
    <Button
      loading={loading}
      onClick={() => cancelListing(listing)}
      className="w-full"
      size="lg"
    >
      Cancel Listing
    </Button>
  );
};

const ItemDetailSkeleton = () => {
  return (
    <>
      <div className="w-full flex mb-20">
        <div className="w-1/2 px-4">
          <Skeleton className="aspect-square rounded-3xl" />
        </div>
        <div className="w-1/2 px-4">
          <Skeleton className="w-3/4 h-8 rounded-xl mb-3" />
          <Skeleton className="w-1/2 h-5 rounded-xl" />
        </div>
      </div>
    </>
  );
};

export async function getStaticPaths() {
  try {
    if (process.env.SKIP_BUILD_STATIC_GENERATION) {
      return {
        paths: [],
        fallback: "blocking",
      };
    }
    const repo = new ListingsRepository();
    const listings = await repo.findAll();
    const paths = listings.map((listing) => ({
      params: { address: listing.id },
    }));

    return {
      paths,
      fallback: true,
    };
  } catch (error) {
    return {
      paths: [],
      fallback: true,
    };
  }
}

export async function getStaticProps(context: GetStaticPropsContext) {
  try {
    const { address } = context.params as ParsedQuery;
    if (address) {
      const repo = new ListingsRepository();
      const listing = await repo.findByMint(address as string);
      return {
        props: {
          listing,
        },
        revalidate: 60,
      };
    }
    throw new Error("Page Not Found");
  } catch (error) {
    return {
      notFound: true,
    };
  }
}

export default ItemDetails;
