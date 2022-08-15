import "@solana/wallet-adapter-react-ui/styles.css";
import "../styles/globals.css";
import { useMemo } from "react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";
import type { AppProps } from "next/app";
import { Layout } from "components/Layout";
import { AppToaster } from "components/Toast";
import { useRouter } from "next/router";
import { DefaultSeo } from "next-seo";
import { APP_NAME } from "constants/config";

const SEORender = () => {
  const { asPath } = useRouter();
  return (
    <DefaultSeo
      title={`${APP_NAME} | Swap your NFTs with other degens`}
      openGraph={{
        type: "website",
        locale: "en_EN",
        description:
          "The easiest way to swap your NFTs with other collectors and its totally free.",
        url: `${process.env.PAGE_ORIGIN}${asPath}`,
        site_name: APP_NAME,
        title: APP_NAME,
        images: [
          {
            width: 1200,
            height: 620,
            url: "https://og-image.vercel.app/NFTs%20**Swap**.png?theme=dark&md=1&fontSize=100px&images=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Ffront%2Fassets%2Fdesign%2Fhyper-bw-logo.svg",
          },
        ],
      }}
      twitter={{
        handle: "@nfts_swap",
        site: "nfts_swap",
        cardType: "summary",
      }}
      description="The easiest way to swap your NFTs with other collectors and its totally free."
    />
  );
};

function MyApp({ Component, pageProps }: AppProps) {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

  return (
    <ConnectionProvider endpoint={process.env.NEXT_PUBLIC_DEVNET!}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <Layout>
            <SEORender />
            <Component {...pageProps} />
            <AppToaster />
          </Layout>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default MyApp;
