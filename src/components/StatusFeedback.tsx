import React from "react";
import { CheckCircle, AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface FileResult {
  fileName: string;
  status: "idle" | "uploading" | "success" | "error";
  message?: string;
  progress?: number;
  index?: number; // Added to track file index for retrying individual files
}

interface StatusFeedbackProps {
  status: "idle" | "uploading" | "success" | "error";
  progress?: number;
  message?: string;
  onRetry?: () => void;
  onRetryFile?: (index: number) => void; // Added for retrying individual files
  fileResults?: FileResult[];
  isBulkUpload?: boolean;
}

const FileResultItem = ({
  result,
  onRetryFile,
}: {
  result: FileResult;
  onRetryFile?: (index: number) => void;
}) => (
  <div className="flex items-center justify-between p-2 bg-white rounded-md border border-gray-100 shadow-sm">
    <div className="flex items-center space-x-3 flex-1">
      {result.status === "uploading" ? (
        <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
      ) : result.status === "success" ? (
        <CheckCircle className="h-4 w-4 text-green-500" />
      ) : (
        <AlertCircle className="h-4 w-4 text-red-500" />
      )}
      <span className="text-sm truncate max-w-[180px]" title={result.fileName}>
        {result.fileName}
      </span>
    </div>
    <div className="flex items-center gap-2">
      {result.status === "uploading" && result.progress !== undefined && (
        <div className="w-16">
          <Progress value={result.progress} className="h-1" />
        </div>
      )}
      <span
        className={`text-xs font-medium ${result.status === "uploading" ? "text-blue-600" : result.status === "success" ? "text-green-600" : "text-red-600"}`}
      >
        {result.status === "uploading"
          ? `${result.progress || 0}%`
          : result.status === "success"
            ? "Success"
            : "Failed"}
      </span>

      {result.status === "error" &&
        result.index !== undefined &&
        onRetryFile && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => onRetryFile(result.index!)}
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Retry this file</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
    </div>
  </div>
);

const FileResultsList = ({
  fileResults,
  onRetryFile,
}: {
  fileResults: FileResult[];
  onRetryFile?: (index: number) => void;
}) => (
  <div className="mt-3">
    <ScrollArea className="h-[200px] w-full rounded-md border">
      <div className="p-2 space-y-2">
        {fileResults.map((result, index) => (
          <FileResultItem
            key={index}
            result={{ ...result, index }}
            onRetryFile={onRetryFile}
          />
        ))}
      </div>
    </ScrollArea>

    {fileResults.filter((r) => r.status === "error").length > 0 && (
      <div className="mt-2 text-right">
        <span className="text-xs text-gray-500 mr-2">
          {fileResults.filter((r) => r.status === "error").length} files failed
        </span>
      </div>
    )}
  </div>
);

const StatusFeedback = ({
  status = "idle",
  progress = 0,
  message = "",
  onRetry = () => {},
  onRetryFile,
  fileResults = [],
  isBulkUpload = false,
}: StatusFeedbackProps) => {
  const successCount = fileResults.filter((r) => r.status === "success").length;
  const errorCount = fileResults.filter((r) => r.status === "error").length;
  const totalCount = fileResults.length;

  return (
    <div className="w-full max-w-md mx-auto mt-4 bg-white p-4 rounded-md shadow-sm">
      {status === "idle" && (
        <div className="text-center text-gray-500">
          <p>Ready to upload</p>
        </div>
      )}

      {status === "waiting" && (
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-amber-600 flex items-center">
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Waiting...
            </span>
          </div>
          {message && <p className="text-sm text-amber-600 mt-1">{message}</p>}
        </div>
      )}

      {status === "preparing" && (
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-primary flex items-center">
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Preparing files...
            </span>
            <span className="text-sm font-medium text-primary">
              {Math.round(progress)}%
            </span>
          </div>
          <Progress value={progress} className="h-1.5" />
          {message && <p className="text-sm text-gray-500 mt-1">{message}</p>}

          {isBulkUpload && fileResults.length > 0 && (
            <FileResultsList
              fileResults={fileResults}
              onRetryFile={undefined}
            />
          )}
        </div>
      )}

      {status === "processing" && (
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-primary flex items-center">
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing files...
            </span>
            <span className="text-sm font-medium text-primary">
              {Math.round(progress)}%
            </span>
          </div>
          <Progress value={progress} className="h-1.5" />
          <p className="text-sm text-gray-500 mt-1">
            Your files are being processed by Zoho Recruit...
          </p>

          {isBulkUpload && fileResults.length > 0 && (
            <FileResultsList
              fileResults={fileResults}
              onRetryFile={undefined}
            />
          )}
        </div>
      )}

      {status === "uploading" && (
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-primary flex items-center">
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {isCancelling ? "Cancelling..." : "Uploading..."}
            </span>
            <span className="text-sm font-medium text-primary">
              {Math.round(progress)}%
            </span>
          </div>
          <Progress value={progress} className="h-1.5" />
          {message && <p className="text-sm text-gray-500 mt-1">{message}</p>}

          {isBulkUpload && fileResults.length > 0 && (
            <FileResultsList
              fileResults={fileResults}
              onRetryFile={status !== "uploading" ? onRetryFile : undefined}
            />
          )}

          {isBulkUpload &&
            status === "uploading" &&
            !isCancelling &&
            onCancel && (
              <div className="mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onCancel}
                  className="w-full border-red-200 text-red-600 hover:bg-red-50"
                >
                  Cancel Upload
                </Button>
              </div>
            )}
        </div>
      )}

      {status === "success" && (
        <Alert variant="default" className="border-green-500 bg-green-50">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <AlertTitle className="text-green-700">Success!</AlertTitle>
          <AlertDescription className="text-green-600">
            {isBulkUpload
              ? errorCount > 0
                ? `${successCount} of ${totalCount} files successfully uploaded. Processing now.`
                : `All ${totalCount} files successfully uploaded. Processing now.`
              : message ||
                "Uploaded successfully to Zoho Recruit. Processing now."}
          </AlertDescription>

          {isBulkUpload && fileResults.length > 0 && (
            <FileResultsList
              fileResults={fileResults}
              onRetryFile={onRetryFile}
            />
          )}

          {isBulkUpload && errorCount > 0 && (
            <div className="mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="w-full border-green-500 text-green-700 hover:bg-green-50"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry Failed Uploads
              </Button>
            </div>
          )}
        </Alert>
      )}

      {status === "error" && (
        <Alert variant="destructive">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle>Upload Error</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            <span>
              {isBulkUpload
                ? successCount > 0
                  ? `${errorCount} of ${totalCount} files failed to upload.`
                  : `All ${totalCount} files failed to upload.`
                : message || "There was an error uploading your file."}
            </span>

            {isBulkUpload && fileResults.length > 0 && (
              <FileResultsList
                fileResults={fileResults}
                onRetryFile={onRetryFile}
              />
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="mt-2"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {isBulkUpload ? "Retry All Failed Uploads" : "Try Again"}
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default StatusFeedback;
