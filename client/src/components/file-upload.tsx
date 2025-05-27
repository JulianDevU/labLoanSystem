"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/src/components/ui/button"
import { Loader2 } from "lucide-react"
import type { ReactNode } from "react"
import { useTranslations } from "next-intl"

interface FileUploadProps {
  accept: string
  onUpload: (file: File) => void
  buttonText: string
  buttonIcon?: ReactNode
  description?: string
  isProcessing?: boolean
}

export function FileUpload({
  accept,
  onUpload,
  buttonText,
  buttonIcon,
  description,
  isProcessing = false,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [fileTypeError, setFileTypeError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const t = useTranslations("FileUpload")

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0]
      if (isValidFileType(file)) {
        setFileTypeError(null)
        onUpload(file)
      } else {
        setFileTypeError(
          t("invalidFileType", { acceptedTypes: accept.replace(/,/g, ", ") })
        )
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      if (isValidFileType(file)) {
        setFileTypeError(null)
        onUpload(file)
      } else {
        setFileTypeError(
          t("invalidFileType", { acceptedTypes: accept.replace(/,/g, ", ") })
        )
      }
    }
  }

  const isValidFileType = (file: File) => {
    const acceptedTypes = accept.split(",").map((type) => type.trim())
    const fileExtension = `.${file.name.split(".").pop()}`

    return acceptedTypes.some((type) => {
      if (type.startsWith(".")) {
        return fileExtension.toLowerCase() === type.toLowerCase()
      }
      return file.type.match(new RegExp(type.replace("*", ".*")))
    })
  }

  return (
    <div
      className={`flex flex-col items-center justify-center gap-2 ${isDragging ? "border-primary" : ""}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <Button
        type="button"
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
        disabled={isProcessing}
        className="w-full"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t("processing")}
          </>
        ) : (
          <>
            {buttonIcon}
            {buttonText}
          </>
        )}
      </Button>
      <p className="text-xs text-muted-foreground text-center">
        {description || t("dragAndDrop")}
      </p>
      {fileTypeError && (
        <p className="text-xs text-red-500 text-center">{fileTypeError}</p>
      )}
      <input
        type="file"
        ref={fileInputRef}
        accept={accept}
        className="hidden"
        onChange={handleFileChange}
        disabled={isProcessing}
      />
    </div>
  )
}
