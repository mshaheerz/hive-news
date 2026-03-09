export type AgentAnimationState =
  | 'idle'
  | 'getting-ready'
  | 'writing'
  | 'walking-to-ceo'
  | 'reviewing'
  | 'approved'
  | 'rejected'
  | 'failed'
  | 'done';

export interface BubbleData {
  text: string;
  type: 'thought' | 'speech';
  expiresAt: number;
  id: string;
}

export interface AgentState {
  key: string;
  name: string;
  model: string;
  role: 'ceo' | 'reporter';
  animationState: AgentAnimationState;
  bubble: BubbleData | null;
}

export interface CompanyRoomState {
  companyName: string;
  ceo: AgentState;
  reporters: AgentState[];
  isActive: boolean;
}

export type ViewMode = 'slide' | 'grid';
