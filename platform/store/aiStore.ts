import { create } from 'zustand';

export type AiMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
};

export type AiThread = {
  id: string;
  title: string;
  messages: AiMessage[];
  updatedAt: string;
};

export type PromptTemplate = {
  id: string;
  name: string;
  prompt: string;
};

type AiState = {
  threads: AiThread[];
  activeThreadId: string;
  inputDraft: string;
  promptDraft: string;
  selectedTool: string;
  outputMode: 'markdown' | 'json' | 'code';
  templates: PromptTemplate[];
  streaming: boolean;
  streamingMessageId: string | null;
  error: string | null;

  setInputDraft: (draft: string) => void;
  setPromptDraft: (draft: string) => void;
  setSelectedTool: (tool: string) => void;
  setOutputMode: (mode: 'markdown' | 'json' | 'code') => void;
  createThread: (title?: string) => void;
  setActiveThread: (id: string) => void;
  renameThread: (threadId: string, title: string) => void;
  deleteThread: (threadId: string) => void;
  addUserMessage: (threadId: string, content: string) => void;
  startAssistantMessage: (threadId: string) => void;
  appendAssistantChunk: (threadId: string, chunk: string) => void;
  finishAssistantMessage: () => void;
  savePromptTemplate: (name: string, prompt: string) => void;
  applyPromptTemplate: (templateId: string) => void;
  setAiError: (error: string | null) => void;
};

const initialThread: AiThread = {
  id: 'thread-1',
  title: 'Welcome Session',
  updatedAt: new Date().toISOString(),
  messages: [
    {
      id: 'welcome-assistant',
      role: 'assistant',
      content: 'Hi, I am Tara. Tell me your goal and I will generate a practical execution plan.',
      createdAt: new Date().toISOString(),
    },
  ],
};

function nowIso() {
  return new Date().toISOString();
}

export const useAiStore = create<AiState>((set, get) => ({
  threads: [initialThread],
  activeThreadId: initialThread.id,
  inputDraft: '',
  promptDraft: 'Act like a senior AI copilot and produce a concise, high-impact answer.',
  selectedTool: 'Career Architect',
  outputMode: 'markdown',
  templates: [
    {
      id: 'template-1',
      name: 'Product Strategy',
      prompt: 'Generate a 30/60/90 plan for launching a B2B AI product in India.',
    },
    {
      id: 'template-2',
      name: 'System Design',
      prompt: 'Design a scalable AI inference pipeline with latency under 300ms.',
    },
    {
      id: 'template-3',
      name: 'Career Accelerator',
      prompt: 'Create a role transition plan from frontend engineer to AI product engineer in 90 days.',
    },
  ],
  streaming: false,
  streamingMessageId: null,
  error: null,

  setInputDraft: (draft) => set({ inputDraft: draft }),
  setPromptDraft: (draft) => set({ promptDraft: draft }),
  setSelectedTool: (tool) => set({ selectedTool: tool }),
  setOutputMode: (mode) => set({ outputMode: mode }),

  createThread: (title) =>
    set((state) => {
      const newThread: AiThread = {
        id: `thread-${Date.now()}`,
        title: title || 'New Session',
        updatedAt: nowIso(),
        messages: [],
      };
      return {
        threads: [newThread, ...state.threads],
        activeThreadId: newThread.id,
        inputDraft: '',
      };
    }),

  setActiveThread: (id) =>
    set((state) => {
      if (state.threads.some((thread) => thread.id === id)) {
        return { activeThreadId: id, inputDraft: '' };
      }
      return state;
    }),

  renameThread: (threadId, title) =>
    set((state) => {
      const threads = state.threads.map((t) =>
        t.id === threadId ? { ...t, title: title.trim() || 'Untitled Session', updatedAt: nowIso() } : t
      );
      return { threads };
    }),

  deleteThread: (threadId) =>
    set((state) => {
      const threads = state.threads.filter((thread) => thread.id !== threadId);
      if (threads.length === 0) {
        const fallbackThread: AiThread = {
          id: `thread-${Date.now()}`,
          title: 'Fresh Session',
          updatedAt: nowIso(),
          messages: [],
        };
        return {
          threads: [fallbackThread],
          activeThreadId: fallbackThread.id,
        };
      }
      return {
        threads,
        activeThreadId: state.activeThreadId === threadId ? threads[0].id : state.activeThreadId,
      };
    }),

  addUserMessage: (threadId, content) =>
    set((state) => {
      const threads = state.threads.map((t) => {
        if (t.id === threadId) {
          return {
            ...t,
            updatedAt: nowIso(),
            messages: [
              ...t.messages,
              {
                id: `user-${Date.now()}`,
                role: 'user' as const,
                content,
                createdAt: nowIso(),
              },
            ],
          };
        }
        return t;
      });
      return { threads, inputDraft: '' };
    }),

  startAssistantMessage: (threadId) =>
    set((state) => {
      const id = `assistant-${Date.now()}`;
      const threads = state.threads.map((t) => {
        if (t.id === threadId) {
          return {
            ...t,
            updatedAt: nowIso(),
            messages: [
              ...t.messages,
              {
                id,
                role: 'assistant' as const,
                content: '',
                createdAt: nowIso(),
              },
            ],
          };
        }
        return t;
      });
      return { threads, streaming: true, streamingMessageId: id };
    }),

  appendAssistantChunk: (threadId, chunk) =>
    set((state) => {
      const threads = state.threads.map((t) => {
        if (t.id === threadId) {
          const messages = [...t.messages];
          const lastMessage = messages[messages.length - 1];
          if (lastMessage && lastMessage.role === 'assistant') {
            messages[messages.length - 1] = {
              ...lastMessage,
              content: lastMessage.content + chunk,
            };
          }
          return { ...t, messages, updatedAt: nowIso() };
        }
        return t;
      });
      return { threads };
    }),

  finishAssistantMessage: () => set({ streaming: false, streamingMessageId: null, error: null }),

  savePromptTemplate: (name, prompt) =>
    set((state) => ({
      templates: [
        {
          id: `template-${Date.now()}`,
          name,
          prompt,
        },
        ...state.templates,
      ],
    })),

  applyPromptTemplate: (templateId) => {
    const template = get().templates.find((item) => item.id === templateId);
    if (template) {
      set({ promptDraft: template.prompt });
    }
  },

  setAiError: (error) => set({ error, streaming: false, streamingMessageId: null }),
}));
