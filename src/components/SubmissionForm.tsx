import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent } from "./ui/card";
import { motion } from "framer-motion";
import { Send } from "lucide-react";

interface SubmissionFormProps {
  candidateName: string;
  onNameChange: (name: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  isBulkUpload?: boolean;
  fileCount?: number;
}

const SubmissionForm = ({
  candidateName = "",
  onNameChange = () => {},
  onSubmit = () => {},
  disabled = false,
  isBulkUpload = false,
  fileCount = 0,
}: SubmissionFormProps) => {
  const [isFocused, setIsFocused] = useState(false);

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
                If files are from different candidates, leave blank and include
                names in filenames
              </motion.p>
            )}
          </div>

          <div className="pt-4">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary-600 text-white font-medium py-6 rounded-xl flex items-center justify-center gap-2 transition-all duration-300"
                disabled={disabled}
              >
                <span>
                  {disabled && disabled !== true
                    ? "Submitting..."
                    : isBulkUpload
                      ? `Submit ${fileCount} ${fileCount === 1 ? "file" : "files"} to Make.com`
                      : "Submit to Make.com"}
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
