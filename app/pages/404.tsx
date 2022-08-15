import { Button } from "components/Button";
import Link from "next/link";

const FourOFour = () => {
  return (
    <div className="flex items-center justify-center px-5 py-40">
      <div className="max-w-lg mx-auto text-center">
        <h3 className="heading-h4 mb-3">Page Not Found</h3>
        <p className="text-body2 text-gray-500 mb-10">
          Sorry, we couldn’t find the page you’re looking for. Perhaps you’ve
          mistyped the URL? Be sure to check your spelling.
        </p>
        <Link href="/" passHref>
          <Button>Go To Home</Button>
        </Link>
      </div>
    </div>
  );
};

export default FourOFour;
