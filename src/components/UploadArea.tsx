import React, { useState, useRef, useCallback } from "react";
import { Upload, ImageIcon, X, AlertCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";

interface UploadAreaProps {
  onFileSelect: (files: File[] | null) => void;
  selectedFiles: File[];
  multiple?: boolean;
  disabled?: boolean;
  maxFiles?: number;
}

const UploadArea = ({
  onFileSelect,
  selectedFiles = [],
  multiple = false,
  disabled = false,
  maxFiles = 20,
}: UploadAreaProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<Map<string, string>>(
    new Map(),
  );
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (!isDragging) {
        setIsDragging(true);
      }
    },
    [isDragging],
  );

  const validateFile = (file: File): { valid: boolean; reason?: string } => {
    // Check file type
    const validTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      return {
        valid: false,
        reason: `Invalid file type: ${file.name} (only PNG or JPG allowed)`,
      };
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return {
        valid: false,
        reason: `File too large: ${file.name} (max 10MB)`,
      };
    }

    return { valid: true };
  };

  const generatePreview = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const fileReader = new FileReader();
      fileReader.onload = () => {
        resolve(fileReader.result as string);
      };
      fileReader.readAsDataURL(file);
    });
  };

  const addFiles = async (filesToAdd: File[]) => {
    if (!multiple && filesToAdd.length > 0) {
      // Single file mode - replace existing file
      const file = filesToAdd[0];
      const validation = validateFile(file);
      if (validation.valid) {
        setError(null);
        const preview = await generatePreview(file);
        const newPreviewUrls = new Map();
        newPreviewUrls.set(file.name, preview);
        setPreviewUrls(newPreviewUrls);
        onFileSelect([file]);
      } else {
        setError(validation.reason || "Invalid file");
      }
    } else {
      // Multiple files mode - add to existing files
      const validFiles: File[] = [];
      const invalidFiles: { name: string; reason: string }[] = [];
      const newPreviewUrls = new Map(previewUrls);

      for (const file of filesToAdd) {
        const validation = validateFile(file);
        if (validation.valid) {
          if (selectedFiles.length + validFiles.length >= maxFiles) {
            invalidFiles.push({
              name: file.name,
              reason: `Maximum ${maxFiles} files allowed`,
            });
            continue;
          }

          // Check for duplicate filenames
          if (!selectedFiles.some((f) => f.name === file.name)) {
            validFiles.push(file);
            const preview = await generatePreview(file);
            newPreviewUrls.set(file.name, preview);
          } else {
            invalidFiles.push({
              name: file.name,
              reason: "Duplicate filename",
            });
          }
        } else {
          invalidFiles.push({
            name: file.name,
            reason: validation.reason || "Invalid file",
          });
        }
      }

      // Set error message if there are invalid files
      if (invalidFiles.length > 0) {
        if (invalidFiles.length === 1) {
          setError(invalidFiles[0].reason);
        } else {
          setError(
            `${invalidFiles.length} files couldn't be added. Hover for details.`,
          );
        }
      } else {
        setError(null);
      }

      if (validFiles.length > 0) {
        setPreviewUrls(newPreviewUrls);
        onFileSelect([...selectedFiles, ...validFiles]);
      }
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const files = Array.from(e.dataTransfer.files);
        addFiles(multiple ? files : [files[0]]);
      }
    },
    [onFileSelect, multiple, selectedFiles, maxFiles],
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        const files = Array.from(e.target.files);
        addFiles(multiple ? files : [files[0]]);
      }
    },
    [onFileSelect, multiple, selectedFiles, maxFiles],
  );

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleClearSelection = () => {
    onFileSelect(null);
    setPreviewUrls(new Map());
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveFile = (fileName: string) => {
    const updatedFiles = selectedFiles.filter((file) => file.name !== fileName);
    const newPreviewUrls = new Map(previewUrls);
    newPreviewUrls.delete(fileName);
    setPreviewUrls(newPreviewUrls);
    onFileSelect(updatedFiles.length > 0 ? updatedFiles : null);
  };

  return (
    <Card className="w-full max-w-[600px] bg-white shadow-lg overflow-hidden rounded-xl block-content">
      <motion.div
        className={`relative flex flex-col items-center justify-center p-8 md:p-10 border-2 border-dashed rounded-xl transition-all duration-300 ${isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"} ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
        onDragEnter={disabled ? undefined : handleDragEnter}
        onDragLeave={disabled ? undefined : handleDragLeave}
        onDragOver={disabled ? undefined : handleDragOver}
        onDrop={disabled ? undefined : handleDrop}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        whileHover={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)" }}
      >
        {selectedFiles.length === 0 ? (
          <motion.div
            className="flex flex-col items-center justify-center py-10 text-center"
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="mb-6 p-5 rounded-full bg-blue-50"
              whileHover={{ scale: 1.05, backgroundColor: "#e1f0ff" }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                animate={{ rotate: isDragging ? [0, -10, 10, -10, 0] : 0 }}
                transition={{ duration: 0.5 }}
              >
                <Upload className="h-12 w-12 text-blue-600" />
              </motion.div>
            </motion.div>
            <h3 className="mb-3 text-xl font-medium text-gray-900">
              {multiple
                ? "Drag & Drop LinkedIn Screenshots"
                : "Drag & Drop LinkedIn Screenshot"}
            </h3>
            <p className="mb-6 text-sm text-gray-500">
              or click to browse (PNG, JPG only
              {multiple ? ", max " + maxFiles + " files" : ""})
            </p>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button
                onClick={handleButtonClick}
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-50 px-6 py-2 rounded-full"
                disabled={disabled}
              >
                Select {multiple ? "Files" : "File"}
              </Button>
            </motion.div>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/png,image/jpeg,image/jpg"
              onChange={handleFileSelect}
              multiple={multiple}
              disabled={disabled}
            />
          </motion.div>
        ) : multiple ? (
          <motion.div
            className="w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {selectedFiles.length}{" "}
                {selectedFiles.length === 1 ? "file" : "files"} selected
              </h3>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 hover:text-red-500"
                  onClick={handleClearSelection}
                  disabled={disabled}
                >
                  Clear all
                </Button>
              </motion.div>
            </div>

            <ScrollArea className="h-[280px] w-full rounded-lg border shadow-inner bg-gray-50/50">
              <div className="p-3 space-y-3">
                <AnimatePresence>
                  {selectedFiles.map((file) => (
                    <motion.div
                      key={file.name}
                      className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm border border-gray-100"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ duration: 0.2 }}
                      whileHover={{ backgroundColor: "#f9fafb", y: -2 }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="h-12 w-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0 shadow-inner">
                          {previewUrls.has(file.name) && (
                            <motion.img
                              src={previewUrls.get(file.name)}
                              alt={file.name}
                              className="h-full w-full object-cover"
                              initial={{ scale: 1.2 }}
                              animate={{ scale: 1 }}
                              transition={{ duration: 0.3 }}
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(2)}MB
                          </p>
                        </div>
                      </div>
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full hover:bg-red-50 hover:text-red-500"
                          onClick={() => handleRemoveFile(file.name)}
                          disabled={disabled}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </ScrollArea>
          </motion.div>
        ) : (
          <motion.div
            className="w-full"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div className="relative overflow-hidden rounded-lg shadow-md">
              <motion.img
                src={previewUrls.get(selectedFiles[0]?.name) || ""}
                alt="Preview"
                className="w-full h-auto max-h-[300px] object-contain rounded-md"
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                whileHover={{ scale: 1.02 }}
              />
              <motion.div
                className="absolute top-2 right-2"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-white/80 hover:bg-white rounded-full shadow-sm"
                  onClick={handleClearSelection}
                  disabled={disabled}
                >
                  <X className="h-4 w-4" />
                </Button>
              </motion.div>
            </div>
            <motion.p
              className="mt-3 text-sm text-center text-gray-500 font-medium"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.3 }}
            >
              {selectedFiles[0]?.name} (
              {(selectedFiles[0]?.size / 1024 / 1024).toFixed(2)}MB)
            </motion.p>
          </motion.div>
        )}

        <AnimatePresence>
          {error && (
            <motion.div
              className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-md w-full flex items-start gap-2 shadow-sm border border-red-100"
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: [0, 15, 0] }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              </motion.div>
              <motion.p
                className="flex-1"
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
              >
                {error}
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </Card>
  );
};

export default UploadArea;
