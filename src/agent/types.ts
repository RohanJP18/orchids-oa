export interface ProjectContext {
  projectStructure?: any;
  patterns?: any;
  dependencies?: any;
  integrations?: any;
  summary?: string;
  emphasis?: string[];
  include?: string[];
  exclude?: string[];
}

export interface SpotifyProjectContext extends ProjectContext {
  musicEntities?: {
    songs?: EntityDefinition;
    playlists?: EntityDefinition;
    albums?: EntityDefinition;
    artists?: EntityDefinition;
    users?: EntityDefinition;
  };
  
  musicUIPatterns?: {
    playerComponents?: ComponentPattern[];
    listingComponents?: ComponentPattern[];
    cardComponents?: ComponentPattern[];
  };
  
  dataFlowPatterns?: {
    audioStreaming?: FlowPattern;
    playlistManagement?: FlowPattern;
    userInteractions?: FlowPattern;
  };
}

export interface EntityDefinition {
  name: string;
  fields: FieldDefinition[];
  relationships: RelationshipDefinition[];
}

export interface FieldDefinition {
  name: string;
  type: string;
  required: boolean;
  unique?: boolean;
  default?: any;
}

export interface RelationshipDefinition {
  type: 'one-to-one' | 'one-to-many' | 'many-to-many';
  target: string;
  foreignKey?: string;
}

export interface ComponentPattern {
  name: string;
  structure: string;
  props: string[];
  styling: string;
}

export interface FlowPattern {
  name: string;
  steps: string[];
  dataFlow: string[];
}

export interface ContextQuality {
  completeness: number;
  relevance: number;
  consistency: number;
  tokenEfficiency: number;
}

export interface ExecutionPlan {
  steps: ExecutionStep[];
  estimatedTime: string;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface ExecutionStep {
  description: string;
  files: string[];
  operation: string;
  estimatedDuration: number;
}

export interface DatabaseOperation {
  type: 'create' | 'update' | 'delete' | 'query';
  entity: string;
  data?: any;
  conditions?: any;
}

export interface APIOperation {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  handler: string;
  middleware?: string[];
}

export interface FrontendOperation {
  component: string;
  action: 'create' | 'update' | 'integrate';
  props?: any;
  styling?: any;
} 