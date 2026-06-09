export type FutureCircleAgentWalletUseCase =
  | "delivery_verification_fee"
  | "x402_verification_endpoint"
  | "reputation_check"
  | "reminder_service"
  | "document_proof_validation";

export type FutureCircleAgentWalletPolicy = {
  allowedUseCases: FutureCircleAgentWalletUseCase[];
  escrowFundControlAllowed: false;
  requiresHumanWalletConfirmation: true;
};

export const futureCircleAgentWalletPolicy: FutureCircleAgentWalletPolicy = {
  allowedUseCases: [
    "delivery_verification_fee",
    "x402_verification_endpoint",
    "reputation_check",
    "reminder_service",
    "document_proof_validation",
  ],
  escrowFundControlAllowed: false,
  requiresHumanWalletConfirmation: true,
};

// Future-only placeholder:
// Circle Agent Wallets or x402 endpoints may later pay tiny verification fees,
// check reputation, validate documents, or send reminders.
// They must not release escrow, refund escrow, resolve disputes, select freelancers,
// or sign escrow transactions in this beginner version.
