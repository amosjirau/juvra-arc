# JuvraEscrow Contracts

USDC-native escrow for Juvra on Arc Testnet. Clients fund jobs, freelancers
deliver, and settlement is verdict-gated: the client records an approve/reject
verdict on-chain (`recordVerdict`), then the agent settler executes
`agentSettle`, which the contract only allows in the direction of that verdict
(release on approve, refund on reject). Either party can also execute a
recorded verdict themselves, and disputes remain resolved by the human
arbitrator.

## Deploy

```shell
export ARBITRATOR_ADDRESS=0x...   # human arbitrator (defaults to broadcaster)
export AGENT_SETTLER_ADDRESS=0x...  # the agent wallet's address (defaults to broadcaster)
forge script script/Deploy.s.sol --rpc-url arc_testnet --broadcast --private-key $PRIVATE_KEY
```

After deploying, set `NEXT_PUBLIC_JUVRA_ESCROW_ADDRESS` in `frontend/.env.local`
and make sure `AGENT_WALLET_PRIVATE_KEY` corresponds to `AGENT_SETTLER_ADDRESS`.

---

## Foundry

**Foundry is a blazing fast, portable and modular toolkit for Ethereum application development written in Rust.**

Foundry consists of:

- **Forge**: Ethereum testing framework (like Truffle, Hardhat and DappTools).
- **Cast**: Swiss army knife for interacting with EVM smart contracts, sending transactions and getting chain data.
- **Anvil**: Local Ethereum node, akin to Ganache, Hardhat Network.
- **Chisel**: Fast, utilitarian, and verbose solidity REPL.

## Documentation

https://book.getfoundry.sh/

## Usage

### Build

```shell
$ forge build
```

### Test

```shell
$ forge test
```

### Format

```shell
$ forge fmt
```

### Gas Snapshots

```shell
$ forge snapshot
```

### Anvil

```shell
$ anvil
```

### Deploy

```shell
$ forge script script/Counter.s.sol:CounterScript --rpc-url <your_rpc_url> --private-key <your_private_key>
```

### Cast

```shell
$ cast <subcommand>
```

### Help

```shell
$ forge --help
$ anvil --help
$ cast --help
```
