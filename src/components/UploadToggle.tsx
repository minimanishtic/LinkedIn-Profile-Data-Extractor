import React from "react";
import { Button } from "./ui/button";

interface UploadToggleProps {
  mode: "single" | "bulk";
  onModeChange: (mode: "single" | "bulk") => void;
}

const UploadToggle = ({ mode = "single", onModeChange }: UploadToggleProps) => {
  return (
    <div className="flex w-full max-w-[600px] bg-white rounded-lg overflow-hidden mb-4 border">
      <Button
        variant={mode === "single" ? "default" : "ghost"}
        className={`flex-1 rounded-none py-6 ${mode === "single" ? "bg-[#0077B5] text-white" : "text-gray-600"}`}
        onClick={() => onModeChange("single")}
      >
        Upload Single LinkedIn SS
      </Button>
      <Button
        variant={mode === "bulk" ? "default" : "ghost"}
        className={`flex-1 rounded-none py-6 ${mode === "bulk" ? "bg-[#0077B5] text-white" : "text-gray-600"}`}
        onClick={() => onModeChange("bulk")}
      >
        Upload Multiple LinkedIn SS
      </Button>
    </div>
  );
};

export default UploadToggle;
