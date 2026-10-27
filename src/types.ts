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

export interface NetworkStats {
  chainLength: number;
  latestBlockHeight: number;
  totalTransactions: number;
  mempoolPendingCount: number;
  activeValidatorsCount: number;
  difficulty: number;
  blockReward: number;
  gasPriceGwei: number;
  lastBlockHash: string;
  networkTPS: string;
  chainHealth: string;
}

export interface AuditFinding {
  severity: 'Critical' | 'High' | 'Medium' | 'Low' | 'Informational';
  title: string;
  description: string;
  lineHint?: string;
  recommendation: string;
}

export interface SmartContractAudit {
  overallScore: number;
  securityTier: string;
  executiveSummary: string;
  findings: AuditFinding[];
  recommendedFixCode?: string;
}

export interface MempoolAnalysis {
  status: string;
  riskLevel: string;
  analyzedCount: number;
  detectedPatterns: {
    txId: string;
    riskScore: 'low' | 'medium' | 'high';
    label: string;
    reasoning: string;
  }[];
  recommendedAction: string;
}
