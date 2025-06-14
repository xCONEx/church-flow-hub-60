
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { QrCode, CheckCircle, AlertCircle } from 'lucide-react';
import { useEvents } from '@/contexts/EventContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

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

  const handleScan = async () => {
    if (!qrCode.trim()) {
      toast({
        title: "Erro",
        description: "Digite o código QR para fazer o check-in.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const registration = registrations.find(r => r.qrCode === qrCode.trim());
      
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
            Digite ou escaneie o código QR do participante para fazer o check-in.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
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
        </div>
      </DialogContent>
    </Dialog>
  );
};
