"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Conversation = { id: string; client_id: string; client_name: string; last_message: string | null };
type Message = { id: string; sender_id: string; content: string; created_at: string };

export function MessagesTab({ artisanId }: { artisanId: string }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("conversations")
      .select("id, client_id, profiles(full_name)")
      .eq("artisan_id", artisanId)
      .then(({ data }) => {
        const list = (data ?? []).map((c: any) => ({
          id: c.id,
          client_id: c.client_id,
          client_name: c.profiles?.full_name ?? "Client",
          last_message: null,
        }));
        setConversations(list);
        setLoading(false);
        if (list.length > 0) setActiveId(list[0].id);
      });
  }, [artisanId]);

  useEffect(() => {
    if (!activeId) return;
    const supabase = createClient();
    supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", activeId)
      .order("created_at")
      .then(({ data }) => setMessages(data ?? []));
  }, [activeId]);

  async function handleSend() {
    if (!draft.trim() || !activeId) return;
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;
    const { data: newMsg } = await supabase
      .from("messages")
      .insert({ conversation_id: activeId, sender_id: userData.user.id, content: draft })
      .select()
      .single();
    if (newMsg) setMessages([...messages, newMsg]);
    setDraft("");
  }

  if (loading) return <p className="text-sm text-concrete font-mono">Chargement…</p>;

  if (conversations.length === 0) {
    return <p className="text-sm text-concrete">Aucune conversation pour le moment.</p>;
  }

  return (
    <div className="grid sm:grid-cols-3 gap-4 max-w-3xl">
      <div className="sm:col-span-1 space-y-1">
        {conversations.map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveId(c.id)}
            className={`w-full text-left px-3 py-2.5 text-sm border ${
              activeId === c.id ? "border-blueprint text-blueprint" : "border-graphite/10"
            }`}
          >
            {c.client_name}
          </button>
        ))}
      </div>
      <div className="sm:col-span-2 border border-graphite/15 flex flex-col h-96">
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {messages.map((m) => (
            <div key={m.id} className="text-sm">
              <p className="bg-ivory border border-graphite/10 inline-block px-3 py-2 max-w-[80%]">
                {m.content}
              </p>
            </div>
          ))}
        </div>
        <div className="flex border-t border-graphite/15">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Répondre…"
            className="flex-1 px-3 py-2.5 text-sm focus:outline-none"
          />
          <button onClick={handleSend} className="px-4 text-sm font-medium text-blueprint">
            Envoyer
          </button>
        </div>
      </div>
    </div>
  );
}
