import * as React from "react";
import { Button } from "./ui/Button";
import { AlertTriangle, RefreshCcw } from "lucide-react";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      let errorMessage = "Algo salió mal. Por favor, intenta de nuevo.";
      let isPermissionError = false;

      try {
        const parsedError = JSON.parse(this.state.error?.message || "{}");
        if (parsedError.error?.includes("Missing or insufficient permissions")) {
          errorMessage = "No tienes permisos para realizar esta acción o ver estos datos.";
          isPermissionError = true;
        }
      } catch (e) {
        // Not a JSON error
      }

      return (
        <div className="min-h-screen bg-brand-black flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-white/5 backdrop-blur-xl border border-white/10 p-12 rounded-[3rem] shadow-2xl">
            <div className="w-20 h-20 bg-brand-secondary/20 rounded-full flex items-center justify-center mx-auto mb-8">
              <AlertTriangle className="w-10 h-10 text-brand-secondary" />
            </div>
            <h2 className="text-3xl font-heading font-black uppercase tracking-tighter text-white mb-4">
              {isPermissionError ? "Acceso Restringido" : "Error Inesperado"}
            </h2>
            <p className="text-gray-400 font-sans mb-10 leading-relaxed">
              {errorMessage}
            </p>
            <Button 
              onClick={this.handleReset}
              className="w-full bg-brand-primary text-brand-black hover:bg-white rounded-2xl py-6 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3"
            >
              <RefreshCcw className="w-4 h-4" />
              Recargar Aplicación
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
