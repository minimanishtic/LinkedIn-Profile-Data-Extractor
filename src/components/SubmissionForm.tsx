import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent } from "./ui/card";

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
  return (
    <Card className="w-full max-w-[600px] bg-white">
      <CardContent className="pt-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="candidateName">
              {isBulkUpload
                ? "Candidate Name (Applied to all files)"
                : "Candidate Name (Optional)"}
            </Label>
            <Input
              id="candidateName"
              placeholder={
                isBulkUpload
                  ? "Enter shared candidate name or leave blank"
                  : "Enter candidate name"
              }
              value={candidateName}
              onChange={(e) => onNameChange(e.target.value)}
              className="w-full"
              disabled={disabled}
            />
            {isBulkUpload && (
              <p className="text-xs text-gray-500 mt-1">
                If files are from different candidates, leave blank and include
                names in filenames
              </p>
            )}
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              className="w-full bg-[#0077B5] hover:bg-[#006097]"
              disabled={disabled}
            >
              {disabled && disabled !== true
                ? "Submitting..."
                : isBulkUpload
                  ? `Submit ${fileCount} ${fileCount === 1 ? "file" : "files"} to Make.com`
                  : "Submit to Make.com"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default SubmissionForm;
