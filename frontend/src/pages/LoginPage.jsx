import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/App';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, Mail, AlertCircle } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || '/admin';

  // Redirect if already logged in
  React.useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (typeof detail === 'string') {
        setError(detail);
      } else if (Array.isArray(detail)) {
        setError(detail.map(e => e.msg || JSON.stringify(e)).join(' '));
      } else {
        setError('Invalid credentials');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md animate-fadeIn">
          <div className="mb-12">
            <h1 className="text-4xl font-black tracking-tighter text-zinc-900 mb-2">
              Admin Login
            </h1>
            <p className="text-zinc-500 text-base">
              Sign in to manage your events
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 text-red-700 text-sm" data-testid="login-error">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-zinc-700">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 border-zinc-200 focus:border-[#0055FF] focus:ring-[#0055FF]"
                  placeholder="admin@example.com"
                  required
                  data-testid="login-email-input"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold text-zinc-700">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-12 border-zinc-200 focus:border-[#0055FF] focus:ring-[#0055FF]"
                  placeholder="Enter your password"
                  required
                  data-testid="login-password-input"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-[#0055FF] hover:bg-[#0044CC] text-white font-semibold text-base"
              data-testid="login-submit-btn"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="spinner w-4 h-4"></div>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
        </div>
      </div>

      {/* Right Panel - Branding */}
      <div className="hidden lg:flex flex-1 bg-zinc-900 items-center justify-center p-12">
        <div className="max-w-lg text-white">
          <h2 className="text-5xl font-black tracking-tighter mb-6">
            Event<br />Manager
          </h2>
          <p className="text-zinc-400 text-lg leading-relaxed">
            Create events, manage registrations, generate tickets with QR codes and barcodes, 
            and verify attendees at the venue.
          </p>
          <div className="mt-12 grid grid-cols-2 gap-6 text-sm">
            <div className="p-4 border border-zinc-800">
              <div className="text-2xl font-bold text-[#0055FF] mb-1">QR + Barcode</div>
              <div className="text-zinc-500">Dual scanning support</div>
            </div>
            <div className="p-4 border border-zinc-800">
              <div className="text-2xl font-bold text-[#0055FF] mb-1">PDF Tickets</div>
              <div className="text-zinc-500">Download & email</div>
            </div>
            <div className="p-4 border border-zinc-800">
              <div className="text-2xl font-bold text-[#0055FF] mb-1">Walk-ins</div>
              <div className="text-zinc-500">On-site registration</div>
            </div>
            <div className="p-4 border border-zinc-800">
              <div className="text-2xl font-bold text-[#0055FF] mb-1">Custom Fields</div>
              <div className="text-zinc-500">Flexible forms</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
