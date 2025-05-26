import React, { useState, useRef } from "react";
import UploadArea from "./UploadArea";
import SubmissionForm from "./SubmissionForm";
import StatusFeedback from "./StatusFeedback";
import UploadToggle from "./UploadToggle";

type UploadStatus = "idle" | "uploading" | "success" | "error";
type UploadMode = "single" | "bulk";

export default function Home() {
  const [uploadMode, setUploadMode] = useState<UploadMode>("single");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [candidateName, setCandidateName] = useState<string>("");
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [currentFileIndex, setCurrentFileIndex] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [fileResults, setFileResults] = useState<
    {
      fileName: string;
      status: UploadStatus;
      message?: string;
      progress?: number;
    }[]
  >([]);

  const handleFileSelect = (files: File[] | null) => {
    setSelectedFiles(files || []);
    // Reset status when new files are selected
    if (files && files.length > 0) {
      setUploadStatus("idle");
      setErrorMessage("");
      setFileResults([]);
    }
  };

  const handleModeChange = (mode: UploadMode) => {
    setUploadMode(mode);
    // Clear selected files when changing modes
    setSelectedFiles([]);
    setUploadStatus("idle");
    setErrorMessage("");
    setFileResults([]);
  };

  const handleNameChange = (name: string) => {
    setCandidateName(name);
  };

  const uploadSingleFile = async (
    file: File,
    name: string,
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      // Create form data for the webhook request
      const formData = new FormData();
      formData.append("file", file);
      formData.append("candidateName", name || "Unknown");
      formData.append("fileName", file.name);

      // Using environment variable for the webhook URL, with fallback to the provided webhook URL
      const webhookUrl =
        import.meta.env.VITE_WEBHOOK_URL ||
        "https://hook.eu2.make.com/v3uyigxtm7tsrq5qcqyayuxhqpp4rxhr";

      // Check if webhook URL is configured
      if (!webhookUrl) {
        throw new Error(
          "Webhook URL is not configured. Please set the VITE_WEBHOOK_URL environment variable.",
        );
      }

      const response = await fetch(webhookUrl, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "An unknown error occurred",
      };
    }
  };

  const handleSubmit = async () => {
    if (selectedFiles.length === 0) {
      setErrorMessage("Please select a file to upload");
      setUploadStatus("error");
      return;
    }

    setUploadStatus("uploading");
    setUploadProgress(0);
    setCurrentFileIndex(0);
    setFileResults([]);

    if (uploadMode === "single") {
      // Single file upload
      const file = selectedFiles[0];

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = prev + 10;
          if (newProgress >= 90) {
            clearInterval(progressInterval);
            return 90; // Hold at 90% until the actual request completes
          }
          return newProgress;
        });
      }, 300);

      try {
        const result = await uploadSingleFile(file, candidateName);

        clearInterval(progressInterval);

        if (result.success) {
          setUploadProgress(100);
          setUploadStatus("success");
          setFileResults([{ fileName: file.name, status: "success" }]);
        } else {
          throw new Error(result.message);
        }
      } catch (error) {
        clearInterval(progressInterval);
        const errorMsg =
          error instanceof Error ? error.message : "An unknown error occurred";
        setErrorMessage(errorMsg);
        setUploadStatus("error");
        setFileResults([
          { fileName: file.name, status: "error", message: errorMsg },
        ]);
      }
    } else {
      // Bulk upload
      const totalFiles = selectedFiles.length;
      const results: {
        fileName: string;
        status: UploadStatus;
        message?: string;
        progress?: number;
      }[] = [];
      let successCount = 0;

      // Initialize progress tracking for all files
      const initialResults = selectedFiles.map((file) => ({
        fileName: file.name,
        status: "idle" as UploadStatus,
        progress: 0,
      }));
      setFileResults(initialResults);

      // Show message about sequential processing with delays
      setErrorMessage(
        "Profiles are being processed sequentially with intentional delays to ensure successful integration with Zoho Recruit.",
      );

      for (let i = 0; i < totalFiles; i++) {
        setCurrentFileIndex(i);
        setUploadProgress(Math.round((i / totalFiles) * 100));

        // Update current file status to uploading
        setFileResults((prev) =>
          prev.map((item, idx) =>
            idx === i ? { ...item, status: "uploading" } : item,
          ),
        );

        const file = selectedFiles[i];

        // Simulate progress for current file
        const progressInterval = setInterval(() => {
          setFileResults((prev) =>
            prev.map((item, idx) => {
              if (
                idx === i &&
                item.progress !== undefined &&
                item.progress < 90
              ) {
                return { ...item, progress: item.progress + 10 };
              }
              return item;
            }),
          );
        }, 300);

        const result = await uploadSingleFile(file, candidateName);
        clearInterval(progressInterval);

        if (result.success) {
          results.push({
            fileName: file.name,
            status: "success",
            progress: 100,
          });
          successCount++;
          // Update file status to processing
          setFileResults((prev) =>
            prev.map((item, idx) =>
              idx === i
                ? { ...item, status: "processing", progress: 100 }
                : item,
            ),
          );

          // Simulate processing time (3 seconds)
          await new Promise((resolve) => setTimeout(resolve, 3000));

          // Update file status to success
          setFileResults((prev) =>
            prev.map((item, idx) =>
              idx === i ? { ...item, status: "success", progress: 100 } : item,
            ),
          );
        } else {
          results.push({
            fileName: file.name,
            status: "error",
            message: result.message,
            progress: 100,
          });
          // Update file status to error
          setFileResults((prev) =>
            prev.map((item, idx) =>
              idx === i
                ? {
                    ...item,
                    status: "error",
                    message: result.message,
                    progress: 100,
                  }
                : item,
            ),
          );
        }

        // If this isn't the last file, add a delay before processing the next file
        if (i < totalFiles - 1) {
          // Update message to show waiting time
          setErrorMessage(
            `Waiting 160 seconds before processing the next profile to ensure successful integration (${i + 1}/${totalFiles} completed)`,
          );

          // 160-second delay between webhook calls for bulk uploads
          const delayTime = 160000; // 160 seconds in milliseconds
          const startTime = Date.now();

          // Update the message with countdown every second
          await new Promise((resolve) => {
            const countdownInterval = setInterval(() => {
              const elapsed = Date.now() - startTime;
              const remaining = Math.ceil((delayTime - elapsed) / 1000);

              setErrorMessage(
                `Waiting ${remaining} seconds before processing the next profile to ensure successful integration (${i + 1}/${totalFiles} completed)`,
              );

              if (elapsed >= delayTime) {
                clearInterval(countdownInterval);
                resolve(null);
              }
            }, 1000);
          });
        }
      }

      setUploadProgress(100);
      setUploadStatus(
        successCount === totalFiles
          ? "success"
          : successCount > 0
            ? "success"
            : "error",
      );

      if (successCount === 0) {
        setErrorMessage("All uploads failed. Please try again.");
      }
    }
  };

  const handleRetry = () => {
    // Filter out only the failed files for retry
    if (uploadMode === "bulk" && fileResults.length > 0) {
      const failedFiles = selectedFiles.filter(
        (_, index) => fileResults[index]?.status === "error",
      );

      if (failedFiles.length > 0) {
        // Keep only the failed files for retry
        setSelectedFiles(failedFiles);
        // Reset status for retry
        setUploadStatus("idle");
        setErrorMessage("");
        setUploadProgress(0);
        // Reset file results but keep the successful ones
        setFileResults(
          fileResults.filter((result) => result.status === "success"),
        );
        return;
      }
    }

    // Default behavior for single upload or if no failed files
    setUploadStatus("idle");
    setErrorMessage("");
    setUploadProgress(0);
  };

  const handleRetryFile = async (index: number) => {
    // Only retry if we're not currently uploading
    if (uploadStatus === "uploading") return;

    // Get the file to retry
    const fileToRetry = selectedFiles[index];
    if (!fileToRetry) return;

    // Set status to uploading for this specific file
    setFileResults((prev) =>
      prev.map((item, idx) =>
        idx === index ? { ...item, status: "uploading", progress: 0 } : item,
      ),
    );

    // Simulate progress for this file
    const progressInterval = setInterval(() => {
      setFileResults((prev) =>
        prev.map((item, idx) => {
          if (
            idx === index &&
            item.progress !== undefined &&
            item.progress < 90
          ) {
            return { ...item, progress: item.progress + 10 };
          }
          return item;
        }),
      );
    }, 300);

    try {
      const result = await uploadSingleFile(fileToRetry, candidateName);
      clearInterval(progressInterval);

      if (result.success) {
        // Update file status to processing
        setFileResults((prev) =>
          prev.map((item, idx) =>
            idx === index
              ? { ...item, status: "processing", progress: 100 }
              : item,
          ),
        );

        // Add a 2-second delay to simulate processing
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Update file status to success
        setFileResults((prev) =>
          prev.map((item, idx) =>
            idx === index
              ? { ...item, status: "success", progress: 100 }
              : item,
          ),
        );
      } else {
        throw new Error(result.message);
      }

      // Check if all files are now successful
      const updatedResults = [...fileResults];
      updatedResults[index] = {
        fileName: fileToRetry.name,
        status: "success",
        progress: 100,
      };

      const allSuccess = updatedResults.every(
        (item) => item.status === "success",
      );
      if (allSuccess) {
        setUploadStatus("success");
      }
    } catch (error) {
      clearInterval(progressInterval);
      const errorMsg =
        error instanceof Error ? error.message : "An unknown error occurred";

      // Update file status to error
      setFileResults((prev) =>
        prev.map((item, idx) =>
          idx === index
            ? {
                ...item,
                status: "error",
                message: errorMsg,
                progress: 100,
              }
            : item,
        ),
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-0 bg-background">
      <div className="w-full max-w-3xl bg-card rounded-2xl shadow-lg p-8 md:p-10 space-y-10 mx-4 mb-16">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary mb-2 text-center">
            GoFullpage to Zoho Recruit - 1 Click
          </h1>
          <p className="text-gray-600">
            Turn Linkedin profile screenshots into structured data entry to Zoho
            Recruit Portal in just 1 click.
          </p>
        </div>

        <UploadToggle mode={uploadMode} onModeChange={handleModeChange} />

        <UploadArea
          selectedFiles={selectedFiles}
          onFileSelect={handleFileSelect}
          multiple={uploadMode === "bulk"}
          disabled={uploadStatus === "uploading"}
          maxFiles={20}
        />

        <SubmissionForm
          candidateName={candidateName}
          onNameChange={handleNameChange}
          onSubmit={handleSubmit}
          disabled={
            selectedFiles.length === 0 ||
            uploadStatus === "uploading" ||
            uploadStatus === "success"
          }
          isBulkUpload={uploadMode === "bulk"}
          fileCount={selectedFiles.length}
        />

        <StatusFeedback
          status={uploadStatus}
          progress={uploadProgress}
          message={
            uploadStatus === "uploading" && uploadMode === "bulk"
              ? `Uploading ${currentFileIndex + 1} of ${selectedFiles.length}...`
              : errorMessage
          }
          onRetry={handleRetry}
          onRetryFile={handleRetryFile}
          fileResults={fileResults}
          isBulkUpload={uploadMode === "bulk"}
        />

        <div className="mt-8 p-6 bg-neutral-50 border border-neutral-100 rounded-lg text-sm text-neutral-600">
          <p className="mb-2">
            <span className="font-medium text-neutral-800">Disclaimer:</span> By
            uploading screenshots, you confirm that you have permission to
            process this data.
          </p>
          <p className="mb-4">
            Extracted data will be processed and made available in a structured
            format.
          </p>
          <a
            href="https://docs.google.com/spreadsheets/d/example"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-primary hover:text-primary-dark font-medium"
          >
            <span className="mr-1">View Results in Zoho Recruit</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
