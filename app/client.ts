import { PublicClient, testnet } from "@lens-protocol/client";
import { storage } from "./storage";

export const client = PublicClient.create({
  environment: testnet,
  storage: storage
}); 