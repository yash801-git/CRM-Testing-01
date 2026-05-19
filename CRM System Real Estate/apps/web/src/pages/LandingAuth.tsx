import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Users, ArrowRight, Building2 } from 'lucide-react';

const LandingAuth: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="w-full max-w-lg relative z-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="bg-blue-600 p-3 rounded-2xl shadow-2xl shadow-blue-600/40 mb-4 rotate-3">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter">
            Estate<span className="text-blue-400">Sync</span>
          </h1>
          <p className="text-slate-400 text-sm font-medium mt-1">Real Estate CRM Platform</p>
        </div>

        {/* Role Selector */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <h2 className="text-xl font-black text-white text-center mb-2">Welcome Back</h2>
          <p className="text-slate-400 text-center text-sm font-medium mb-8">Please select your role to continue</p>

          <div className="grid grid-cols-2 gap-4">
            {/* Broker */}
            <button
              onClick={() => navigate('/login/broker')}
              className="group flex flex-col items-center gap-4 p-6 bg-white/5 hover:bg-blue-600/20 border border-white/10 hover:border-blue-500/50 rounded-2xl transition-all duration-300 hover:scale-[1.03] hover:shadow-xl hover:shadow-blue-500/10 text-left"
            >
              <div className="h-14 w-14 rounded-2xl bg-blue-600/20 text-blue-400 group-hover:bg-blue-600/40 flex items-center justify-center transition-colors duration-300 shadow-inner">
                <Briefcase className="h-6 w-6" />
              </div>
              <div>
                <p className="text-white font-black text-sm text-center">Broker</p>
                <p className="text-slate-400 text-xs font-medium text-center mt-0.5">Admin access</p>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-blue-400 transition-colors opacity-0 group-hover:opacity-100 self-end" />
            </button>

            {/* Agent */}
            <button
              onClick={() => navigate('/login/agent')}
              className="group flex flex-col items-center gap-4 p-6 bg-white/5 hover:bg-indigo-600/20 border border-white/10 hover:border-indigo-500/50 rounded-2xl transition-all duration-300 hover:scale-[1.03] hover:shadow-xl hover:shadow-indigo-500/10 text-left"
            >
              <div className="h-14 w-14 rounded-2xl bg-indigo-600/20 text-indigo-400 group-hover:bg-indigo-600/40 flex items-center justify-center transition-colors duration-300 shadow-inner">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-white font-black text-sm text-center">Agent</p>
                <p className="text-slate-400 text-xs font-medium text-center mt-0.5">Staff access</p>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-indigo-400 transition-colors opacity-0 group-hover:opacity-100 self-end" />
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="text-slate-400 text-sm">
              New to EstateSync?{" "}
              <button onClick={() => navigate('/register')} className="text-blue-400 font-bold hover:text-blue-300 transition-colors">
                Register as Broker
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingAuth;
