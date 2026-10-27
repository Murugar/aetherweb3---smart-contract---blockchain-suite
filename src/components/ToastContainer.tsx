import React from 'react';
import { useWeb3 } from '../context/Web3Context';
import { CheckCircle2, AlertCircle, Info, X, ExternalLink } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useWeb3();

  if (toasts.length === 0) return null;

  return (
    <aside aria-label="System notifications" className="fixed bottom-4 right-4 z-50 flex flex-col gap-2.5 max-w-md w-full pointer-events-none">
      {toasts.map(toast => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-xl border backdrop-blur-md shadow-2xl flex items-start gap-3 transition-all transform animate-in slide-in-from-bottom-5 ${
              isSuccess 
                ? 'bg-slate-950/95 border-emerald-500/40 text-slate-100'
                : isError
                ? 'bg-slate-950/95 border-rose-500/40 text-slate-100'
                : 'bg-slate-950/95 border-cyan-500/40 text-slate-100'
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              {isError && <AlertCircle className="w-5 h-5 text-rose-400" />}
              {!isSuccess && !isError && <Info className="w-5 h-5 text-cyan-400" />}
            </div>

            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-white tracking-wide">
                {toast.title}
              </div>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed break-words">
                {toast.message}
              </p>
              {toast.txHash && (
                <div className="mt-2 flex items-center gap-1.5 text-[11px] font-mono text-cyan-400">
                  <span>Tx: {toast.txHash.slice(0, 10)}...{toast.txHash.slice(-6)}</span>
                </div>
              )}
            </div>

            <button
              onClick={() => dismissToast(toast.id)}
              className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </aside>
  );
};
