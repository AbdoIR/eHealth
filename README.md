# HealthRecords — Blockchain-Based Medical Records

A decentralized health records management system built on Ethereum. A Solidity smart contract handles doctor authorization, patient consent, and encrypted medical visit storage.

## Project Structure

```
Blockchain/          # Truffle project (smart contract)
  contracts/         # Solidity source (HealthRecords.sol)
  migrations/        # Deployment scripts
  test/              # JavaScript tests
  truffle-config.js  # Network configuration (Ganache on port 7545)
```

## Smart Contract — `HealthRecords.sol`

**Roles:**

- **Owner** — deploys the contract; can add/remove doctors.
- **Doctor** — authorized addresses that can add medical visits for consenting patients.
- **Patient** — any address that grants/revokes consent to doctors and views their own history.

**Functions:**

| Function                             | Access                     | Description                                 |
| ------------------------------------ | -------------------------- | ------------------------------------------- |
| `addDoctor(address)`                 | Owner                      | Authorize a new doctor                      |
| `removeDoctor(address)`              | Owner                      | Revoke doctor authorization                 |
| `grantConsent(address)`              | Patient                    | Allow a doctor to add visits                |
| `revokeConsent(address)`             | Patient                    | Remove a doctor's access                    |
| `addVisit(address, bytes)`           | Doctor                     | Record an encrypted visit for a patient     |
| `getHistory(address, offset, limit)` | Patient / Consented Doctor | Paginated visit history                     |
| `getVisitCount(address)`             | Patient / Consented Doctor | Total number of visits                      |
| `isDoctor(address)`                  | Anyone                     | Check if an address is an authorized doctor |
| `patientConsent(address, address)`   | Anyone                     | Check consent between a patient and doctor  |

## Prerequisites

- [Node.js](https://nodejs.org/) (v16+)
- [Truffle](https://trufflesuite.com/) — `npm install -g truffle`
- [Ganache](https://trufflesuite.com/ganache/) — local Ethereum blockchain (port 7545)

## Getting Started

### 1. Start Ganache

Open Ganache and ensure it runs on `http://127.0.0.1:7545`.

### 2. Deploy the Contract

```bash
cd Blockchain
npm install          # if needed
truffle migrate --network development
```

Note the deployed contract address from the output.

### 3. Run Tests

```bash
cd Blockchain
truffle test
```

## License

MIT
