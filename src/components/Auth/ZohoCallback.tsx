import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ZohoCallback() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleZohoCallback = async () => {
      try {
        const code = searchParams.get("code");
        const state = searchParams.get("state"); // This is the user ID
        const error = searchParams.get("error");

        if (error) {
          setError(`Zoho authorization failed: ${error}`);
          setLoading(false);
          return;
        }

        if (!code || !state) {
          setError("Missing authorization code or user ID");
          setLoading(false);
          return;
        }

        // Get the current user to verify they match the state
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user || user.id !== state) {
          setError("User mismatch. Please try connecting again.");
          setLoading(false);
          return;
        }

        // Get the user's Zoho credentials from the database
        const { data: zohoConnection, error: fetchError } = await supabase
          .from("zoho_connections")
          .select("client_id, client_secret")
          .eq("user_id", user.id)
          .single();

        if (fetchError || !zohoConnection) {
          setError(
            "Could not find your Zoho credentials. Please try connecting again.",
          );
          setLoading(false);
          return;
        }

        // Exchange the authorization code for tokens
        const tokenResponse = await fetch(
          "https://accounts.zoho.in/oauth/v2/token",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              grant_type: "authorization_code",
              client_id: zohoConnection.client_id,
              client_secret: zohoConnection.client_secret,
              redirect_uri: `${window.location.origin}/auth/zoho/callback`,
              code: code,
            }),
          },
        );

        const tokenData = await tokenResponse.json();

        if (!tokenResponse.ok || tokenData.error) {
          setError(
            `Token exchange failed: ${tokenData.error || "Unknown error"}`,
          );
          setLoading(false);
          return;
        }

        // Save the tokens to the database
        const { error: updateError } = await supabase
          .from("zoho_connections")
          .update({
            refresh_token: tokenData.refresh_token,
            connected_at: new Date().toISOString(),
            is_active: true,
          })
          .eq("user_id", user.id);

        if (updateError) {
          setError(`Failed to save tokens: ${updateError.message}`);
          setLoading(false);
          return;
        }

        setSuccess(true);
        setLoading(false);

        // Redirect to dashboard after a short delay
        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
      } catch (err) {
        console.error("Zoho callback error:", err);
        setError("An unexpected error occurred during authorization");
        setLoading(false);
      }
    };

    handleZohoCallback();
  }, [navigate, searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              Connecting to Zoho
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-600">
              Please wait while we complete your Zoho Recruit connection...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2 text-green-600">
              <CheckCircle className="h-6 w-6" />
              Connection Successful!
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">
              Your Zoho Recruit account has been successfully connected.
            </p>
            <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2 text-red-600">
              <AlertCircle className="h-6 w-6" />
              Connection Failed
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => navigate("/dashboard")} className="w-full">
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
