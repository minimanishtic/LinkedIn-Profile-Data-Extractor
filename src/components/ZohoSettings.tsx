import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import { CheckCircle, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

interface ZohoSettingsProps {
  onSave: (settings: ZohoSettings) => void;
  initialSettings?: ZohoSettings;
}

export interface ZohoSettings {
  webhookUrl: string;
  apiToken?: string;
  portalId?: string;
  customFields?: Record<string, string>;
}

const ZohoSettings = ({ onSave, initialSettings }: ZohoSettingsProps) => {
  const [settings, setSettings] = useState<ZohoSettings>(
    initialSettings || {
      webhookUrl: import.meta.env.VITE_WEBHOOK_URL || "",
      apiToken: "",
      portalId: "",
      customFields: {},
    },
  );

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">(
    "idle",
  );
  const [errorMessage, setErrorMessage] = useState("");

  const handleSave = async () => {
    if (!settings.webhookUrl) {
      setErrorMessage("Webhook URL is required");
      setSaveStatus("error");
      return;
    }

    setIsSaving(true);
    setSaveStatus("idle");

    try {
      // Save settings to local storage for now
      localStorage.setItem("zohoSettings", JSON.stringify(settings));

      // Call the onSave callback
      onSave(settings);

      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (error) {
      setSaveStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to save settings",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="w-full max-w-[600px] bg-white shadow-lg rounded-2xl overflow-hidden border-0">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-primary">
          Zoho Recruit Settings
        </CardTitle>
        <CardDescription>
          Configure your Zoho Recruit integration settings. These settings will
          be used when uploading profiles.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-8 space-y-6">
        <motion.div
          initial={{ opacity: 0.9, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          <div className="space-y-3">
            <Label htmlFor="webhookUrl" className="text-base font-medium">
              Make.com Webhook URL
            </Label>
            <Input
              id="webhookUrl"
              placeholder="https://hook.eu2.make.com/your-webhook-id"
              value={settings.webhookUrl}
              onChange={(e) =>
                setSettings({ ...settings, webhookUrl: e.target.value })
              }
              className="w-full border-2 rounded-xl py-3 px-4 text-base focus-visible:ring-0 focus-visible:ring-offset-0 border-muted"
            />
            <p className="text-xs text-gray-500 mt-1 pl-1">
              The webhook URL from Make.com that will receive the profile data
            </p>
          </div>

          <div className="space-y-3">
            <Label htmlFor="apiToken" className="text-base font-medium">
              Zoho Recruit API Token (Optional)
            </Label>
            <Input
              id="apiToken"
              type="password"
              placeholder="Your Zoho Recruit API token"
              value={settings.apiToken}
              onChange={(e) =>
                setSettings({ ...settings, apiToken: e.target.value })
              }
              className="w-full border-2 rounded-xl py-3 px-4 text-base focus-visible:ring-0 focus-visible:ring-offset-0 border-muted"
            />
            <p className="text-xs text-gray-500 mt-1 pl-1">
              If you want to connect directly to Zoho Recruit API instead of
              using Make.com
            </p>
          </div>

          <div className="space-y-3">
            <Label htmlFor="portalId" className="text-base font-medium">
              Zoho Recruit Portal ID (Optional)
            </Label>
            <Input
              id="portalId"
              placeholder="Your Zoho Recruit Portal ID"
              value={settings.portalId}
              onChange={(e) =>
                setSettings({ ...settings, portalId: e.target.value })
              }
              className="w-full border-2 rounded-xl py-3 px-4 text-base focus-visible:ring-0 focus-visible:ring-offset-0 border-muted"
            />
          </div>
        </motion.div>

        {saveStatus === "success" && (
          <Alert
            variant="default"
            className="border-green-500 bg-green-50 mt-4"
          >
            <CheckCircle className="h-5 w-5 text-green-500" />
            <AlertDescription className="text-green-600">
              Settings saved successfully!
            </AlertDescription>
          </Alert>
        )}

        {saveStatus === "error" && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-5 w-5" />
            <AlertDescription>
              {errorMessage || "Failed to save settings. Please try again."}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>

      <CardFooter className="px-8 pb-8">
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
          className="w-full"
        >
          <Button
            onClick={handleSave}
            className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-4 rounded-md flex items-center justify-center gap-2 transition-all duration-300"
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save Settings"}
          </Button>
        </motion.div>
      </CardFooter>
    </Card>
  );
};

export default ZohoSettings;
