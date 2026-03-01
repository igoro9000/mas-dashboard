"use client";

import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/layout/auth-guard";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Wifi, WifiOff, LogOut, User, Mail, Shield } from "lucide-react";
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

  const user = session?.user;
  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "User";

  return (
    <div className="space-y-4">
      {/* User Profile */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Profile</h3>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{displayName}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <Mail className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>
          {user?.role && (
            <div className="flex items-center gap-2 pt-1">
              <Shield className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground capitalize">
                {user.role}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Connection Status */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Connection</h3>
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
          {process.env.NEXT_PUBLIC_API_BASE_URL && (
            <p className="text-xs text-muted-foreground break-all">
              {process.env.NEXT_PUBLIC_API_BASE_URL}
            </p>
          )}
        </CardContent>
      </Card>

      {/* App Info */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <h3 className="text-sm font-semibold text-foreground">App</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Version</span>
              <span className="text-xs font-mono text-foreground">
                {process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Environment</span>
              <span className="text-xs font-mono text-foreground capitalize">
                {process.env.NODE_ENV || "production"}
              </span>
            </div>
          </div>
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