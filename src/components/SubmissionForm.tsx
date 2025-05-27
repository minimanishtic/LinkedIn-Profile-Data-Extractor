import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent } from "./ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { Send, KeyRound } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface SubmissionFormProps {
  candidateName: string;
  onNameChange: (name: string) => void;
  selectedCrm: string;
  onCrmChange: (crm: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  isBulkUpload?: boolean;
  fileCount?: number;
  zohoApiToken?: string;
  onZohoApiTokenChange?: (token: string) => void;
}

const SubmissionForm = ({
  candidateName = "",
  onNameChange = () => {},
  selectedCrm = "Zoho Recruit",
  onCrmChange = () => {},
  onSubmit = () => {},
  disabled = false,
  isBulkUpload = false,
  fileCount = 0,
  zohoApiToken = "",
  onZohoApiTokenChange = () => {},
}: SubmissionFormProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isTokenFocused, setIsTokenFocused] = useState(false);
  const [localZohoApiToken, setLocalZohoApiToken] = useState(zohoApiToken);

  // Update local state when prop changes
  useEffect(() => {
    setLocalZohoApiToken(zohoApiToken);
  }, [zohoApiToken]);

  // Handle local token change and propagate to parent
  const handleTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newToken = e.target.value;
    setLocalZohoApiToken(newToken);
    onZohoApiTokenChange(newToken);
  };

  return (
    <Card className="w-full max-w-[600px] bg-white shadow-lg rounded-2xl overflow-hidden border-0">
      <CardContent className="p-8">
        <motion.form
          initial={{ opacity: 0.9, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
          className="space-y-6"
        >
          <div className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="candidateName" className="text-base font-medium">
                {isBulkUpload
                  ? "Candidate Name (Applied to all files)"
                  : "Candidate Name (Optional)"}
              </Label>
              <motion.div
                animate={isFocused ? { scale: 1.01 } : { scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className={`rounded-xl overflow-hidden transition-all duration-300 ${isFocused ? "ring-2 ring-primary-300 ring-offset-1" : ""}`}
              >
                <Input
                  id="candidateName"
                  placeholder={
                    isBulkUpload
                      ? "Enter shared candidate name or leave blank"
                      : "Enter candidate name"
                  }
                  value={candidateName}
                  onChange={(e) => onNameChange(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  className="w-full border-2 rounded-xl py-3 px-4 text-base focus-visible:ring-0 focus-visible:ring-offset-0 border-muted"
                  disabled={disabled}
                />
              </motion.div>
              {isBulkUpload && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-xs text-gray-500 mt-1 pl-1"
                >
                  If files are from different candidates, leave blank and
                  include names in filenames
                </motion.p>
              )}
            </div>

            <div className="space-y-3">
              <Label htmlFor="crmSelect" className="text-base font-medium">
                Select CRM
              </Label>
              <Select
                value={selectedCrm}
                onValueChange={onCrmChange}
                disabled={disabled}
              >
                <SelectTrigger className="w-full border-2 rounded-xl py-3 px-4 text-base focus-visible:ring-0 focus-visible:ring-offset-0 border-muted">
                  <SelectValue placeholder="Select CRM" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Zoho Recruit">Zoho Recruit</SelectItem>
                  <SelectItem value="Greenhouse">Greenhouse</SelectItem>
                  <SelectItem value="Lever">Lever</SelectItem>
                  <SelectItem value="Others">Others</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <AnimatePresence>
              {selectedCrm === "Zoho Recruit" && (
                <motion.div
                  className="space-y-3"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Label
                    htmlFor="zohoApiToken"
                    className="text-base font-medium flex items-center gap-2"
                  >
                    <KeyRound className="h-4 w-4" />
                    Zoho API Token
                  </Label>
                  <motion.div
                    animate={isTokenFocused ? { scale: 1.01 } : { scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className={`rounded-xl overflow-hidden transition-all duration-300 ${isTokenFocused ? "ring-2 ring-primary-300 ring-offset-1" : ""}`}
                  >
                    <Input
                      id="zohoApiToken"
                      type="password"
                      placeholder="Enter your Zoho API token"
                      value={localZohoApiToken}
                      onChange={handleTokenChange}
                      onFocus={() => setIsTokenFocused(true)}
                      onBlur={() => setIsTokenFocused(false)}
                      className="w-full border-2 rounded-xl py-3 px-4 text-base focus-visible:ring-0 focus-visible:ring-offset-0 border-muted"
                      disabled={disabled}
                    />
                  </motion.div>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-xs text-gray-500 mt-1 pl-1"
                  >
                    Required for direct integration with Zoho Recruit
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="pt-4">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-4 rounded-md flex items-center justify-center gap-2 transition-all duration-300"
                disabled={disabled}
              >
                <span>
                  {disabled && disabled !== true
                    ? "Submitting..."
                    : isBulkUpload
                      ? `Submit ${fileCount} ${fileCount === 1 ? "file" : "files"} to Zoho Recruit`
                      : "Submit to Zoho Recruit"}
                </span>
                <Send className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </motion.form>
      </CardContent>
    </Card>
  );
};

export default SubmissionForm;
