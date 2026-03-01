"use client";

import { AuthGuard } from "@/components/layout/auth-guard";
import { ChatView } from "@/components/chat/chat-view";

export default function ChatPage() {
  return (
    <AuthGuard>
      <ChatView />
    </AuthGuard>
  );
}