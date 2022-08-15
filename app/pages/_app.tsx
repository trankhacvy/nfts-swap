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
        url: `${process.env.NEXT_PUBLIC_SERVER_HOST}${asPath}`,
        site_name: APP_NAME,
        title: APP_NAME,
        images: [
          {
            width: 1200,
            height: 620,
            url: `${process.env.NEXT_PUBLIC_SERVER_HOST}/og-image.png`,
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
