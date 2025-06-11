
import { Link } from 'react-router-dom';
import { ShieldX } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const Unauthorized = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
      <div className="text-center">
        <div className="mb-8">
          <ShieldX className="h-24 w-24 text-red-500 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Acesso Negado</h1>
          <p className="text-xl text-gray-600 mb-4">
            Você não tem permissão para acessar esta página.
          </p>
          <p className="text-gray-500">
            Entre em contato com o administrador da sua igreja para obter as permissões necessárias.
          </p>
        </div>

        <div className="space-x-4">
          <Button asChild>
            <Link to="/dashboard">Voltar ao Dashboard</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/login">Fazer Login</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};
