import { PublicKey } from "@solana/web3.js";
import { PROGRAM_ID } from "constants/program";

export const getNftEscrowPDA = (mintPk: PublicKey) =>
  PublicKey.findProgramAddress(
    [Buffer.from("escrow"), mintPk.toBuffer()],
    PROGRAM_ID
  );

export const getNftEscrowTokenAccountPDA = (mintPk: PublicKey) =>
  PublicKey.findProgramAddress(
    [Buffer.from("escrow_token_account"), mintPk.toBuffer()],
    PROGRAM_ID
  );

export const getOfferNftEscrowPDA = (
  listingMint: PublicKey,
  bidderMint: PublicKey
) =>
  PublicKey.findProgramAddress(
    [Buffer.from("escrow"), listingMint.toBuffer(), bidderMint.toBuffer()],
    PROGRAM_ID
  );
