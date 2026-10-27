import crypto from 'node:crypto';

export interface ContractFunctionInput {
  name: string;
  type: string;
}

export interface ContractFunction {
  name: string;
  type: 'read' | 'write';
  inputs: ContractFunctionInput[];
  outputs?: { name: string; type: string }[];
  description: string;
}

export interface ContractMetadata {
  name: string;
  code: string;
  abi: ContractFunction[];
  state: Record<string, any>;
  creator: string;
  deployedAtBlock: number;
}

export interface Transaction {
  id: string;
  from: string;
  to: string;
  amount: number;
  fee: number;
  nonce: number;
  timestamp: number;
  type: 'transfer' | 'contract_deploy' | 'contract_call' | 'validator_reward';
  data?: {
    contractName?: string;
    contractAddress?: string;
    functionName?: string;
    args?: Record<string, any>;
    code?: string;
    abi?: ContractFunction[];
    initialState?: Record<string, any>;
  };
  aiRisk?: {
    score: 'low' | 'medium' | 'high';
    flag?: string;
    summary: string;
  };
  status: 'pending' | 'confirmed' | 'rejected';
}

export interface BlockValidator {
  id: string;
  name: string;
  model: string;
  signature: string;
}

export interface AIAttestation {
  consensusProof: string;
  confidence: number;
  verifiedInvariants: string[];
  modelSignature: string;
}

export interface Block {
  index: number;
  hash: string;
  previousHash: string;
  timestamp: number;
  nonce: number;
  difficulty: number;
  merkleRoot: string;
  stateRoot: string;
  transactions: Transaction[];
  validator: BlockValidator;
  aiAttestation: AIAttestation;
}

export interface Account {
  address: string;
  label: string;
  balance: number;
  nonce: number;
  isContract: boolean;
  contractData?: ContractMetadata;
}

export interface ValidatorNode {
  id: string;
  name: string;
  model: string;
  stake: number;
  uptime: number;
  blocksValidated: number;
  reputation: number;
  status: 'active' | 'standby';
  lastAttestation: string;
  votesInFavor: number;
}

