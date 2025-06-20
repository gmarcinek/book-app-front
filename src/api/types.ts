export interface ApiResponse<T = any> {
  data?: T;
  status: string;
  message?: string;
}

export interface ApiError {
  detail: string;
  status?: number;
}

export interface Entity {
  id: string;
  name: string;
  type: string;
  confidence: number;
  aliases: string[];
  description: string;
  context: string;
  source_chunk_ids: string[];
  document_sources: string[];
  created_at: string;
  updated_at: string;
  merge_count: number;
}

export interface Relationship {
  source: string;
  target: string;
  source_id: string;
  target_id: string;
  relation_type: string;
  confidence: number;
  evidence_text: string;
  created_at: string;
  discovery_method: string;
}

export interface GraphData {
  nodes: Entity[];
  edges: Relationship[];
  stats: {
    node_count: number;
    edge_count: number;
    entity_count: number;
    chunk_count: number;
    returned_nodes: number;
    returned_edges: number;
  };
  truncated: {
    nodes: boolean;
    edges: boolean;
  };
  available_entity_types: string[];
}

export interface SearchQuery {
  query: string;
  max_results?: number;
}

export interface SearchResult {
  query: string;
  results: Array<{
    entity: Entity;
    similarity: number;
  }>;
  total_found: number;
}

export interface Stats {
  entities: number;
  chunks: number;
  relationships: number;
  storage_size_mb: number;
  embedding_model: string;
  thresholds?: {
    name_similarity: number;
    context_similarity: number;
  };
}

export interface EntityTypes {
  entity_types: Array<{
    type: string;
    count: number;
  }>;
  total_types: number;
}

export interface EntityDetails {
  entity: Entity;
  relationships: Relationship[];
  related_entities: Array<{
    id: string;
    name: string;
    type: string;
    confidence: number;
  }>;
  metadata: {
    created_at: string;
    updated_at: string;
    merge_count: number;
  };
}

export interface ProcessTextRequest {
  text: string;
  domains?: string[];
  model?: string;
}

export interface ProcessTextResponse {
  status: string;
  text_length: number;
  entities_before: number;
  entities_after: number;
  new_entities: number;
  domains_used: string[];
  model_used: string;
  chunks_created: number;
  processing_time_stats: {
    chunks_processed: number;
    entities_extracted_raw: number;
    entities_extracted_valid: number;
    semantic_deduplication_hits: number;
  };
}