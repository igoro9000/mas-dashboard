"use client";

import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/layout/auth-guard";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Wifi, WifiOff, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { getSocket } from "@/lib/socket";

export default function SettingsPage() {
  return (
    <AuthGuard>
      <SettingsContent />
    </AuthGuard>
  );
}

function SettingsContent() {
  const { session, signOut } = useAuth();
  const router = useRouter();
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const token = session?.access_token;
    if (!token) return;
    const socket = getSocket(token);
    const update = () => setConnected(socket.connected);
    update();
    socket.on("connect", update);
    socket.on("disconnect", update);
    return () => {
      socket.off("connect", update);
      socket.off("disconnect", update);
    };
  }, [session?.access_token]);

  async function handleSignOut() {
    await signOut();
    router.replace("/login");
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4 space-y-3">
          <h3 className="text-sm font-semibold">Account</h3>
          <p className="text-sm text-muted-foreground">{session?.user.email}</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-3">
          <h3 className="text-sm font-semibold">Connection</h3>
          <div className="flex items-center gap-2 text-sm">
            {connected ? (
              <>
                <Wifi className="h-4 w-4 text-green-500" />
                <span className="text-green-500">Connected</span>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 text-destructive" />
                <span className="text-destructive">Disconnected</span>
              </>
            )}
          </div>
          <p className="text-xs text-muted-foreground break-all">
            {process.env.NEXT_PUBLIC_API_BASE_URL}
          </p>
        </CardContent>
      </Card>

      <Separator />

      <Button
        variant="destructive"
        className="w-full h-12 text-base"
        onClick={handleSignOut}
      >
        <LogOut className="h-4 w-4 mr-2" />
        Sign Out
      </Button>
    </div>
  );
}