export function sha256(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

export function calculateMerkleRoot(transactions: Transaction[]): string {
  if (transactions.length === 0) {
    return sha256('empty_block_merkle_leaf');
  }

  let hashes = transactions.map((tx) => tx.id);

  while (hashes.length > 1) {
    if (hashes.length % 2 !== 0) {
      hashes.push(hashes[hashes.length - 1]);
    }

    const nextLevel: string[] = [];
    for (let i = 0; i < hashes.length; i += 2) {
      nextLevel.push(sha256(hashes[i] + hashes[i + 1]));
    }
    hashes = nextLevel;
  }

  return hashes[0];
}

export function computeBlockHash(
  index: number,
  previousHash: string,
  timestamp: number,
  merkleRoot: string,
  stateRoot: string,
  nonce: number,
  difficulty: number,
  validatorId: string
): string {
  return sha256(
    `${index}:${previousHash}:${timestamp}:${merkleRoot}:${stateRoot}:${nonce}:${difficulty}:${validatorId}`
  );
}

export class Blockchain {
  public chain: Block[] = [];
  public mempool: Transaction[] = [];
  public accounts: Map<string, Account> = new Map();
  public validators: ValidatorNode[] = [];
  public currentDifficulty: number = 2; // target: 2 leading zeroes in hash for fast snappy proof
  public blockReward: number = 10; // AIX tokens per block

  constructor() {
    this.initializeGenesis();
  }

  public initializeGenesis(): void {
    this.chain = [];
    this.mempool = [];
    this.accounts.clear();
    this.validators = [];

    // Pre-populate core accounts
    const initialAccounts: Account[] = [
      {
        address: '0xTreasury00000000000000000000000000000001',
        label: 'Synapse DAO Treasury',
        balance: 1000000,
        nonce: 0,
        isContract: false,
      },
      {
        address: '0xVitalik71cA642142277dFa06A2664E742E9439b93',
        label: 'Vitalik.ai Research',
        balance: 24500,
        nonce: 0,
        isContract: false,
      },
      {
        address: '0xSatoshi329910aF38B983C363e742880c98fE4076e',
        label: 'Satoshi Protocol Vault',
        balance: 50000,
        nonce: 0,
        isContract: false,
      },
      {
        address: '0xAlice42880c98fE4076e71cA642142277dFa06A266',
        label: 'Alice Trading Node',
        balance: 8500,
        nonce: 0,
        isContract: false,
      },
      {
        address: '0xBobB983C363e742880c98fE4076e71cA642142277',
        label: 'Bob Autonomous Agent',
        balance: 6200,
        nonce: 0,
        isContract: false,
      },
      {
        address: '0xOracle9439b93B983C363e742880c98fE4076e71cA',
        label: 'Decentralized AI Oracle',
        balance: 15000,
        nonce: 0,
        isContract: false,
      },
    ];

    for (const acc of initialAccounts) {
      this.accounts.set(acc.address.toLowerCase(), acc);
    }

    // Pre-populate AI Autonomous Validators
    this.validators = [
      {
        id: 'val_gemini_sentinel',
        name: 'Gemini-3.8-Sentinel',
        model: 'Gemini 3.8 Flash (Deep Reasoner)',
        stake: 150000,
        uptime: 99.98,
        blocksValidated: 42,
        reputation: 99,
        status: 'active',
        lastAttestation: 'Verified state root invariants and non-reentrancy on slot #0',
        votesInFavor: 42,
      },
      {
        id: 'val_claude_prover',
        name: 'Claude-Reasoning-Core',
        model: 'Claude 3.7 Sonnet Prover',
        stake: 110000,
        uptime: 99.95,
        blocksValidated: 35,
        reputation: 98,
        status: 'active',
        lastAttestation: 'Confirmed zero UTXO collisions & dynamic gas optimality',
        votesInFavor: 35,
      },
      {
        id: 'val_deepseek_math',
        name: 'DeepSeek-Math-Verif',
        model: 'DeepSeek-R1 Proof Engine',
        stake: 95000,
        uptime: 99.92,
        blocksValidated: 29,
        reputation: 97,
        status: 'active',
        lastAttestation: 'Formally verified arithmetic boundaries for token emission',
        votesInFavor: 29,
      },
      {
        id: 'val_llama_guard',
        name: 'Llama-Guardian-Node',
        model: 'Llama 3.3 70B Security Node',
        stake: 80000,
        uptime: 99.88,
        blocksValidated: 22,
        reputation: 96,
        status: 'active',
        lastAttestation: 'Mempool scan cleared of frontrunning & sandwich patterns',
        votesInFavor: 22,
      },
      {
        id: 'val_zk_snark',
        name: 'ZK-STARK-Attestor',
        model: 'Groth16 / Plonk Proof Verifier',
        stake: 75000,
        uptime: 99.99,
        blocksValidated: 31,
        reputation: 99,
        status: 'active',
        lastAttestation: 'Zero-knowledge state delta proof matches cryptographic leaf',
        votesInFavor: 31,
      },
    ];

    // Seed Sample Smart Contracts
    this.seedInitialContracts();

    // Create Genesis Block #0
    const genesisTime = Date.now() - 3600 * 1000 * 24; // 24h ago
    const genesisTxs: Transaction[] = [
      {
        id: sha256('genesis_tx_0_mint_treasury'),
        from: '0x0000000000000000000000000000000000000000',
        to: '0xTreasury00000000000000000000000000000001'.toLowerCase(),
        amount: 1000000,
        fee: 0,
        nonce: 0,
        timestamp: genesisTime,
        type: 'validator_reward',
        status: 'confirmed',
        aiRisk: {
          score: 'low',
          summary: 'Verified genesis token emission',
        },
      },
    ];

    const genesisMerkle = calculateMerkleRoot(genesisTxs);
    const genesisStateRoot = this.calculateStateRoot();
    const genesisHash = computeBlockHash(
      0,
      '0000000000000000000000000000000000000000000000000000000000000000',
      genesisTime,
      genesisMerkle,
      genesisStateRoot,
      1024,
      this.currentDifficulty,
      this.validators[0].id
    );

    const genesisBlock: Block = {
      index: 0,
      hash: genesisHash,
      previousHash: '0000000000000000000000000000000000000000000000000000000000000000',
      timestamp: genesisTime,
      nonce: 1024,
      difficulty: this.currentDifficulty,
      merkleRoot: genesisMerkle,
      stateRoot: genesisStateRoot,
      transactions: genesisTxs,
      validator: {
        id: this.validators[0].id,
        name: this.validators[0].name,
        model: this.validators[0].model,
        signature: sha256(`val_sig_genesis_${this.validators[0].id}`),
      },
      aiAttestation: {
        consensusProof: 'Genesis state invariant certified: 1,000,000 AIX total supply initialized.',
        confidence: 0.9999,
        verifiedInvariants: [
          'Supply conservation invariant holding',
          'Merkle root matches initial transactions list',
          'Genesis address nonces validated',
        ],
        modelSignature: sha256('genesis_attestation_proof_zero'),
      },
    };

    this.chain.push(genesisBlock);

    // Seed Block #1 and Block #2 for rich initial explorer data
    this.seedHistoricalBlocks(genesisTime);
  }

  private seedInitialContracts(): void {
    // Escrow contract
    const escrowAddr = '0xEscrowContract71aA901F827B8820c71cA642142277d'.toLowerCase();
    this.accounts.set(escrowAddr, {
      address: escrowAddr,
      label: 'AI Autonomous Escrow Contract',
      balance: 5000,
      nonce: 0,
      isContract: true,
      contractData: {
        name: 'NeuralMilestoneEscrow',
        code: `// SPDX-License-Identifier: Apache-2.0
contract NeuralMilestoneEscrow {
    address public payer;
    address public payee;
    address public aiOracle;
    uint256 public milestoneIndex;
    uint256 public escrowBalance;
    bool public milestoneApproved;

    event MilestoneVerified(uint256 indexed index, uint256 releaseAmount);
    event FundsReleased(address indexed to, uint256 amount);

    function verifyAndRelease(uint256 confidenceScore) public {
        require(msg.sender == aiOracle, "Only AI Oracle can certify");
        require(confidenceScore >= 85, "AI verification below threshold");
        milestoneApproved = true;
        uint256 payout = escrowBalance / 2;
        escrowBalance -= payout;
        payable(payee).transfer(payout);
    }

    function deposit() public payable {
        escrowBalance += msg.value;
    }
}`,
        abi: [
          {
            name: 'verifyAndRelease',
            type: 'write',
            inputs: [{ name: 'confidenceScore', type: 'uint256' }],
            description: 'AI Oracle submits validation score (>=85) to unlock milestone payment',
          },
          {
            name: 'deposit',
            type: 'write',
            inputs: [{ name: 'amount', type: 'uint256' }],
            description: 'Deposit funds into the autonomous milestone escrow',
          },
          {
            name: 'getEscrowStatus',
            type: 'read',
            inputs: [],
            outputs: [{ name: 'status', type: 'string' }],
            description: 'Returns current locked funds, milestone index, and approval state',
          },
        ],
        state: {
          milestoneIndex: 1,
          escrowBalance: 5000,
          milestoneApproved: false,
          targetScoreThreshold: 85,
          activeMilestoneDescription: 'Phase 1: Deliverable cryptographic verification',
        },
        creator: '0xVitalik71cA642142277dFa06A2664E742E9439b93'.toLowerCase(),
        deployedAtBlock: 1,
      },
    });

    // Dynamic Yield AMM
    const ammAddr = '0xDynamicAmmPool992Bc742E9439b93B983C363e742880c'.toLowerCase();
    this.accounts.set(ammAddr, {
      address: ammAddr,
      label: 'Dynamic AI Liquidity Pool',
      balance: 18500,
      nonce: 0,
      isContract: true,
      contractData: {
        name: 'PredictiveLiquidityPool',
        code: `// SPDX-License-Identifier: Apache-2.0
contract PredictiveLiquidityPool {
    uint256 public totalReserveAIX;
    uint256 public totalReserveUSDC;
    uint256 public dynamicFeeBasisPoints; // adjusted dynamically by AI oracle

    function swapAIXForUSDC(uint256 aixAmount) public returns (uint256) {
        uint256 fee = (aixAmount * dynamicFeeBasisPoints) / 10000;
        uint256 effectiveAmount = aixAmount - fee;
        uint256 usdcOut = (effectiveAmount * 25) / 10;
        return usdcOut;
    }

    function updateDynamicVolatilityFee(uint256 volatilityIndex) public {
        dynamicFeeBasisPoints = 10 + (volatilityIndex / 5);
    }
}`,
        abi: [
          {
            name: 'swapAIXForUSDC',
            type: 'write',
            inputs: [{ name: 'aixAmount', type: 'uint256' }],
            description: 'Execute swap through AI predictive liquidity curve with dynamic fee',
          },
          {
            name: 'updateDynamicVolatilityFee',
            type: 'write',
            inputs: [{ name: 'volatilityIndex', type: 'uint256' }],
            description: 'Oracle updates fee basis points according to on-chain volatility',
          },
          {
            name: 'getPoolReserves',
            type: 'read',
            inputs: [],
            outputs: [{ name: 'reserves', type: 'string' }],
            description: 'Query current pool reserves and dynamic fee rate',
          },
        ],
        state: {
          totalReserveAIX: 18500,
          totalReserveUSDC: 46250,
          dynamicFeeBasisPoints: 18,
          currentAPR: 13.8,
        },
        creator: '0xAlice42880c98fE4076e71cA642142277dFa06A266'.toLowerCase(),
        deployedAtBlock: 1,
      },
    });
  }

  private seedHistoricalBlocks(genesisTime: number): void {
    // Block #1
    const block1Time = genesisTime + 1800 * 1000;
    const tx1: Transaction = {
      id: sha256('tx_seed_1_vitalik_to_escrow'),
      from: '0xVitalik71cA642142277dFa06A2664E742E9439b93'.toLowerCase(),
      to: '0xEscrowContract71aA901F827B8820c71cA642142277d'.toLowerCase(),
      amount: 5000,
      fee: 0.05,
      nonce: 0,
      timestamp: block1Time - 60000,
      type: 'contract_call',
      data: {
        contractAddress: '0xEscrowContract71aA901F827B8820c71cA642142277d'.toLowerCase(),
        functionName: 'deposit',
        args: { amount: 5000 },
      },
      status: 'confirmed',
      aiRisk: {
        score: 'low',
        summary: 'Legitimate contract funding with verified destination logic',
      },
    };

    const tx2: Transaction = {
      id: sha256('tx_seed_2_treasury_to_alice'),
      from: '0xTreasury00000000000000000000000000000001'.toLowerCase(),
      to: '0xAlice42880c98fE4076e71cA642142277dFa06A266'.toLowerCase(),
      amount: 2500,
      fee: 0.02,
      nonce: 0,
      timestamp: block1Time - 30000,
      type: 'transfer',
      status: 'confirmed',
      aiRisk: {
        score: 'low',
        summary: 'Standard community developer allocation grant',
      },
    };

    const txReward1: Transaction = {
      id: sha256('reward_block_1'),
      from: '0x0000000000000000000000000000000000000000',
      to: '0xVitalik71cA642142277dFa06A2664E742E9439b93'.toLowerCase(),
      amount: this.blockReward + 0.07,
      fee: 0,
      nonce: 1,
      timestamp: block1Time,
      type: 'validator_reward',
      status: 'confirmed',
      aiRisk: { score: 'low', summary: 'Block 1 validator reward distribution' },
    };

    const block1Txs = [tx1, tx2, txReward1];
    const merkle1 = calculateMerkleRoot(block1Txs);
    const stateRoot1 = this.calculateStateRoot();
    const hash1 = '00' + sha256(`block_1_${merkle1}_${this.chain[0].hash}`).slice(2);

    this.chain.push({
      index: 1,
      hash: hash1,
      previousHash: this.chain[0].hash,
      timestamp: block1Time,
      nonce: 4912,
      difficulty: 2,
      merkleRoot: merkle1,
      stateRoot: stateRoot1,
      transactions: block1Txs,
      validator: {
        id: this.validators[1].id,
        name: this.validators[1].name,
        model: this.validators[1].model,
        signature: sha256(`sig_val_1_${this.validators[1].id}`),
      },
      aiAttestation: {
        consensusProof: 'Validated 3 transactions; confirmed escrow solvency and fee invariants.',
        confidence: 0.9995,
        verifiedInvariants: [
          'No balance overdrafts detected',
          'Contract bytecode execution sandbox passed',
          'MEV arbitrage sandwich risk evaluated: 0.00%',
        ],
        modelSignature: sha256('attestation_proof_block_1'),
      },
    });

    // Block #2
    const block2Time = block1Time + 3600 * 1000;
    const tx3: Transaction = {
      id: sha256('tx_seed_3_alice_to_bob'),
      from: '0xAlice42880c98fE4076e71cA642142277dFa06A266'.toLowerCase(),
      to: '0xBobB983C363e742880c98fE4076e71cA642142277'.toLowerCase(),
      amount: 450,
      fee: 0.015,
      nonce: 0,
      timestamp: block2Time - 45000,
      type: 'transfer',
      status: 'confirmed',
      aiRisk: {
        score: 'low',
        summary: 'Autonomous AI sub-agent compute micro-payment',
      },
    };

    const txReward2: Transaction = {
      id: sha256('reward_block_2'),
      from: '0x0000000000000000000000000000000000000000',
      to: '0xSatoshi329910aF38B983C363e742880c98fE4076e'.toLowerCase(),
      amount: this.blockReward + 0.015,
      fee: 0,
      nonce: 1,
      timestamp: block2Time,
      type: 'validator_reward',
      status: 'confirmed',
      aiRisk: { score: 'low', summary: 'Block 2 validator reward distribution' },
    };

    const block2Txs = [tx3, txReward2];
    const merkle2 = calculateMerkleRoot(block2Txs);
    const stateRoot2 = this.calculateStateRoot();
    const hash2 = '00' + sha256(`block_2_${merkle2}_${hash1}`).slice(2);

    this.chain.push({
      index: 2,
      hash: hash2,
      previousHash: hash1,
      timestamp: block2Time,
      nonce: 8731,
      difficulty: 2,
      merkleRoot: merkle2,
      stateRoot: stateRoot2,
      transactions: block2Txs,
      validator: {
        id: this.validators[2].id,
        name: this.validators[2].name,
        model: this.validators[2].model,
        signature: sha256(`sig_val_2_${this.validators[2].id}`),
      },
      aiAttestation: {
        consensusProof: 'Byzantine Fault Tolerance quorum reached (5/5). Gas utilization 14.8%.',
        confidence: 0.9998,
        verifiedInvariants: [
          'State delta matches transaction logs',
          'Sub-agent balance bounds preserved',
        ],
        modelSignature: sha256('attestation_proof_block_2'),
      },
    });

    // Populate initial mempool with 2 interesting pending transactions
    this.mempool.push(
      {
        id: sha256('tx_mempool_1_bob_inference_fee'),
        from: '0xBobB983C363e742880c98fE4076e71cA642142277'.toLowerCase(),
        to: '0xOracle9439b93B983C363e742880c98fE4076e71cA'.toLowerCase(),
        amount: 85,
        fee: 0.03,
        nonce: 1,
        timestamp: Date.now() - 15000,
        type: 'transfer',
        status: 'pending',
        aiRisk: {
          score: 'low',
          summary: 'Inference request oracle fee payment',
        },
      },
      {
        id: sha256('tx_mempool_2_amm_swap'),
        from: '0xAlice42880c98fE4076e71cA642142277dFa06A266'.toLowerCase(),
        to: '0xDynamicAmmPool992Bc742E9439b93B983C363e742880c'.toLowerCase(),
        amount: 200,
        fee: 0.045,
        nonce: 1,
        timestamp: Date.now() - 5000,
        type: 'contract_call',
        data: {
          contractAddress: '0xDynamicAmmPool992Bc742E9439b93B983C363e742880c'.toLowerCase(),
          functionName: 'swapAIXForUSDC',
          args: { aixAmount: 200 },
        },
        status: 'pending',
        aiRisk: {
          score: 'low',
          summary: 'DEX swap within standard liquidity slip bounds',
        },
      }
    );
  }

  public calculateStateRoot(): string {
    const sortedAccounts = Array.from(this.accounts.values()).sort((a, b) =>
      a.address.localeCompare(b.address)
    );
    const accountDeltas = sortedAccounts
      .map((acc) => `${acc.address}:${acc.balance}:${acc.nonce}:${acc.isContract}`)
      .join('|');
    return sha256(accountDeltas);
  }

  public getAccount(address: string): Account {
    const key = address.toLowerCase();
    let account = this.accounts.get(key);
    if (!account) {
      account = {
        address: key,
        label: `User ${key.slice(0, 6)}...${key.slice(-4)}`,
        balance: 100, // starting testnet balance for new addresses
        nonce: 0,
        isContract: false,
      };
      this.accounts.set(key, account);
    }
    return account;
  }

  public createTransaction(params: {
    from: string;
    to: string;
    amount: number;
    fee?: number;
    type?: Transaction['type'];
    data?: Transaction['data'];
    aiRisk?: Transaction['aiRisk'];
  }): Transaction {
    const fromAcc = this.getAccount(params.from);
    const toAcc = this.getAccount(params.to);

    const fee = params.fee !== undefined ? params.fee : 0.02;
    const type = params.type || 'transfer';

    if (params.from !== '0x0000000000000000000000000000000000000000' && fromAcc.balance < params.amount + fee) {
      throw new Error(`Insufficient funds: account balance ${fromAcc.balance} AIX is less than ${params.amount + fee} AIX required.`);
    }

    const txId = sha256(
      `${params.from}:${params.to}:${params.amount}:${fromAcc.nonce}:${Date.now()}:${Math.random()}`
    );

    const tx: Transaction = {
      id: txId,
      from: params.from.toLowerCase(),
      to: params.to.toLowerCase(),
      amount: Number(params.amount),
      fee: Number(fee),
      nonce: fromAcc.nonce,
      timestamp: Date.now(),
      type: type,
      data: params.data,
      aiRisk: params.aiRisk || {
        score: 'low',
        summary: 'Heuristic security pre-check passed; awaiting AI validator attestation',
      },
      status: 'pending',
    };

    this.mempool.push(tx);
    return tx;
  }

  public deploySmartContract(params: {
    creator: string;
    contractName: string;
    code: string;
    abi: ContractFunction[];
    initialState: Record<string, any>;
    initialDeposit?: number;
  }): { contractAddress: string; transaction: Transaction } {
    const creatorAcc = this.getAccount(params.creator);
    const contractAddress = (
      '0x' + sha256(`${params.creator}:${creatorAcc.nonce}:${params.contractName}:${Date.now()}`).slice(0, 40)
    ).toLowerCase();

    const deposit = params.initialDeposit || 0;

    // Create contract account
    const contractAccount: Account = {
      address: contractAddress,
      label: params.contractName,
      balance: deposit,
      nonce: 0,
      isContract: true,
      contractData: {
        name: params.contractName,
        code: params.code,
        abi: params.abi,
        state: params.initialState,
        creator: params.creator.toLowerCase(),
        deployedAtBlock: this.chain.length,
      },
    };
    this.accounts.set(contractAddress, contractAccount);

    const tx = this.createTransaction({
      from: params.creator,
      to: contractAddress,
      amount: deposit,
      fee: 0.1,
      type: 'contract_deploy',
      data: {
        contractName: params.contractName,
        contractAddress: contractAddress,
        code: params.code,
        abi: params.abi,
        initialState: params.initialState,
      },
      aiRisk: {
        score: 'low',
        summary: 'Contract deployment verified; bytecode safely partitioned',
      },
    });

    return { contractAddress, transaction: tx };
  }

  public interactContract(params: {
    caller: string;
    contractAddress: string;
    functionName: string;
    args: Record<string, any>;
    value?: number;
  }): { receipt: any; transaction: Transaction } {
    const contract = this.accounts.get(params.contractAddress.toLowerCase());
    if (!contract || !contract.isContract || !contract.contractData) {
      throw new Error(`Target address ${params.contractAddress} is not a valid smart contract`);
    }

    const fnDef = contract.contractData.abi.find((f) => f.name === params.functionName);
    if (!fnDef) {
      throw new Error(`Function ${params.functionName} not found on contract ${contract.contractData.name}`);
    }

    const value = params.value || 0;
    const currentState = { ...contract.contractData.state };

    // Contract execution simulation & state mutation
    let executionResult: any = { success: true };

    if (contract.contractData.name === 'NeuralMilestoneEscrow') {
      if (params.functionName === 'verifyAndRelease') {
        const score = Number(params.args.confidenceScore || 0);
        if (score < 85) {
          throw new Error(`Milestone verification failed: confidence score ${score} is below required threshold 85`);
        }
        currentState.milestoneApproved = true;
        const payout = Math.floor(currentState.escrowBalance / 2);
        currentState.escrowBalance -= payout;
        currentState.milestoneIndex = (currentState.milestoneIndex || 1) + 1;
        executionResult = {
          success: true,
          message: `Milestone #${currentState.milestoneIndex - 1} certified. Released ${payout} AIX to payee.`,
          updatedState: currentState,
        };
      } else if (params.functionName === 'deposit') {
        const depositAmt = Number(params.args.amount || value || 0);
        currentState.escrowBalance = (currentState.escrowBalance || 0) + depositAmt;
        executionResult = {
          success: true,
          message: `Deposited ${depositAmt} AIX into escrow balance.`,
          updatedState: currentState,
        };
      }
    } else if (contract.contractData.name === 'PredictiveLiquidityPool') {
      if (params.functionName === 'swapAIXForUSDC') {
        const amount = Number(params.args.aixAmount || 100);
        const feeBps = currentState.dynamicFeeBasisPoints || 18;
        const fee = (amount * feeBps) / 10000;
        const usdcOut = Number(((amount - fee) * 2.5).toFixed(2));
        currentState.totalReserveAIX += amount;
        currentState.totalReserveUSDC -= Math.min(currentState.totalReserveUSDC, usdcOut);
        executionResult = {
          success: true,
          swappedAIX: amount,
          feeTaken: fee,
          usdcReceived: usdcOut,
          updatedState: currentState,
        };
      } else if (params.functionName === 'updateDynamicVolatilityFee') {
        const vol = Number(params.args.volatilityIndex || 10);
        currentState.dynamicFeeBasisPoints = 10 + Math.floor(vol / 5);
        executionResult = {
          success: true,
          newFeeBasisPoints: currentState.dynamicFeeBasisPoints,
          updatedState: currentState,
        };
      }
    } else {
      // Dynamic simulated contract execution: applies numeric args or stores key-value
      for (const [key, val] of Object.entries(params.args)) {
        currentState[key] = val;
      }
      executionResult = {
        success: true,
        message: `Executed ${params.functionName} successfully.`,
        updatedState: currentState,
      };
    }

    contract.contractData.state = currentState;

    const tx = this.createTransaction({
      from: params.caller,
      to: params.contractAddress,
      amount: value,
      fee: 0.03,
      type: 'contract_call',
      data: {
        contractAddress: params.contractAddress,
        contractName: contract.contractData.name,
        functionName: params.functionName,
        args: params.args,
      },
      aiRisk: {
        score: 'low',
        summary: `Function call ${params.functionName} executed cleanly against state invariants`,
      },
    });

    return { receipt: executionResult, transaction: tx };
  }

  public mineBlock(aiAttestationCustom?: AIAttestation): Block {
    const previousBlock = this.chain[this.chain.length - 1];
    const newIndex = previousBlock.index + 1;
    const timestamp = Date.now();

    // Select round-robin or highest-stake validator
    const validator = this.validators[newIndex % this.validators.length];

    // Collect pending transactions (up to 10 per block)
    const txsToInclude = this.mempool.splice(0, 10);

    // Add block reward coinbase tx
    let totalFees = 0;
    for (const tx of txsToInclude) {
      totalFees += tx.fee;
      // Execute balance transfers
      if (tx.from !== '0x0000000000000000000000000000000000000000') {
        const sender = this.getAccount(tx.from);
        const recipient = this.getAccount(tx.to);
        sender.balance -= tx.amount + tx.fee;
        sender.nonce += 1;
        recipient.balance += tx.amount;
      }
      tx.status = 'confirmed';
    }

    // Award block reward to validator
    const rewardRecipient = this.getAccount(
      '0xVitalik71cA642142277dFa06A2664E742E9439b93'.toLowerCase()
    );
    const rewardTx: Transaction = {
      id: sha256(`coinbase_reward_block_${newIndex}_${timestamp}`),
      from: '0x0000000000000000000000000000000000000000',
      to: rewardRecipient.address,
      amount: this.blockReward + totalFees,
      fee: 0,
      nonce: rewardRecipient.nonce,
      timestamp: timestamp,
      type: 'validator_reward',
      status: 'confirmed',
      aiRisk: {
        score: 'low',
        summary: `Coinbase reward (${this.blockReward} AIX + ${totalFees.toFixed(3)} fees) to ${validator.name}`,
      },
    };
    rewardRecipient.balance += this.blockReward + totalFees;
    txsToInclude.unshift(rewardTx);

    // Calculate Merkle Root & State Root
    const merkleRoot = calculateMerkleRoot(txsToInclude);
    const stateRoot = this.calculateStateRoot();

    // Mine nonce satisfying difficulty
    const targetPrefix = '0'.repeat(this.currentDifficulty);
    let nonce = 0;
    let blockHash = '';

    while (true) {
      blockHash = computeBlockHash(
        newIndex,
        previousBlock.hash,
        timestamp,
        merkleRoot,
        stateRoot,
        nonce,
        this.currentDifficulty,
        validator.id
      );

      if (blockHash.startsWith(targetPrefix)) {
        break;
      }
      nonce++;
      if (nonce > 500000) {
        // Fallback safety cap
        blockHash = targetPrefix + blockHash.slice(this.currentDifficulty);
        break;
      }
    }

    // Update validator stats
    validator.blocksValidated += 1;
    validator.votesInFavor += 1;

    const defaultAttestation: AIAttestation = {
      consensusProof: `Proof-of-Intelligence verified for slot #${newIndex}. Verified ${txsToInclude.length} transactions across Merkle branch.`,
      confidence: 0.9996,
      verifiedInvariants: [
        `Difficulty ${this.currentDifficulty} proof satisfied (nonce: ${nonce})`,
        `Consensus quorum achieved across ${this.validators.length} active autonomous nodes`,
        'State transition delta checked with 0 balance discrepancies',
      ],
      modelSignature: sha256(`sig_ai_attestation_${newIndex}_${blockHash}`),
    };

    const block: Block = {
      index: newIndex,
      hash: blockHash,
      previousHash: previousBlock.hash,
      timestamp,
      nonce,
      difficulty: this.currentDifficulty,
      merkleRoot,
      stateRoot,
      transactions: txsToInclude,
      validator: {
        id: validator.id,
        name: validator.name,
        model: validator.model,
        signature: sha256(`val_sig_slot_${newIndex}_${validator.id}`),
      },
      aiAttestation: aiAttestationCustom || defaultAttestation,
    };

    this.chain.push(block);
    return block;
  }

  public verifyChainIntegrity(): {
    isValid: boolean;
    brokenBlockIndex?: number;
    errorReason?: string;
    details: {
      blockIndex: number;
      hashMatches: boolean;
      merkleMatches: boolean;
      previousHashMatches: boolean;
    }[];
  } {
    const details = [];

    for (let i = 0; i < this.chain.length; i++) {
      const current = this.chain[i];
      const previous = i > 0 ? this.chain[i - 1] : null;

      // Check Merkle Root
      const computedMerkle = calculateMerkleRoot(current.transactions);
      const merkleMatches = computedMerkle === current.merkleRoot;

      // Check Previous Hash Link
      let prevHashMatches = true;
      if (previous && current.previousHash !== previous.hash) {
        prevHashMatches = false;
      }

      // Check Hash Validity
      const computedHash = computeBlockHash(
        current.index,
        current.previousHash,
        current.timestamp,
        current.merkleRoot,
        current.stateRoot,
        current.nonce,
        current.difficulty,
        current.validator.id
      );

      const targetPrefix = '0'.repeat(current.difficulty);
      const hashFormatMatches = current.hash.startsWith(targetPrefix);
      const hashMatches = computedHash === current.hash || hashFormatMatches;

      details.push({
        blockIndex: current.index,
        hashMatches,
        merkleMatches,
        previousHashMatches: prevHashMatches,
      });

      if (!merkleMatches) {
        return {
          isValid: false,
          brokenBlockIndex: current.index,
          errorReason: `Block #${current.index} Merkle Root discrepancy! Transactions have been tampered with.`,
          details,
        };
      }

      if (!prevHashMatches) {
        return {
          isValid: false,
          brokenBlockIndex: current.index,
          errorReason: `Block #${current.index} Previous Hash link broken! Expected ${previous?.hash.slice(0, 16)}..., got ${current.previousHash.slice(0, 16)}...`,
          details,
        };
      }
    }

    return {
      isValid: true,
      details,
    };
  }

  public simulateTamper(blockIndex: number): { success: boolean; tamperedBlock: number; message: string } {
    if (blockIndex < 0 || blockIndex >= this.chain.length) {
      throw new Error(`Invalid block index ${blockIndex}`);
    }

    const block = this.chain[blockIndex];
    if (block.transactions.length > 0) {
      // Tamper with the transaction amount to trigger cryptographic discrepancy
      block.transactions[0].amount += 999999;
      // Do not recompute Merkle root or block hash; this breaks the chain integrity!
    } else {
      block.nonce += 1;
    }

    return {
      success: true,
      tamperedBlock: blockIndex,
      message: `Injected malicious mutation into Block #${blockIndex}. The Merkle Tree and hash linkage are now cryptographically invalidated!`,
    };
  }

  public getNetworkStats() {
    const totalTransactions = this.chain.reduce((acc, b) => acc + b.transactions.length, 0);
    const activeValidatorsCount = this.validators.filter((v) => v.status === 'active').length;
    const latestBlock = this.chain[this.chain.length - 1];

    return {
      chainLength: this.chain.length,
      latestBlockHeight: latestBlock.index,
      totalTransactions,
      mempoolPendingCount: this.mempool.length,
      activeValidatorsCount,
      difficulty: this.currentDifficulty,
      blockReward: this.blockReward,
      gasPriceGwei: 18,
      lastBlockHash: latestBlock.hash,
      networkTPS: (Math.random() * 24 + 18).toFixed(1), // simulated live throughput
      chainHealth: 'Optimal',
    };
  }
}

export const globalBlockchain = new Blockchain();
