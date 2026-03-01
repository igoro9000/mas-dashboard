"use client";

import { AuthGuard } from "@/components/layout/auth-guard";
import { ChatView } from "@/components/chat/chat-view";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ChatPageContent() {
  const searchParams = useSearchParams();
  const taskId = searchParams.get("taskId") ?? undefined;

  return <ChatView taskId={taskId} />;
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