"use client"

import { useRef, useState, useCallback, useEffect } from "react"
import Webcam from "react-webcam"
import Image from "next/image"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent } from "@/src/components/ui/card"
import { Camera, Upload, X, Loader2, RefreshCw } from "lucide-react" // Import RefreshCw icon
import { useTranslations } from "next-intl"

interface ImageUploadProps {
  value: File | null
  onChange: (value: File | null) => void
}

// Configuración de compresión
const COMPRESSION_CONFIG = {
  maxWidth: 1000,
  maxHeight: 700,
  quality: 0.6,
  maxSizeKB: 250,
};

export function ImageUpload({ value, onChange }: ImageUploadProps) {
  const webcamRef = useRef<Webcam>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isCapturing, setIsCapturing] = useState(false)
  const [isCompressing, setIsCompressing] = useState(false)
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user") // New state for camera facing mode
  const t = useTranslations("ImageUpload")

  // Function to compress image
  const compressImage = useCallback((file: File): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      const img = new window.Image()

      img.onload = () => {
        // Calculate new dimensions maintaining aspect ratio
        let { width, height } = img
        const maxWidth = COMPRESSION_CONFIG.maxWidth
        const maxHeight = COMPRESSION_CONFIG.maxHeight

        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height
            height = maxHeight
          }
        }

        canvas.width = width
        canvas.height = height

        // Draw resized image
        ctx.drawImage(img, 0, 0, width, height)

        // Recursive function to adjust quality until desired size is reached
        const tryCompress = (quality: number) => {
          canvas.toBlob((blob) => {
            if (blob) {
              const sizeKB = blob.size / 1024

              // If size is acceptable or quality is already very low, use this result
              if (sizeKB <= COMPRESSION_CONFIG.maxSizeKB || quality <= 0.1) {
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                })
                resolve(compressedFile)
              } else {
                // Reduce quality and try again
                tryCompress(quality - 0.1)
              }
            }
          }, 'image/jpeg', quality)
        }

        tryCompress(COMPRESSION_CONFIG.quality)
      }

      img.src = URL.createObjectURL(file)
    })
  }, [])

  // Converts base64 to File and compresses it
  const base64ToFile = useCallback(async (base64: string, filename: string): Promise<File> => {
    const arr = base64.split(",")
    if (arr.length < 2) throw new Error("Invalid base64 format")

    const mimeMatch = arr[0].match(/:(.*?);/)
    if (!mimeMatch) throw new Error("Could not extract MIME type")

    const mime = mimeMatch[1]
    const bstr = atob(arr[1])
    const n = bstr.length
    const u8arr = new Uint8Array(n)

    for (let i = 0; i < n; i++) {
      u8arr[i] = bstr.charCodeAt(i)
    }

    const originalFile = new File([u8arr], filename, { type: mime })

    // Compress the image
    setIsCompressing(true)
    try {
      const compressedFile = await compressImage(originalFile)
      return compressedFile
    } finally {
      setIsCompressing(false)
    }
  }, [compressImage])

  const capturePhoto = useCallback(async () => {
    const imageSrc = webcamRef.current?.getScreenshot()
    if (imageSrc) {
      try {
        setIsCompressing(true)
        const file = await base64ToFile(imageSrc, `webcam_${Date.now()}.jpg`)
        onChange(file)
        setIsCapturing(false)
      } catch (error) {
        console.error('Error processing image:', error)
        alert('Error processing image. Please try again.')
      } finally {
        setIsCompressing(false)
      }
    }
  }, [webcamRef, onChange, base64ToFile])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        setIsCompressing(true)
        const compressedFile = await compressImage(file)
        onChange(compressedFile)
      } catch (error) {
        console.error('Error compressing image:', error)
        alert('Error processing image. Please try again.')
      } finally {
        setIsCompressing(false)
      }
    }
  }

  const clearImage = () => {
    onChange(null)
  }

  // Safe handling of URL.createObjectURL
  const [previewUrl, setPreviewUrl] = useState<string>("")
  useEffect(() => {
    if (value) {
      const url = URL.createObjectURL(value)
      setPreviewUrl(url)
      return () => {
        URL.revokeObjectURL(url)
      }
    } else {
      setPreviewUrl("")
    }
  }, [value])

  // Display file information
  const getFileInfo = () => {
    if (!value) return null
    const sizeKB = Math.round(value.size / 1024)
    return `${sizeKB} KB`
  }

  // Toggle camera facing mode
  const toggleFacingMode = useCallback(() => {
    setFacingMode((prevMode) => (prevMode === "user" ? "environment" : "user"))
  }, [])

  return (
    <div className="space-y-4">
      {value ? (
        <div className="space-y-2">
          <div className="relative aspect-video w-full">
            <Image
              src={previewUrl || "/placeholder.jpg"}
              alt="Uploaded"
              className="rounded-md object-cover"
              fill
              sizes="(max-width: 768px) 100vw, 800px"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8"
              onClick={clearImage}
              disabled={isCompressing}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="text-sm text-muted-foreground text-center">
            {t("imageSize")} {getFileInfo()}
          </div>
        </div>
      ) : isCapturing ? (
        <div className="space-y-2">
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={{ ...{ width: 1280, height: 720 }, facingMode }} // Use dynamic facingMode
            className="rounded-md w-full h-[600px] object-cover bg-black"
          />
          <div className="flex gap-2">
            <Button
              onClick={capturePhoto}
              className="flex-1"
              disabled={isCompressing}
            >
              {isCompressing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t("processingImage")}
                </>
              ) : (
                t("capturePhoto")
              )}
            </Button>
            <Button
              variant="outline"
              onClick={toggleFacingMode} // Button to toggle camera
              disabled={isCompressing}
              title={t("switchCamera")}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsCapturing(false)}
              disabled={isCompressing}
            >
              {t("cancel")}
            </Button>
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center gap-4 h-[600px]">
            {isCompressing ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="text-sm text-muted-foreground">
                  {t("compressingImage")}
                </p>
              </div>
            ) : (
              <>
                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsCapturing(true)}
                    className="flex gap-2"
                  >
                    <Camera className="h-4 w-4" />
                    {t("takePhoto")}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    {t("uploadImage")}
                  </Button>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
                <div className="text-center space-y-1">
                  <p className="text-sm text-muted-foreground">
                    {t("placeholderText1")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t("placeholderText2")}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}