import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      let errorMessage = "Une erreur inattendue s'est produite.";
      let isFirebaseError = false;

      try {
        if (this.state.error?.message) {
          const parsed = JSON.parse(this.state.error.message);
          if (parsed.error && parsed.operationType) {
            errorMessage = `Erreur de base de données : ${parsed.error}`;
            isFirebaseError = true;
          }
        }
      } catch (e) {
        errorMessage = this.state.error?.message || errorMessage;
      }

      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 p-6 text-zinc-900">
          <Card className="w-full max-w-md p-8 text-center shadow-2xl shadow-zinc-200">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-red-100 text-red-600">
              <AlertTriangle className="h-10 w-10" />
            </div>
            <h1 className="mb-2 text-2xl font-black tracking-tight text-zinc-900">Oups ! Quelque chose a mal tourné.</h1>
            <p className="mb-8 text-sm text-zinc-500">{errorMessage}</p>

            {isFirebaseError && (
              <div className="mb-8 rounded-2xl bg-red-50 p-4 text-left text-xs text-red-700">
                <p className="font-bold uppercase tracking-wider mb-1">Détails techniques :</p>
                <p>Vérifiez vos permissions Firebase ou votre connexion internet.</p>
              </div>
            )}

            <div className="flex flex-col space-y-3">
              <Button onClick={this.handleReset} className="w-full">
                <RefreshCw className="mr-2 h-4 w-4" />
                Réessayer
              </Button>
              <Button variant="outline" onClick={() => (window.location.href = '/')} className="w-full">
                <Home className="mr-2 h-4 w-4" />
                Retour à l'accueil
              </Button>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
