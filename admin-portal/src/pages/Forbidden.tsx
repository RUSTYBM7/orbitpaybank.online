/**
 * /403 Forbidden page — shown by RequireAuth when an authenticated admin
 * tries to access a route they don't have permission for.
 */

import { Link } from 'react-router-dom';
import { ShieldOff, ArrowLeft } from 'lucide-react';

export default function Forbidden() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center mb-6">
          <ShieldOff className="w-8 h-8 text-rose-400" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Access denied</h1>
        <p className="text-slate-400 mb-8">
          You don't have permission to view this page. Contact your administrator
          if you believe this is a mistake.
        </p>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}