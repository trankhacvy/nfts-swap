import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Link from "next/link";

const Links = [
  { text: "Explore", href: "/explore" },
  { text: "How it work", href: "/how-it-work" },
  { text: "Community", href: "/community" },
];

export const Header = () => {
  return (
    <header>
      <nav className="border-gray-200 px-2 sm:px-4 py-2.5">
        <div className="container flex flex-wrap justify-between items-center mx-auto">
          <Link href="/" passHref>
            <a className="flex items-center">
              <img
                src="/logo.png"
                className="mr-3 h-6 sm:h-9"
                alt="Swap logo"
              />
              <span className="self-center text-xl font-semibold whitespace-nowrap">
                Swap
              </span>
            </a>
          </Link>
          <button
            data-collapse-toggle="navbar-default"
            type="button"
            className="inline-flex items-center p-2 ml-3 text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
            aria-controls="navbar-default"
            aria-expanded="false"
          >
            <span className="sr-only">Open main menu</span>
            <svg
              className="w-6 h-6"
              aria-hidden="true"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          <div className="hidden w-full md:block md:w-auto" id="navbar-default">
            <ul className="flex flex-col p-4 mt-4 md:flex-row md:space-x-8 md:mt-0">
              {Links.map((link) => (
                <li key={link.text}>
                  <Link href={link.href} passHref>
                    <a className="block py-2 pr-4 pl-3 text-gray-500 hover:opacity-75">
                      {link.text}
                    </a>
                  </Link>
                </li>
              ))}
              <WalletMultiButton className="h-10 btn btn-solid" />
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
};
