"use client";

import { useEffect, useRef, useState } from "react";
import { checkInByToken } from "@/lib/guest-service";
import { Guest } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Breadcrumb } from "@/components/breadcrumb";
import { Button } from "@/components/ui/button";
import { ScanLine, CheckCircle2, XCircle, AlertTriangle, Camera, CameraOff } from "lucide-react";

export default function ScannerPage() {
  const [scanResult, setScanResult] = useState<{
    status: "success" | "error" | "already";
    message: string;
    guest?: Guest;
  } | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const isProcessingRef = useRef(false);
  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrCodeRef = useRef<any>(null);

  const startScanner = async () => {
    setScanResult(null);
    setIsScanning(true);
    isProcessingRef.current = false;
    setIsProcessing(false);

    const { Html5Qrcode } = await import("html5-qrcode");

    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
      } catch {}
    }

    const scanner = new Html5Qrcode("qr-reader");
    html5QrCodeRef.current = scanner;

    try {
      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 15,
          qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            const size = Math.floor(minEdge * 0.7);
            return { width: size, height: size };
          },
          aspectRatio: 1.0,
        },
        async (decodedText: string) => {
          if (isProcessingRef.current) return;
          isProcessingRef.current = true;
          setIsProcessing(true);

          try {
            await scanner.stop();
            setIsScanning(false);
          } catch {}

          await handleCheckIn(decodedText);
        },
        () => {}
      );
    } catch (err: any) {
      setIsScanning(false);
      setScanResult({
        status: "error",
        message: "Gagal mengakses kamera. Pastikan izin kamera diberikan.",
      });
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
      } catch {}
    }
    setIsScanning(false);
  };

  const handleCheckIn = async (token: string) => {
    try {
      const guest = await checkInByToken(token);
      setScanResult({
        status: "success",
        message: `${guest.name} berhasil check-in!`,
        guest,
      });
    } catch (err: any) {
      const message = err.response?.data?.message || err.response?.data?.Message || "";
      if (message.includes("sudah di-check-in")) {
        setScanResult({
          status: "already",
          message: "Tamu sudah di-check-in sebelumnya.",
        });
      } else if (err.response?.status === 404) {
        setScanResult({
          status: "error",
          message: "QR code tidak valid atau tamu tidak ditemukan.",
        });
      } else {
        setScanResult({
          status: "error",
          message: "Terjadi kesalahan saat check-in.",
        });
      }
    } finally {
      isProcessingRef.current = false;
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current) {
        try {
          html5QrCodeRef.current.stop();
        } catch {}
      }
    };
  }, []);

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: "Scanner QR Code" }]} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Scanner QR Code</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Scan QR code tamu untuk check-in otomatis
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Scanner Area */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <ScanLine className="w-4 h-4" />
                  Kamera
                </h3>
                {!isScanning ? (
                  <Button onClick={startScanner} size="sm">
                    <Camera className="w-4 h-4 mr-2" />
                    Mulai Scan
                  </Button>
                ) : (
                  <Button onClick={stopScanner} size="sm" variant="outline">
                    <CameraOff className="w-4 h-4 mr-2" />
                    Stop
                  </Button>
                )}
              </div>

              <div
                id="qr-reader"
                ref={scannerRef}
                className="w-full aspect-square rounded-lg overflow-hidden bg-muted flex items-center justify-center"
              >
                {!isScanning && (
                  <div className="text-center text-muted-foreground">
                    <ScanLine className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Klik &quot;Mulai Scan&quot; untuk mengaktifkan kamera</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Result Area */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-sm font-medium mb-4">Hasil Scan</h3>

            {!scanResult && !isProcessing && (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <ScanLine className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-sm">Belum ada hasil scan</p>
              </div>
            )}

            {isProcessing && (
              <div className="flex flex-col items-center justify-center h-64">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <p className="text-sm text-muted-foreground mt-3">Memproses check-in...</p>
              </div>
            )}

            {scanResult && (
              <div className="space-y-4">
                <div
                  className={`flex items-start gap-3 p-4 rounded-lg ${
                    scanResult.status === "success"
                      ? "bg-green-50 border border-green-200"
                      : scanResult.status === "already"
                      ? "bg-yellow-50 border border-yellow-200"
                      : "bg-red-50 border border-red-200"
                  }`}
                >
                  {scanResult.status === "success" && (
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                  )}
                  {scanResult.status === "already" && (
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 shrink-0" />
                  )}
                  {scanResult.status === "error" && (
                    <XCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
                  )}
                  <div>
                    <p
                      className={`text-sm font-medium ${
                        scanResult.status === "success"
                          ? "text-green-800"
                          : scanResult.status === "already"
                          ? "text-yellow-800"
                          : "text-red-800"
                      }`}
                    >
                      {scanResult.message}
                    </p>
                    {scanResult.guest && (
                      <div className="mt-2 text-xs text-muted-foreground space-y-1">
                        <p>Email: {scanResult.guest.email}</p>
                        <p>Token: {scanResult.guest.qrCodeToken}</p>
                        <p>
                          Check-in:{" "}
                          {scanResult.guest.checkedInAt
                            ? new Date(scanResult.guest.checkedInAt).toLocaleString("id-ID")
                            : "-"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <Button onClick={startScanner} className="w-full">
                  <ScanLine className="w-4 h-4 mr-2" />
                  Scan Lagi
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
