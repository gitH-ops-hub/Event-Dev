import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { API } from '@/App';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  QrCode, 
  Camera,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RotateCcw,
  Keyboard
} from 'lucide-react';
import { toast } from 'sonner';

const ScannerPage = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('all');
  const [scanInput, setScanInput] = useState('');
  const [lastResult, setLastResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('keyboard'); // keyboard or camera
  const inputRef = useRef(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    // Auto-focus input when in keyboard mode
    if (mode === 'keyboard' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [mode]);

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${API}/events`);
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const handleScan = async (code) => {
    if (!code.trim()) return;
    
    setLoading(true);
    setLastResult(null);
    
    try {
      const payload = {
        code: code.trim().toUpperCase()
      };
      
      if (selectedEvent !== 'all') {
        payload.event_id = selectedEvent;
      }
      
      const response = await axios.post(`${API}/verify`, payload);
      setLastResult(response.data);
      
      if (response.data.valid) {
        if (response.data.already_checked_in) {
          toast.warning('Already checked in!');
        } else {
          toast.success('Check-in successful!');
        }
      } else {
        toast.error('Invalid code');
      }
    } catch (error) {
      console.error('Error verifying:', error);
      setLastResult({
        valid: false,
        message: error.response?.data?.detail || 'Verification failed'
      });
      toast.error('Verification failed');
    } finally {
      setLoading(false);
      setScanInput('');
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleScan(scanInput);
    }
  };

  const resetResult = () => {
    setLastResult(null);
    setScanInput('');
    inputRef.current?.focus();
  };

  return (
    <AdminLayout title="Scanner">
      <div className="max-w-2xl mx-auto">
        {/* Event Filter */}
        <div className="card-sharp p-4 mb-6">
          <label className="text-sm font-semibold text-zinc-700 mb-2 block">
            Filter by Event (Optional)
          </label>
          <Select value={selectedEvent} onValueChange={setSelectedEvent}>
            <SelectTrigger data-testid="scanner-event-select">
              <SelectValue placeholder="All Events" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              {events.map((event) => (
                <SelectItem key={event.id} value={event.id}>
                  {event.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Mode Toggle */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={mode === 'keyboard' ? 'default' : 'outline'}
            onClick={() => setMode('keyboard')}
            className={mode === 'keyboard' ? 'bg-[#0055FF] hover:bg-[#0044CC]' : ''}
            data-testid="keyboard-mode-btn"
          >
            <Keyboard className="w-4 h-4 mr-2" />
            Keyboard / Scanner
          </Button>
          <Button
            variant={mode === 'camera' ? 'default' : 'outline'}
            onClick={() => setMode('camera')}
            className={mode === 'camera' ? 'bg-[#0055FF] hover:bg-[#0044CC]' : ''}
            data-testid="camera-mode-btn"
          >
            <Camera className="w-4 h-4 mr-2" />
            Camera
          </Button>
        </div>

        {/* Scanner Input */}
        {mode === 'keyboard' && (
          <div className="card-sharp p-8 mb-6">
            <div className="text-center mb-6">
              <QrCode className="w-16 h-16 text-zinc-300 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Scan or Enter Code</h2>
              <p className="text-zinc-500 text-sm">
                Use a handheld barcode scanner or type the code manually
              </p>
            </div>
            
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={scanInput}
                onChange={(e) => setScanInput(e.target.value.toUpperCase())}
                onKeyDown={handleKeyDown}
                placeholder="Enter or scan code..."
                className="text-center text-lg font-mono tracking-wider h-14"
                autoFocus
                data-testid="scanner-input"
              />
              <Button
                onClick={() => handleScan(scanInput)}
                disabled={loading || !scanInput.trim()}
                className="bg-[#0055FF] hover:bg-[#0044CC] h-14 px-8"
                data-testid="verify-btn"
              >
                {loading ? (
                  <div className="spinner w-5 h-5"></div>
                ) : (
                  'Verify'
                )}
              </Button>
            </div>
            
            <p className="text-xs text-zinc-400 text-center mt-4">
              Handheld scanner input will be captured automatically
            </p>
          </div>
        )}

        {/* Camera Mode Placeholder */}
        {mode === 'camera' && (
          <div className="card-sharp p-8 mb-6">
            <div className="text-center">
              <div className="bg-zinc-900 aspect-video rounded-sm flex items-center justify-center mb-4 relative overflow-hidden">
                <Camera className="w-16 h-16 text-zinc-700" />
                <div className="absolute inset-0 scanner-overlay pointer-events-none"></div>
              </div>
              <p className="text-zinc-500 text-sm">
                Camera scanning feature requires HTTPS in production.
                <br />
                Use keyboard/scanner mode for now.
              </p>
            </div>
          </div>
        )}

        {/* Result Display */}
        {lastResult && (
          <div 
            className={`card-sharp p-6 mb-6 animate-slideUp ${
              lastResult.valid 
                ? lastResult.already_checked_in 
                  ? 'border-l-4 border-l-orange-500' 
                  : 'border-l-4 border-l-green-500'
                : 'border-l-4 border-l-red-500'
            }`}
            data-testid="scan-result"
          >
            <div className="flex items-start gap-4">
              {lastResult.valid ? (
                lastResult.already_checked_in ? (
                  <AlertCircle className="w-8 h-8 text-orange-500 flex-shrink-0" />
                ) : (
                  <CheckCircle2 className="w-8 h-8 text-green-500 flex-shrink-0" />
                )
              ) : (
                <XCircle className="w-8 h-8 text-red-500 flex-shrink-0" />
              )}
              
              <div className="flex-1">
                <h3 className={`text-lg font-bold mb-1 ${
                  lastResult.valid 
                    ? lastResult.already_checked_in 
                      ? 'text-orange-700' 
                      : 'text-green-700'
                    : 'text-red-700'
                }`}>
                  {lastResult.message}
                </h3>
                
                {lastResult.registration && (
                  <div className="mt-4 space-y-2 text-sm">
                    <p>
                      <span className="text-zinc-500">Name:</span>{' '}
                      <span className="font-semibold">
                        {lastResult.registration.first_name} {lastResult.registration.last_name}
                      </span>
                    </p>
                    <p>
                      <span className="text-zinc-500">Code:</span>{' '}
                      <span className="font-mono">{lastResult.registration.code}</span>
                    </p>
                    {lastResult.event && (
                      <p>
                        <span className="text-zinc-500">Event:</span>{' '}
                        <span className="font-semibold">{lastResult.event.name}</span>
                      </p>
                    )}
                    {lastResult.already_checked_in && lastResult.checked_in_at && (
                      <p>
                        <span className="text-zinc-500">Checked in at:</span>{' '}
                        <span>{new Date(lastResult.checked_in_at).toLocaleString()}</span>
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <Button
              variant="outline"
              onClick={resetResult}
              className="mt-4 w-full"
              data-testid="scan-again-btn"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Scan Another
            </Button>
          </div>
        )}

        {/* Instructions */}
        <div className="card-sharp p-6 bg-zinc-50">
          <h3 className="font-bold mb-3">Scanner Instructions</h3>
          <ul className="space-y-2 text-sm text-zinc-600">
            <li className="flex items-start gap-2">
              <span className="text-[#0055FF]">1.</span>
              Connect your handheld barcode scanner to this device
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#0055FF]">2.</span>
              Click on the input field to focus it
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#0055FF]">3.</span>
              Scan the barcode - input will be captured automatically
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#0055FF]">4.</span>
              Press Enter or click Verify to check-in the attendee
            </li>
          </ul>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ScannerPage;
