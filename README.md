# MedDesk — Blockchain-Based Medical Records

A decentralized, security-first health records management system built on Ethereum. MedDesk leverages a Solidity smart contract and a modern React frontend to provide doctors and patients with a tamper-proof, transparent environment for managing medical history.

## Project Structure

```
MedDesk/
├── Blockchain/          # Smart Contract (Solidity + Truffle)
│   ├── contracts/       # HealthRecords.sol Core Logic
│   ├── migrations/      # Network Deployment Scripts
│   ├── test/            # Automated Truffle Test Suite
│   └── truffle-config.js
└── Frontend/            # Modern React Web App (Vite + HeroUI)
    ├── src/
    │   ├── blockchain/  # Contract ABIs & Client Configs
    │   ├── components/  # Premium UI Components
    │   ├── context/     # Auth & Appearance State
    │   ├── hooks/       # Blockchain Interaction Hooks
    │   └── pages/       # Application Views
```

## Core Features

- **Modern Premium Design**: Professional medical dashboard with dark mode support, glassmorphism, and responsive layouts.
- **Identity & Authorization**: Role-based access control for Doctors (authorized by owners) and Patients (self-registration).
- **Decentralized Consent**: A strict on-chain permission system. Doctors cannot record data without explicit, verifiable consent from the patient.
- **Immutable Audit Trail**: All visit records are cryptographically secured and anchored to the local blockchain via MetaMask.
- **Encrypted Storage**: Sensitive medical details are encrypted before being anchored to ensure privacy.

## Smart Contract — `HealthRecords.sol`

| Function                             | Access                     | Description                                 |
| ------------------------------------ | -------------------------- | ------------------------------------------- |
| `addDoctor(...)`                     | Owner                      | Authorize a new doctor with clinic details  |
| `removeDoctor(address)`              | Owner                      | Revoke doctor authorization                 |
| `registerPatient(...)`               | Patient                    | Create a verifiable patient profile         |
| `requestConsent(address)`            | Doctor                     | Initiate an on-chain permission request     |
| `grantConsent(address)`              | Patient                    | Approve medical access for a specific doctor|
| `addVisit(address, bytes)`           | Doctor                     | Record an encrypted visit (Consent required)|
| `getHistory(address, ...)`           | Patient / Authorized Doctor| Fetch paginated medical history             |

## Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Truffle](https://trufflesuite.com/) — `npm install -g truffle`
- [Ganache](https://trufflesuite.com/ganache/) — local Ethereum blockchain (port 7545)
- [MetaMask](https://metamask.io/) browser extension

## Getting Started

### 1. Smart Contract Deployment
```bash
cd Blockchain
npm install
truffle migrate --reset
```

### 2. Frontend Setup
```bash
cd Frontend
npm install
npm run dev
```

Ensure your MetaMask is connected to your local Ganache network (Custom RPC: `http://127.0.0.1:7545`).

## Roadmap

- [x] Solidity Smart Contract (Core Ledger & Consent)
- [x] Automated Unit Test Suite (19/19 Passing)
- [x] React Frontend with MetaMask Integration
- [x] Role-Based Separation (Doctor/Patient Dashboards)
- [x] Encrypted Medical Record Flow
- [ ] IPFS Integration for Heavy Scans/Attachments

## License

MIT
