export interface LogMessage {
    id: string;
    timestamp: string;
    type: 'system' | 'action' | 'thinking' | 'error' | 'screenshot';
    message: string;
    metadata?: any;
}

export interface AgentAction {
    type: 'click' | 'type' | 'scroll' | 'wait' | 'finish';
    selector?: string;
    coordinates?: { x: number; y: number };
    text?: string;
    reasoning?: string;
}