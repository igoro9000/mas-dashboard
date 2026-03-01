"use client";

import { AuthGuard } from "@/components/layout/auth-guard";
import { ChatView } from "@/components/chat/chat-view";
import { Suspense } from "react";

function ChatPageContent() {
  return <ChatView />;
}

export default function ChatPage() {
  return (
    <AuthGuard>
      <Suspense fallback={<div>Loading chat...</div>}>
        <ChatPageContent />
      </Suspense>
    </AuthGuard>
  );
}