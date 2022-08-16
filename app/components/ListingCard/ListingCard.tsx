import Link from "next/link";
import { Listings } from "types/schema";
import truncate from "utils/truncate";
import { Skeleton } from "components/Skeleton";
import { Image } from "components/Image";

type ListingCardProps = {
  listing: Listings;
};

export const ListingCard = ({ listing }: ListingCardProps) => {
  return (
    <Link href={`/item-details/${listing.mint}`}>
      <a>
        <div className="card transition duration-500 p-6 hover:scale-105 hover:shadow-z8">
          <div className="w-full rounded-2xl overflow-hidden">
            <Image className="w-full" src={listing.image} alt={listing?.name} />
          </div>
          <div className="pt-5">
            {listing.collection_address && (
              <p className="text-caption text-secondary">
                {listing.collection_name}
              </p>
            )}
            <h2 className="heading-h6 mb-1">{listing.name}</h2>
            <p className="text-body3 text-gray-500">
              By{" "}
              <span className="font-semibold">
                {truncate(listing.initializer, 8, true)}
              </span>
            </p>
          </div>
        </div>
      </a>
    </Link>
  );
};

export const ListingCardSkeleton = () => {
  return (
    <div className="bg-gray-60 overflow-hidden">
      <Skeleton className="aspect-square rounded-xl" />
      <div className="p-4">
        <Skeleton className="w-3/4 h-8 rounded-lg mb-3" />
        <Skeleton className="w-1/2 h-5 rounded-lg" />
      </div>
    </div>
  );
};
