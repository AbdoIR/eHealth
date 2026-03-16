# MedDesk: Blockchain-Based E-Health Records

> [!NOTE]
> **Educational Project**: This repository was developed primarily for a **Cloud Computing** course, with secondary focus on **Blockchain Security**. It serves as a comprehensive demonstration of automated cloud infrastructure and decentralized health record management. It is NOT intended for production use with actual medical data.

<div align="center">

**A multi-layered decentralized records platform built on Ethereum and Azure.**

MedDesk combines a Solidity smart contract with a modern React dashboard to give doctors and patients a tamper-proof, consent-driven environment for managing medical history — fully automated via a professional CI/CD pipeline.

[![Solidity](https://img.shields.io/badge/Solidity-0.8.21-363636?logo=solidity&logoColor=white)](https://soliditylang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![Azure](https://img.shields.io/badge/Azure-Infrastructure-0078D4?logo=microsoftazure&logoColor=white)](https://azure.microsoft.com/)

</div>

---

## 01 | Key Features

| Feature | Description |
|---|---|
| **Professional UI** | Modern medical dashboard with dark mode support, glassmorphism, and responsive layouts |
| **On-Chain Consent** | Cryptographic engine ensuring doctors cannot record data without explicit patient approval |
| **Cloud Infrastructure** | Fully automated **Azure** provisioning using **Terraform** and **Ansible/k3s** |
| **CI/CD Pipeline** | Robust automation for testing (Vitest), Docker builds, and K8s deployments via **GitHub Actions** |
| **Immutable Ledger** | Permanent medical history secured through Ethereum smart contracts |

---

## 02 | Infrastructure & CI/CD Stack

MedDesk features a production-grade automated pipeline to manage the transition from code to cloud:

- **Infrastructure as Code**: [Terraform](terraform/) manages Azure networking and compute resources.
- **Config Management**: [Ansible](ansible/) configures the k3s cluster across the distributed nodes.
- **Continuous Integration**: [GitHub Actions](.github/workflows/main.yml) validates every commit via Vitest and automated linting.
- **Automatic Deployment**: Verified builds are containerized and deployed to the Kubernetes cluster.

---

## 03 | Prerequisites

Ensure the following environments are configured for local development and deployment:

| Tool | Version | Purpose |
|---|---|---|
| [Node.js](https://nodejs.org/) | v18+ | Runtime for the frontend and Truffle |
| [Ganache](https://trufflesuite.com/ganache/) | v7.9.1 | Local Ethereum blockchain simulator |
| [Truffle](https://trufflesuite.com/) | v5.11.5 | Smart contract compilation & deployment |
| [Terraform](https://www.terraform.io/) | v1.5+ | Infrastructure provisioning on Azure |
| [Ansible](https://www.ansible.com/) | v2.15+ | K8s cluster configuration and setup |
| [MetaMask](https://metamask.io/) | v12+ | Ethereum wallet management |

```bash
# Core tool dependency
npm install -g truffle
```

---

## 04 | Local Blockchain Setup

MedDesk uses Ganache for rapid local development, providing a pre-funded test environment.

### Phase 1: Ganache Initialization
1. Launch **Ganache** (GUI) and select **"Quickstart"**.
2. Confirm the host is `http://127.0.0.1:7545` with Network ID `1337`.

### Phase 2: Contract Deployment
```bash
cd Blockchain
npm install
truffle migrate --reset
```

### Phase 3: MetaMask Configuration
1. Add a custom network with RPC `http://127.0.0.1:7545` and Chain ID `1337`.
2. Import at least three private keys from Ganache (index 0 is the **Owner/Doctor**).

> **Note**: For a cloud-native experience, you can toggle the network to **Sepolia** on the Login page to use the live testnet deployment (`0x19a464fDc72875f9934De593D478e5e8B12D5df1`).

---

## 05 | Frontend Application

### Installation & Launch
```bash
cd Frontend
npm install
npm run dev
```
The application will launch at `http://localhost:5173`.

### Operational Workflows

#### Clinical Management (Doctor)
- **Patient Onboarding**: Register new patients using their Ethereum address.
- **Access Requests**: Initiate on-chain consent requests before recording visits.
- **Encrypted Records**: Submit encrypted medical records once consent is granted.

#### Patient Dashboard
- **Security Control**: Review and approve/deny incoming consent requests.
- **Record Access**: View your complete, immutable medical history in one place.

### Verification
```bash
cd Frontend
npm test -- --run # Executes Vitest/RTL suite
```

---

## 06 | Project Architecture

```
MedDesk/
├── Blockchain/              # Contract Layer (Solidity + Truffle)
├── Frontend/                # Application Layer (React + Vite + HeroUI)
├── k8s/                     # Orchestration Layer (Kubernetes)
├── ansible/                 # Configuration Layer (k3s Automation)
├── terraform/               # Infrastructure Layer (Azure)
└── .github/workflows/       # Automation Layer (CI/CD)
```

---

## 07 | License

Distributed under the MIT License. See `LICENSE` for more information.
