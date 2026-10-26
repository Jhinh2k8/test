export type Language = 'vi' | 'en';
export type AppTheme = 'paper' | 'dark' | 'slate';

export interface CharacterItem {
  id: string;
  name: string;
  role: string;
  traits: string;
  bio: string;
}

export interface LoreItem {
  id: string;
  title: string;
  content: string;
}

export interface StoryChapter {
  id: string;
  title: string;
  content: string;
  wordCount: number;
  updatedAt: string;
}

export interface RoleplayMessage {
  id: string;
  sender: 'user' | 'assistant' | 'narrator';
  speakerName?: string;
  text: string;
  timestamp: string;
}

export interface StorySession {
  id: string;
  title: string;
  mode: 'novel' | 'roleplay';
  genre: string;
  synopsis: string;
  chapters: StoryChapter[];
  activeChapterId: string;
  roleplayMessages: RoleplayMessage[];
  characters: CharacterItem[];
  loreItems: LoreItem[];
  createdAt: string;
  updatedAt: string;
}

export interface AiCouncilMember {
  id: string;
  name: string;
  title: string;
  avatarIcon: string;
  description: string;
  systemPrompt: string;
  enabled: boolean;
  temperature: number;
  apiKeyId?: string; // ID of key in ApiKeyVault or 'custom' or 'default'
  customApiKey?: string; // Dedicated key for this specific council member
  customModel?: string; // e.g. gemini-3.8-flash, gemini-4-argon, etc.
  canViewMainChat?: boolean; // Granted permission to read full main chat/story context
  autoInjectToMainChat?: boolean; // Option to send reply into main chat
}

export interface ApiKeyItem {
  id: string;
  label: string;
  key: string;
  provider: 'gemini' | 'openai_compatible' | 'custom';
  endpointUrl?: string;
  status: 'untested' | 'active' | 'error';
  latencyMs?: number;
  lastChecked?: string;
}

export type PluginCategory = 'widget' | 'editor_hook' | 'tool' | 'rpg' | 'ui_theme';
export type PluginStatus = 'active' | 'disabled' | 'rejected' | 'crashed';

export interface PluginErrorReport {
  message: string;
  stack?: string;
  timestamp: string;
  phase: 'preflight' | 'runtime';
  line?: number;
}

export interface PluginMod {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
  category: PluginCategory;
  status: PluginStatus;
  code: string;
  errorReport?: PluginErrorReport;
  customCss?: string;
}

export interface TuningConfig {
  model: string;
  temperature: number;
  maxOutputTokens: number;
  topP: number;
  responseStyle: 'novel' | 'scifi' | 'fantasy' | 'rpg_chat' | 'romance' | 'custom';
  enableWebSearch: boolean;
  safetyLevel: 'standard' | 'relaxed' | 'strict';
}
