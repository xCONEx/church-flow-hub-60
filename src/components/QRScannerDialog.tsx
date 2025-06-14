
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QrCode, CheckCircle, AlertCircle, Camera, Keyboard } from 'lucide-react';
import { useEvents } from '@/contexts/EventContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import QrScanner from 'react-qr-scanner';

interface QRScannerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const QRScannerDialog = ({ open, onOpenChange }: QRScannerDialogProps) => {
  const { registrations, checkInAttendee } = useEvents();
  const { user } = useAuth();
  const { toast } = useToast();
  const [qrCode, setQrCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastScan, setLastScan] = useState<{ success: boolean; message: string } | null>(null);
  const [activeTab, setActiveTab] = useState('camera');
  const [cameraError, setCameraError] = useState<string | null>(null);

  const processQRCode = async (code: string) => {
    if (!code.trim()) return;

    setIsProcessing(true);
    try {
      const registration = registrations.find(r => r.qrCode === code.trim());
      
      if (!registration) {
        setLastScan({
          success: false,
          message: "Código QR não encontrado ou inválido."
        });
        toast({
          title: "Código não encontrado",
          description: "Este código QR não foi encontrado no sistema.",
          variant: "destructive",
        });
        return;
      }

      if (registration.checkedIn) {
        setLastScan({
          success: false,
          message: "Este participante já fez check-in."
        });
        toast({
          title: "Check-in já realizado",
          description: "Este participante já fez check-in anteriormente.",
          variant: "destructive",
        });
        return;
      }

      await checkInAttendee(registration.id, user?.email || '');
      
      setLastScan({
        success: true,
        message: "Check-in realizado com sucesso!"
      });
      
      toast({
        title: "Check-in realizado!",
        description: "O participante foi registrado com sucesso.",
      });
      
      setQrCode('');
    } catch (error) {
      setLastScan({
        success: false,
        message: "Erro ao processar o check-in."
      });
      toast({
        title: "Erro",
        description: "Não foi possível realizar o check-in.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleScan = async () => {
    await processQRCode(qrCode);
  };

  const handleCameraScan = (data: any) => {
    if (data && !isProcessing) {
      console.log('QR Code detectado:', data);
      processQRCode(data.text || data);
    }
  };

  const handleCameraError = (err: any) => {
    console.error('Erro na câmera:', err);
    setCameraError('Erro ao acessar a câmera. Verifique as permissões.');
    toast({
      title: "Erro na câmera",
      description: "Não foi possível acessar a câmera. Verifique as permissões do navegador.",
      variant: "destructive",
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleScan();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <QrCode className="h-5 w-5 mr-2" />
            Scanner QR Code
          </DialogTitle>
          <DialogDescription>
            Use a câmera para escanear ou digite o código QR do participante para fazer o check-in.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="camera" className="flex items-center">
              <Camera className="h-4 w-4 mr-2" />
              Câmera
            </TabsTrigger>
            <TabsTrigger value="manual" className="flex items-center">
              <Keyboard className="h-4 w-4 mr-2" />
              Manual
            </TabsTrigger>
          </TabsList>

          <TabsContent value="camera" className="space-y-4">
            <div className="w-full">
              {cameraError ? (
                <div className="flex flex-col items-center p-6 bg-red-50 rounded-lg">
                  <AlertCircle className="h-12 w-12 text-red-500 mb-2" />
                  <p className="text-red-800 text-center text-sm">{cameraError}</p>
                  <Button 
                    variant="outline" 
                    onClick={() => setCameraError(null)}
                    className="mt-3"
                  >
                    Tentar novamente
                  </Button>
                </div>
              ) : (
                <div className="relative">
                  <QrScanner
                    delay={300}
                    onError={handleCameraError}
                    onScan={handleCameraScan}
                    style={{ width: '100%' }}
                    constraints={{
                      video: { facingMode: 'environment' }
                    }}
                  />
                  <div className="absolute inset-0 border-2 border-white/50 rounded-lg pointer-events-none">
                    <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-blue-500"></div>
                    <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-blue-500"></div>
                    <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-blue-500"></div>
                    <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-blue-500"></div>
                  </div>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 text-center">
              Aponte a câmera para o QR Code do participante
            </p>
          </TabsContent>

          <TabsContent value="manual" className="space-y-4">
            <div>
              <Label htmlFor="qrCode">Código QR</Label>
              <Input
                id="qrCode"
                value={qrCode}
                onChange={(e) => setQrCode(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Cole ou digite o código QR aqui"
                autoFocus
              />
            </div>

            <Button 
              onClick={handleScan} 
              disabled={isProcessing || !qrCode.trim()}
              className="w-full"
            >
              {isProcessing ? 'Processando...' : 'Fazer Check-in'}
            </Button>

            <div className="text-xs text-gray-500 text-center">
              <p>Dica: Use um leitor de QR Code para escanear diretamente</p>
              <p>ou cole o código copiado do QR Code do participante</p>
            </div>
          </TabsContent>
        </Tabs>

        {lastScan && (
          <div className={`flex items-center p-3 rounded-lg ${
            lastScan.success 
              ? 'bg-green-50 text-green-800' 
              : 'bg-red-50 text-red-800'
          }`}>
            {lastScan.success ? (
              <CheckCircle className="h-5 w-5 mr-2" />
            ) : (
              <AlertCircle className="h-5 w-5 mr-2" />
            )}
            <span className="text-sm">{lastScan.message}</span>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
