'use client';

import { FormEvent, useMemo, useState } from 'react';
import { MessageSquarePlus, Send } from 'lucide-react';
import { PageTransition } from '@/components/common/page-transition';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useInterviewMutation } from '@/hooks/queries/useInterviewMutation';
import { InterviewMessage } from '@/types/platform';

export default function InterviewPage() {
  const interviewMutation = useInterviewMutation();
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [messages, setMessages] = useState<InterviewMessage[]>([]);
  const [input, setInput] = useState('');

  const canStart = useMemo(() => messages.length === 0, [messages.length]);

  const startInterview = () => {
    setMessages([
      {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'Interview started. Tell me about your recent project and your biggest technical challenge.',
        createdAt: new Date().toISOString(),
      },
    ]);
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const text = input.trim();
    if (!text) {
      return;
    }

    const userMessage: InterviewMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    const response = await interviewMutation.mutateAsync({
      sessionId,
      message: text,
    });

    setSessionId(response.sessionId);

    const assistantMessage: InterviewMessage = {
      ...response.reply,
      content: '',
    };
    setMessages((prev) => [...prev, assistantMessage]);

    // Stream the assistant reply character-by-character for ChatGPT-like UX.
    const chars = response.reply.content.split('');
    chars.forEach((char, index) => {
      window.setTimeout(() => {
        setMessages((prev) =>
          prev.map((message) =>
            message.id === assistantMessage.id ? { ...message, content: `${message.content}${char}` } : message
          )
        );
      }, index * 12);
    });
  };

  return (
    <PageTransition>
      <div className="mx-auto w-full max-w-4xl space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">AI interview</h2>
            <p className="text-sm text-muted-foreground">Practice role-specific interview questions with feedback in real-time.</p>
          </div>

          <Button
            type="button"
            onClick={startInterview}
            disabled={!canStart}
            className="gradient-primary rounded-2xl"
          >
            <MessageSquarePlus className="mr-2 h-4 w-4" />
            Start interview
          </Button>
        </div>

        <Card className="glass rounded-3xl border-white/10">
          <CardHeader>
            <CardTitle>Interview session</CardTitle>
            <CardDescription>Answer clearly and explain your decision process.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ScrollArea className="h-[480px] rounded-2xl border border-white/10 bg-muted/20 p-4">
              <div className="space-y-3">
                {messages.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Start an interview session to begin the conversation.</p>
                ) : null}

                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                      message.role === 'user'
                        ? 'ml-auto bg-gradient-to-r from-blue-500 to-violet-500 text-white'
                        : 'border border-white/10 bg-background/80'
                    }`}
                  >
                    {message.content || (message.role === 'assistant' ? '...' : '')}
                  </div>
                ))}
              </div>
            </ScrollArea>

            <form onSubmit={onSubmit} className="flex items-center gap-2">
              <Input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Type your interview answer..."
                className="rounded-2xl"
                disabled={interviewMutation.isPending}
              />
              <Button type="submit" className="gradient-primary rounded-2xl" disabled={interviewMutation.isPending}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
