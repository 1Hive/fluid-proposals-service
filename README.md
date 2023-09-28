## Fluid Proposals Service

> **Deprecated:** 1Hive services were migrated to our [cron](https://github.com/1Hive/cron) repository.

A small service that calls the sync method of the [FluidProposals](https://github.com/BlossomLabs/fluid-proposals) contract periodically.

## Running

Clone the repository and install the dependencies.

The service is configured using environment variables that you need to supply when you run `npm start`.

### Configuration

- `ETH_URI`: The Ethereum node to connect ot.
- `CONTRACT_ADDRESS`: The FluidProposals contract address.
- `MNEMONIC`: The mnemonic for the private key the bot should use when sending transactions.
- `INTERVAL`: The interval at which the service will check if it can update the oracle, and if so, do it. Defaults to 1 hour.
