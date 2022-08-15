import { Button } from "components/Button";
import { ListingCard, ListingCardSkeleton } from "components/ListingCard";
import { useListings } from "hooks/useListings";
import type { NextPage } from "next";
import { useRouter } from "next/router";

const Home: NextPage = () => {
  const { listings, isFirstLoading } = useListings();
  const { push } = useRouter();
  return (
    <div className="container mx-auto">
      <div className="max-w-3xl text-center mx-auto px-6 py-28 mb-16">
        <h1 className="heading-h1 mb-6">
          Swap your{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
            NFTs
          </span>{" "}
          with other degens
        </h1>
        <p className="max-w-md text-xl mx-auto mb-6 text-gray-500">
          The easiest way to swap your NFTs with other collectors and its
          totally free.
        </p>
        <div className="flex items-center justify-center space-x-4">
          <Button
            onClick={() => push("/new-listing")}
            className="min-w-[9rem]"
            size="lg"
          >
            List your NFT
          </Button>
          <Button className="min-w-[9rem]" variant="outline" size="lg">
            How to Swap?
          </Button>
        </div>
      </div>

      <div className="mb-40">
        <h2 className="heading-h2 mb-10">Hot deals 🔥</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {isFirstLoading
            ? Array.from({ length: 12 }).map((_, idx) => (
                <ListingCardSkeleton key={`skeleton-${idx}`} />
              ))
            : listings.map((item) => (
                <ListingCard key={item.id} listing={item} />
              ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
