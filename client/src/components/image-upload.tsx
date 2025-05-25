"use client"

import { useRef, useState, useCallback } from "react"
import Webcam from "react-webcam"
import Image from "next/image"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent } from "@/src/components/ui/card"
import { Camera, Upload, X } from "lucide-react"
import axios from "axios"

interface ImageUploadProps {
  value: string
  onChange: (value: string) => void
}

const videoConstraints = {
  width: 1280,
  height: 720,
  facingMode: "user" as const, // puedes cambiar a "environment"
}

export function ImageUpload({ value, onChange }: ImageUploadProps) {
  const webcamRef = useRef<Webcam>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isCapturing, setIsCapturing] = useState(false)

  // Sube un archivo al backend y retorna la URL
  const uploadFile = async (file: File | Blob) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await axios.post("/api/upload", formData, {
        baseURL: process.env.NEXT_PUBLIC_BACK_ENV || "http://localhost:4000",
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data.url;
    } catch (err) {
      alert("Error subiendo la imagen. Intenta de nuevo.");
      return null;
    }
  };

  // Captura foto, la convierte a blob y la sube
  const capturePhoto = useCallback(async () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      // Convertir base64 a blob
      const res = await fetch(imageSrc);
      const blob = await res.blob();
      const url = await uploadFile(blob);
      if (url) {
        onChange(url);
        setIsCapturing(false);
      }
    }
  }, [webcamRef, onChange]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = await uploadFile(file);
      if (url) {
        onChange(url);
      }
    }
  };

  const clearImage = () => {
    onChange("")
  }

  // Detectar si es base64 o URL
  let displaySrc = value;
  if (value && !value.startsWith('data:image') && !value.startsWith('http')) {
    // Es una ruta relativa, agregar el backend
    const base = process.env.NEXT_PUBLIC_BACK_ENV || 'http://localhost:4000';
    displaySrc = base + value;
  }

  return (
    <div className="space-y-4">
      {value ? (
        <div className="relative h-[600px] w-full">
          <Image
            src={displaySrc}
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
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : isCapturing ? (
        <div className="space-y-2">
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={videoConstraints}
            className="rounded-md w-full h-[600px] object-cover bg-black"
          />
          <div className="flex gap-2">
            <Button onClick={capturePhoto} className="flex-1">
              Capturar Foto
            </Button>
            <Button variant="outline" onClick={() => setIsCapturing(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center gap-4 h-[600px]">
            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setIsCapturing(true)} className="flex gap-2">
                <Camera className="h-4 w-4" />
                Tomar Foto
              </Button>
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="flex gap-2"
              >
                <Upload className="h-4 w-4" />
                Subir Imagen
              </Button>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Toma una foto o sube una imagen como evidencia para este préstamo
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}