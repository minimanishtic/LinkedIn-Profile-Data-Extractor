import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabaseClient";
import { User } from "@supabase/supabase-js";
import {
  Upload,
  LogOut,
  Settings,
  CheckCircle,
  AlertCircle,
  Plus,
} from "lucide-react";
import ZohoSettings, { ZohoSettings as ZohoSettingsType } from "./ZohoSettings";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ZohoConnection {
  id: string;
  user_id: string;
  refresh_token?: string;
  client_id?: string;
  client_secret?: string;
  api_domain: string;
  is_active: boolean;
  connected_at: string;
  last_used?: string;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [zohoConnection, setZohoConnection] = useState<ZohoConnection | null>(
    null,
  );
  const [uploadCount, setUploadCount] = useState<number>(0);
  const [showZohoSettings, setShowZohoSettings] = useState(false);
  const [showZohoConnection, setShowZohoConnection] = useState(false);
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const navigate = useNavigate();

  const fetchUserData = async (userId: string) => {
    try {
      // Fetch Zoho connection
      const { data: zohoData } = await supabase
        .from("zoho_connections")
        .select("*")
        .eq("user_id", userId)
        .single();

      setZohoConnection(zohoData);

      // Fetch upload count
      const { count } = await supabase
        .from("uploads")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);

      setUploadCount(count || 0);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);

      if (!user) {
        navigate("/auth/login");
      } else {
        fetchUserData(user.id);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);

      if (!session?.user) {
        navigate("/auth/login");
      } else {
        fetchUserData(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleSaveZohoSettings = async (settings: ZohoSettingsType) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("zoho_connections")
        .upsert({
          user_id: user.id,
          webhook_url: settings.webhookUrl,
          api_token: settings.apiToken || null,
          portal_id: settings.portalId || null,
          custom_fields: settings.customFields || {},
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;

      setZohoConnection(data);
      setShowZohoSettings(false);
    } catch (error) {
      console.error("Error saving Zoho settings:", error);
    }
  };

  const handleZohoConnection = async () => {
    if (!user || !clientId || !clientSecret) return;

    setIsConnecting(true);
    try {
      // Save credentials to database
      const { data, error } = await supabase
        .from("zoho_connections")
        .upsert({
          user_id: user.id,
          client_id: clientId,
          client_secret: clientSecret,
          api_domain: "https://www.zohoapis.in",
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;

      // Initiate Zoho OAuth flow
      const redirectUri = `${window.location.origin}/auth/zoho/callback`;
      const scope = "ZohoRecruit.modules.ALL,ZohoRecruit.settings.ALL";
      const zohoAuthUrl = `https://accounts.zoho.in/oauth/v2/auth?scope=${scope}&client_id=${clientId}&response_type=code&access_type=offline&redirect_uri=${encodeURIComponent(redirectUri)}&state=${user.id}`;

      // Open Zoho OAuth in new window
      window.open(zohoAuthUrl, "zoho-oauth", "width=600,height=700");

      setZohoConnection(data);
      setShowZohoConnection(false);
      setClientId("");
      setClientSecret("");
    } catch (error) {
      console.error("Error connecting to Zoho:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleStartUpload = () => {
    navigate("/upload");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                LinkedIn to Zoho Recruit
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user.user_metadata?.full_name || user.email}
              </span>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back,{" "}
                {user?.user_metadata?.full_name ||
                  user?.email?.split("@")[0] ||
                  "User"}
                !
              </h2>
              <p className="text-lg text-gray-600">
                Ready to process more LinkedIn profiles?
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">
                {uploadCount}
              </div>
              <div className="text-sm text-gray-500">Profiles Extracted</div>
            </div>
          </div>

          {/* Zoho Connection Status */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-6">
            <div className="flex items-center space-x-3">
              {zohoConnection ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm font-medium text-gray-900">
                    Zoho Recruit Connected
                  </span>
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-800"
                  >
                    Active
                  </Badge>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                  <span className="text-sm font-medium text-gray-900">
                    Zoho Recruit Not Connected
                  </span>
                  <Badge
                    variant="secondary"
                    className="bg-orange-100 text-orange-800"
                  >
                    Setup Required
                  </Badge>
                </>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                zohoConnection
                  ? setShowZohoSettings(true)
                  : setShowZohoConnection(true)
              }
            >
              {zohoConnection ? "Manage Connection" : "Connect Zoho"}
            </Button>
          </div>

          {/* Quick Actions */}
          <div className="flex space-x-4">
            <Button
              size="lg"
              className="flex-1"
              onClick={handleStartUpload}
              disabled={!zohoConnection}
            >
              <Upload className="h-5 w-5 mr-2" />
              Upload Screenshots
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() =>
                zohoConnection
                  ? setShowZohoSettings(true)
                  : setShowZohoConnection(true)
              }
            >
              <Settings className="h-5 w-5 mr-2" />
              {zohoConnection ? "Settings" : "Connect Zoho"}
            </Button>
          </div>

          {!zohoConnection && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Setup Required:</strong> Connect your Zoho Recruit
                account to start uploading profiles.
              </p>
            </div>
          )}
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={handleStartUpload}
          >
            <CardHeader>
              <Upload className="h-12 w-12 text-blue-600 mb-4" />
              <CardTitle>Upload Screenshots</CardTitle>
              <CardDescription>
                Upload LinkedIn profile screenshots to extract candidate data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" disabled={!zohoConnection}>
                {zohoConnection ? "Start Upload" : "Connect Zoho First"}
              </Button>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() =>
              zohoConnection
                ? setShowZohoSettings(true)
                : setShowZohoConnection(true)
            }
          >
            <CardHeader>
              <Settings className="h-12 w-12 text-blue-600 mb-4" />
              <CardTitle>Zoho Integration</CardTitle>
              <CardDescription>
                Configure your Zoho Recruit integration and webhook settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                {zohoConnection ? "Manage Settings" : "Setup Integration"}
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-blue-600 font-bold text-lg">📊</span>
              </div>
              <CardTitle>Upload History</CardTitle>
              <CardDescription>
                View your previous uploads and their processing status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                View History ({uploadCount})
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Zoho Connection Dialog */}
      <Dialog open={showZohoConnection} onOpenChange={setShowZohoConnection}>
        <DialogContent className="sm:max-w-[500px]">
          <div className="bg-white p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Connect to Zoho Recruit
            </h2>

            <div className="space-y-4 mb-6">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">
                  How to get your Zoho API credentials:
                </h3>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Go to Zoho API Console (api-console.zoho.in)</li>
                  <li>Create a new "Server-based Applications" client</li>
                  <li>
                    Set redirect URI to: {window.location.origin}
                    /auth/zoho/callback
                  </li>
                  <li>Copy the Client ID and Client Secret below</li>
                </ol>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="clientId">Client ID</Label>
                  <Input
                    id="clientId"
                    type="text"
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    placeholder="Enter your Zoho Client ID"
                  />
                </div>

                <div>
                  <Label htmlFor="clientSecret">Client Secret</Label>
                  <Input
                    id="clientSecret"
                    type="password"
                    value={clientSecret}
                    onChange={(e) => setClientSecret(e.target.value)}
                    placeholder="Enter your Zoho Client Secret"
                  />
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowZohoConnection(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleZohoConnection}
                disabled={!clientId || !clientSecret || isConnecting}
                className="flex-1"
              >
                {isConnecting ? "Connecting..." : "Connect to Zoho"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Zoho Settings Dialog */}
      <Dialog open={showZohoSettings} onOpenChange={setShowZohoSettings}>
        <DialogContent className="sm:max-w-[600px] p-0 bg-transparent border-none">
          <ZohoSettings
            onSave={handleSaveZohoSettings}
            initialSettings={
              zohoConnection
                ? {
                    webhookUrl: zohoConnection.webhook_url,
                    apiToken: zohoConnection.api_token || "",
                    portalId: zohoConnection.portal_id || "",
                    customFields: {},
                  }
                : undefined
            }
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
