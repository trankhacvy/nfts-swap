import { AnchorProvider, Program } from "@project-serum/anchor";
import { PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
} from "@solana/spl-token";
import { NftSwap } from 'types/program_schema';
import idl from 'types/idl.json';
import { PROGRAM_ID } from "constants/program";
import {
  getNftEscrowPDA,
  getNftEscrowTokenAccountPDA,
  getOfferNftEscrowPDA,
} from "./pda";

export class ExchangeProgram {
  program: Program<NftSwap>;
  provider: AnchorProvider;

  constructor(provider: AnchorProvider) {
    this.provider = provider;
    this.program = new Program<NftSwap>(idl as any, PROGRAM_ID, provider);
  }

  async createListing(mintPk: PublicKey) {
    const initializerAta = await getAssociatedTokenAddress(
      mintPk,
      this.provider.wallet.publicKey
    );

    const [nftEscrowPDA] = await getNftEscrowPDA(mintPk);
    const [nftEscrowTokenAccountPDA] = await getNftEscrowTokenAccountPDA(
      mintPk
    );

    return this.program.methods
      .createListing()
      .accounts({
        initializer: this.provider.wallet.publicKey,
        initializerNftMint: mintPk,
        initializerNftTokenAccount: initializerAta,
        nftEscrow: nftEscrowPDA,
        nftEscrowTokenAccount: nftEscrowTokenAccountPDA,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY,
      })
      .rpc();
  }

  async cancelListing(mintPk: PublicKey) {
    const initializerAta = await getAssociatedTokenAddress(
      mintPk,
      this.provider.wallet.publicKey
    );

    const [nftEscrowPDA] = await getNftEscrowPDA(mintPk);
    const [nftEscrowTokenAccountPDA] = await getNftEscrowTokenAccountPDA(
      mintPk
    );

    return this.program.methods
      .closeListing()
      .accounts({
        initializer: this.provider.wallet.publicKey,
        initializerNftMint: mintPk,
        initializerNftTokenAccount: initializerAta,
        nftEscrow: nftEscrowPDA,
        nftEscrowTokenAccount: nftEscrowTokenAccountPDA,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();
  }

  async createOffer(mintPk: PublicKey, listingMintPk: PublicKey) {
    const bidderAta = await getAssociatedTokenAddress(
      mintPk,
      this.provider.wallet.publicKey
    );

    const [nftListingEscrowPDA] = await getNftEscrowPDA(listingMintPk);

    const [nftOfferEscrowPDA] = await getOfferNftEscrowPDA(
      listingMintPk,
      mintPk
    );
    const [nftOfferEscrowTokenAccountPDA] = await getNftEscrowTokenAccountPDA(
      mintPk
    );

    return this.program.methods
      .createOffer()
      .accounts({
        bidder: this.provider.wallet.publicKey,
        bidderNftMint: mintPk,
        bidderNftTokenAccount: bidderAta,
        initializerNftMint: listingMintPk,
        listingEscrow: nftListingEscrowPDA,
        nftOfferEscrow: nftOfferEscrowPDA,
        nftEscrowTokenAccount: nftOfferEscrowTokenAccountPDA,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY,
      })
      .rpc();
  }

  async cancelOffer(offerMintPk: PublicKey, listingMintPk: PublicKey) {
    const bidderAta = await getAssociatedTokenAddress(
      offerMintPk,
      this.provider.wallet.publicKey
    );

    const [nftOfferEscrowPDA] = await getOfferNftEscrowPDA(
      listingMintPk,
      offerMintPk
    );
    const [nftOfferEscrowTokenAccountPDA] = await getNftEscrowTokenAccountPDA(
      offerMintPk
    );

    return this.program.methods
      .cancelOffer()
      .accounts({
        bidder: this.provider.wallet.publicKey,
        bidderNftMint: offerMintPk,
        bidderNftTokenAccount: bidderAta,
        initializerNftMint: listingMintPk,
        nftOfferEscrow: nftOfferEscrowPDA,
        nftEscrowTokenAccount: nftOfferEscrowTokenAccountPDA,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();
  }

  async acceptOffer(
    listingMintPk: PublicKey,
    offerMintPk: PublicKey,
    bidder: PublicKey
  ) {
    const [nftListingEscrowPDA] = await getNftEscrowPDA(listingMintPk);
    const [nftListingEscrowTokenAccountPDA] = await getNftEscrowTokenAccountPDA(
      listingMintPk
    );

    const [nftOfferEscrowPDA] = await getOfferNftEscrowPDA(
      listingMintPk,
      offerMintPk
    );
    const [nftOfferEscrowTokenAccountPDA] = await getNftEscrowTokenAccountPDA(
      offerMintPk
    );

    const bidderAta = await getAssociatedTokenAddress(
      offerMintPk,
      this.provider.wallet.publicKey
    );

    const initializerReceiveAta = await getAssociatedTokenAddress(
      offerMintPk,
      this.provider.wallet.publicKey
    );

    const bidderReceiveAta = await getAssociatedTokenAddress(
      listingMintPk,
      bidder
    );

    return this.program.methods
      .acceptOffer()
      .accounts({
        initializer: this.provider.wallet.publicKey,
        initializerNftMint: listingMintPk,
        nftListingEscrow: nftListingEscrowPDA,
        nftListingEscrowTokenAccount: nftListingEscrowTokenAccountPDA,
        bidderNftMint: offerMintPk,
        nftOfferEscrow: nftOfferEscrowPDA,
        nftOfferEscrowTokenAccount: nftOfferEscrowTokenAccountPDA,

        initializerReceiveNftTokenAccount: initializerReceiveAta,
        bidderReceiveNftTokenAccount: bidderReceiveAta,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .preInstructions([
        createAssociatedTokenAccountInstruction(
          this.provider.wallet.publicKey,
          initializerReceiveAta,
          this.provider.wallet.publicKey,
          offerMintPk
        ),
        createAssociatedTokenAccountInstruction(
          this.provider.wallet.publicKey,
          bidderReceiveAta,
          bidder,
          listingMintPk
        ),
      ])
      .rpc();
  }
}
