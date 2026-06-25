# Page override — Post a Job (`/post`)

Inherits MASTER. Premium guided form. `/post` is canonical; `/post-job` is legacy (keep reachable, do not link).

- **Submit (preserve):** `writeContract({ functionName: 'postJob', args: [title, category, descriptionURI, BigInt(deadlineSeconds)], value })` — `postJob` is **payable**; escrow funded by `value`. Date deadline → `T23:59:59`.
- **Validation (preserve):** connected wallet, Arc Testnet chain, escrow configured, non-empty title/category/descriptionURI, future deadline, amount > 0.
- **Layout:** two-column — guided form (FormFieldGroup: label/helper/required/error) on the left, sticky sidebar on the right with `WalletStatusCard`, a **live listing preview** mirroring the marketplace card, and "How escrow protects you" steps.
- **States:** `TxStatus` stepper for pending → success → error; "Connect wallet" notice; empty placeholders read "Not set" (never em-dash). Disabled submit while busy.
- Category should ideally be a select/typeahead matching marketplace categories.
