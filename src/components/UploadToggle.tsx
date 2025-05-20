import React from "react";
import { Button } from "./ui/button";

interface UploadToggleProps {
  mode: "single" | "bulk";
  onModeChange: (mode: "single" | "bulk") => void;
}

const UploadToggle = ({ mode = "single", onModeChange }: UploadToggleProps) => {
  return (
    <div className="flex w-full max-w-[600px] bg-white rounded-lg overflow-hidden mb-6 border border-neutral-100 p-1">
      <Button
        variant={mode === "single" ? "default" : "ghost"}
        className={`flex-1 rounded-md py-3 ${mode === "single" ? "bg-primary text-white" : "text-neutral-600 hover:bg-neutral-50"}`}
        onClick={() => onModeChange("single")}
      >
        Single Upload
      </Button>
      <Button
        variant={mode === "bulk" ? "default" : "ghost"}
        className={`flex-1 rounded-md py-3 ${mode === "bulk" ? "bg-primary text-white" : "text-neutral-600 hover:bg-neutral-50"}`}
        onClick={() => onModeChange("bulk")}
      >
        Bulk Upload
      </Button>
    </div>
  );
};

export default UploadToggle;
