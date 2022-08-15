import * as anchor from "@project-serum/anchor";
import { assert } from "chai";
import { Program } from "@project-serum/anchor";
import {
  SystemProgram,
  PublicKey,
  Keypair,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { NftSwap } from "../target/types/nft_swap";
import { MINT_SIZE } from "@solana/spl-token";
import {
  getMinimumBalanceForRentExemptMint,
  createInitializeMintInstruction,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
  createMintToCheckedInstruction,
  getAccount,
} from "@solana/spl-token";

describe("nft-swap", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.NftSwap as Program<NftSwap>;

  const initializerMintKP = Keypair.generate();
  const bidderMintKP = Keypair.generate();
  const bidderWallet = Keypair.generate();

  console.log("initializerMintKP ", initializerMintKP.publicKey.toBase58());
  console.log("bidderWallet ", bidderWallet.publicKey.toBase58());
  console.log("bidderMintKP ", bidderMintKP.publicKey.toBase58());

  before(async () => {
    const airdropSignature = await provider.connection.requestAirdrop(
      bidderWallet.publicKey,
      LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(airdropSignature);
  });

  it("create listing", async () => {
    const [nftEscrowPDA] = await PublicKey.findProgramAddress(
      [Buffer.from("escrow"), initializerMintKP.publicKey.toBuffer()],
      program.programId
    );

    const [nftEscrowTokenAccountPDA] = await PublicKey.findProgramAddress(
      [
        Buffer.from("escrow_token_account"),
        initializerMintKP.publicKey.toBuffer(),
      ],
      program.programId
    );

    const initializerAta = await getAssociatedTokenAddress(
      initializerMintKP.publicKey,
      provider.wallet.publicKey
    );

    try {
      await program.methods
        .createListing()
        .accounts({
          initializer: provider.wallet.publicKey,
          initializerNftMint: initializerMintKP.publicKey,
          initializerNftTokenAccount: initializerAta,
          nftEscrow: nftEscrowPDA,
          nftEscrowTokenAccount: nftEscrowTokenAccountPDA,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        })
        .preInstructions([
          SystemProgram.createAccount({
            fromPubkey: provider.wallet.publicKey,
            newAccountPubkey: initializerMintKP.publicKey,
            space: MINT_SIZE,
            lamports: await getMinimumBalanceForRentExemptMint(
              provider.connection
            ),
            programId: TOKEN_PROGRAM_ID,
          }),
          createInitializeMintInstruction(
            initializerMintKP.publicKey,
            0,
            provider.wallet.publicKey,
            null
          ),
          createAssociatedTokenAccountInstruction(
            provider.wallet.publicKey,
            initializerAta,
            provider.wallet.publicKey,
            initializerMintKP.publicKey
          ),
          createMintToCheckedInstruction(
            initializerMintKP.publicKey,
            initializerAta,
            provider.wallet.publicKey,
            1,
            0
          ),
        ])
        .signers([initializerMintKP])
        .rpc();
    } catch (error) {
      console.error(error);
    }

    const nftEscrowTokenAccount = await getAccount(
      provider.connection,
      nftEscrowTokenAccountPDA
    );
    assert.strictEqual(nftEscrowTokenAccount.amount.toString(), "1");
  });

  it("create offer", async () => {
    // create nft
    const [nftListingEscrowPDA] = await PublicKey.findProgramAddress(
      [Buffer.from("escrow"), initializerMintKP.publicKey.toBuffer()],
      program.programId
    );

    const [nftOfferEscrowPDA] = await PublicKey.findProgramAddress(
      [
        Buffer.from("escrow"),
        initializerMintKP.publicKey.toBuffer(),
        bidderMintKP.publicKey.toBuffer(),
      ],
      program.programId
    );

    const [nftEscrowTokenAccountPDA] = await PublicKey.findProgramAddress(
      [Buffer.from("escrow_token_account"), bidderMintKP.publicKey.toBuffer()],
      program.programId
    );

    const bidderAta = await getAssociatedTokenAddress(
      bidderMintKP.publicKey,
      bidderWallet.publicKey
    );

    try {
      await program.methods
        .createOffer()
        .accounts({
          bidder: bidderWallet.publicKey,
          bidderNftMint: bidderMintKP.publicKey,
          bidderNftTokenAccount: bidderAta,
          initializerNftMint: initializerMintKP.publicKey,
          listingEscrow: nftListingEscrowPDA,
          nftOfferEscrow: nftOfferEscrowPDA,
          nftEscrowTokenAccount: nftEscrowTokenAccountPDA,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        })
        .preInstructions([
          SystemProgram.createAccount({
            fromPubkey: bidderWallet.publicKey,
            newAccountPubkey: bidderMintKP.publicKey,
            space: MINT_SIZE,
            lamports: await getMinimumBalanceForRentExemptMint(
              provider.connection
            ),
            programId: TOKEN_PROGRAM_ID,
          }),
          createInitializeMintInstruction(
            bidderMintKP.publicKey,
            0,
            bidderWallet.publicKey,
            null
          ),
          createAssociatedTokenAccountInstruction(
            bidderWallet.publicKey,
            bidderAta,
            bidderWallet.publicKey,
            bidderMintKP.publicKey
          ),
          createMintToCheckedInstruction(
            bidderMintKP.publicKey,
            bidderAta,
            bidderWallet.publicKey,
            1,
            0
          ),
        ])
        .signers([bidderWallet, bidderMintKP])
        .rpc();
    } catch (error) {
      console.error(error);
    }

    const nftEscrowTokenAccount = await getAccount(
      provider.connection,
      nftEscrowTokenAccountPDA
    );
    assert.strictEqual(nftEscrowTokenAccount.amount.toString(), "1");
  });

  it("Accept offer", async () => {
    const [nftListingEscrowPDA] = await PublicKey.findProgramAddress(
      [Buffer.from("escrow"), initializerMintKP.publicKey.toBuffer()],
      program.programId
    );

    const [nftListingEscrowTokenAccountPDA] =
      await PublicKey.findProgramAddress(
        [
          Buffer.from("escrow_token_account"),
          initializerMintKP.publicKey.toBuffer(),
        ],
        program.programId
      );

    const [nftOfferEscrowPDA] = await PublicKey.findProgramAddress(
      [
        Buffer.from("escrow"),
        initializerMintKP.publicKey.toBuffer(),
        bidderMintKP.publicKey.toBuffer(),
      ],
      program.programId
    );

    const [nftOfferEscrowTokenAccountPDA] = await PublicKey.findProgramAddress(
      [Buffer.from("escrow_token_account"), bidderMintKP.publicKey.toBuffer()],
      program.programId
    );

    const bidderReceiveAta = await getAssociatedTokenAddress(
      initializerMintKP.publicKey,
      bidderWallet.publicKey
    );

    const initializerReceiveAta = await getAssociatedTokenAddress(
      bidderMintKP.publicKey,
      provider.wallet.publicKey
    );

    try {
      await program.methods
        .acceptOffer()
        .accounts({
          initializer: provider.wallet.publicKey,
          initializerNftMint: initializerMintKP.publicKey,
          nftListingEscrow: nftListingEscrowPDA,
          nftListingEscrowTokenAccount: nftListingEscrowTokenAccountPDA,
          bidderNftMint: bidderMintKP.publicKey,
          nftOfferEscrow: nftOfferEscrowPDA,
          nftOfferEscrowTokenAccount: nftOfferEscrowTokenAccountPDA,
          initializerReceiveNftTokenAccount: initializerReceiveAta,
          bidderReceiveNftTokenAccount: bidderReceiveAta,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .preInstructions([
          createAssociatedTokenAccountInstruction(
            provider.wallet.publicKey,
            initializerReceiveAta,
            provider.wallet.publicKey,
            bidderMintKP.publicKey
          ),
          createAssociatedTokenAccountInstruction(
            provider.wallet.publicKey,
            bidderReceiveAta,
            bidderWallet.publicKey,
            initializerMintKP.publicKey
          ),
        ])
        .rpc();

      const receicerTokenAccount = await getAccount(
        provider.connection,
        bidderReceiveAta
      );

      console.log(
        "receicerTokenAccount amount",
        receicerTokenAccount.amount.toString()
      );
      console.log(
        "receicerTokenAccount mint",
        receicerTokenAccount.mint.toBase58()
      );
      console.log(
        "receicerTokenAccount owner",
        receicerTokenAccount.owner.toBase58()
      );
    } catch (error) {
      console.error(error);
    }
  });

  it.skip("create listing then close", async () => {
    const startBal = await getSolBalance(provider, provider.wallet.publicKey);
    console.log("start balance", formatNumber(lamportToSol(startBal)));

    const [nftEscrowPDA] = await PublicKey.findProgramAddress(
      [Buffer.from("escrow"), initializerMintKP.publicKey.toBuffer()],
      program.programId
    );

    const [nftEscrowTokenAccountPDA] = await PublicKey.findProgramAddress(
      [
        Buffer.from("escrow_token_account"),
        initializerMintKP.publicKey.toBuffer(),
      ],
      program.programId
    );

    const initializerAta = await getAssociatedTokenAddress(
      initializerMintKP.publicKey,
      provider.wallet.publicKey
    );

    try {
      await program.methods
        .createListing()
        .accounts({
          initializer: provider.wallet.publicKey,
          initializerNftMint: initializerMintKP.publicKey,
          initializerNftTokenAccount: initializerAta,
          nftEscrow: nftEscrowPDA,
          nftEscrowTokenAccount: nftEscrowTokenAccountPDA,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        })
        .preInstructions([
          SystemProgram.createAccount({
            fromPubkey: provider.wallet.publicKey,
            newAccountPubkey: initializerMintKP.publicKey,
            space: MINT_SIZE,
            lamports: await getMinimumBalanceForRentExemptMint(
              provider.connection
            ),
            programId: TOKEN_PROGRAM_ID,
          }),
          createInitializeMintInstruction(
            initializerMintKP.publicKey,
            0,
            provider.wallet.publicKey,
            null
          ),
          createAssociatedTokenAccountInstruction(
            provider.wallet.publicKey,
            initializerAta,
            provider.wallet.publicKey,
            initializerMintKP.publicKey
          ),
          createMintToCheckedInstruction(
            initializerMintKP.publicKey,
            initializerAta,
            provider.wallet.publicKey,
            1,
            0
          ),
        ])
        .signers([initializerMintKP])
        .rpc();
    } catch (error) {
      console.error(error);
    }

    let endBal = await getSolBalance(provider, provider.wallet.publicKey);
    console.log("end balance", formatNumber(lamportToSol(endBal)));
    let spending = startBal - endBal;
    console.log("spending", formatNumber(lamportToSol(spending)));

    try {
      await program.methods
        .cancelListing()
        .accounts({
          initializer: provider.wallet.publicKey,
          initializerNftMint: initializerMintKP.publicKey,
          initializerNftTokenAccount: initializerAta,
          nftEscrow: nftEscrowPDA,
          nftEscrowTokenAccount: nftEscrowTokenAccountPDA,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();
    } catch (error) {
      console.error(error);
    }
    console.log("close success");

    endBal = await getSolBalance(provider, provider.wallet.publicKey);
    console.log("end balance", formatNumber(lamportToSol(endBal)));
    spending = startBal - endBal;
    console.log("spending", formatNumber(lamportToSol(spending)));

    try {
      await program.methods
        .createListing()
        .accounts({
          initializer: provider.wallet.publicKey,
          initializerNftMint: initializerMintKP.publicKey,
          initializerNftTokenAccount: initializerAta,
          nftEscrow: nftEscrowPDA,
          nftEscrowTokenAccount: nftEscrowTokenAccountPDA,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        })
        .rpc();
    } catch (error) {
      console.error(error);
    }
  });
});

export function formatNumber(number: number) {
  return Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 9,
  }).format(number);
}

async function getSolBalance(provider: anchor.AnchorProvider, key: PublicKey) {
  const bal = await provider.connection.getBalance(key);
  return bal;
}

function lamportToSol(lamports: number) {
  return lamports / 10 ** 9;
}
