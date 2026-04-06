import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { API } from '@/App';
import { Button } from '@/components/ui/button';
import { QRCodeSVG } from 'qrcode.react';
import Barcode from 'react-barcode';
import { 
  Calendar, 
  MapPin, 
  Clock,
  Download,
  Mail,
  Share2,
  CheckCircle2,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';

const TicketPage = () => {
  const { registrationId } = useParams();
  
  const [registration, setRegistration] = useState(null);
  const [branding, setBranding] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [emailing, setEmailing] = useState(false);

  useEffect(() => {
    fetchData();
  }, [registrationId]);

  const fetchData = async () => {
    try {
      const [regRes, brandingRes] = await Promise.all([
        axios.get(`${API}/registrations/${registrationId}`),
        axios.get(`${API}/branding`)
      ]);
      setRegistration(regRes.data);
      setBranding(brandingRes.data);
    } catch (error) {
      console.error('Error fetching registration:', error);
      setError('Registration not found');
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    setDownloading(true);
    try {
      const response = await axios.get(`${API}/registrations/${registrationId}/pdf`);
      const pdfData = response.data.pdf;
      
      const byteCharacters = atob(pdfData);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `ticket_${registration.code}.pdf`;
      link.click();
      
      toast.success('Ticket downloaded successfully');
    } catch (error) {
      console.error('Error downloading ticket:', error);
      toast.error('Failed to download ticket');
    } finally {
      setDownloading(false);
    }
  };

  const sendEmail = async () => {
    setEmailing(true);
    try {
      const response = await axios.post(`${API}/send-ticket-email`, {
        registration_id: registrationId,
        recipient_email: registration.email
      });
      
      if (response.data.status === 'success') {
        toast.success(`Ticket sent to ${registration.email}`);
      } else {
        toast.error(response.data.message || 'Failed to send email');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('Failed to send email');
    } finally {
      setEmailing(false);
    }
  };

  const shareTicket = async () => {
    const shareData = {
      title: `Ticket for ${registration.event?.name}`,
      text: `My registration code: ${registration.code}`,
      url: window.location.href
    };
    
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error sharing:', error);
        }
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="spinner w-8 h-8"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-zinc-900 mb-2">Ticket Not Found</h2>
          <p className="text-zinc-500 mb-6">{error}</p>
          <Link to="/">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Events
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const event = registration.event;

  return (
    <div className="min-h-screen bg-zinc-50 py-8 px-6">
      <div className="max-w-lg mx-auto">
        {/* Success Banner */}
        <div className="flex items-center gap-3 mb-6 p-4 bg-green-50 border border-green-200 animate-fadeIn">
          <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
          <div>
            <p className="font-semibold text-green-800">Registration Successful!</p>
            <p className="text-sm text-green-700">Your ticket is ready</p>
          </div>
        </div>

        {/* Ticket Card */}
        <div className="ticket-container shadow-xl animate-slideUp" data-testid="ticket-card">
          {/* Header */}
          <div 
            className="ticket-header text-center"
            style={{ backgroundColor: branding?.primary_color || '#0A0A0A' }}
          >
            {branding?.logo_url && (
              <img 
                src={branding.logo_url} 
                alt="Logo" 
                className="h-10 mx-auto mb-2 object-contain"
                onError={(e) => e.target.style.display = 'none'}
              />
            )}
            <h2 className="text-xl font-black">
              {branding?.company_name || 'Event Manager'}
            </h2>
            {branding?.tagline && (
              <p className="text-sm opacity-80">{branding.tagline}</p>
            )}
          </div>

          {/* Event Info */}
          <div className="p-6 border-b border-dashed border-zinc-200">
            <p className="text-xs uppercase tracking-widest text-zinc-500 mb-1">Event Ticket</p>
            <h3 className="text-xl font-bold text-zinc-900 mb-4">{event?.name}</h3>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-zinc-600">
                <Calendar className="w-4 h-4 text-zinc-400" />
                <span>{event?.date}</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-600">
                <Clock className="w-4 h-4 text-zinc-400" />
                <span>{event?.time}</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-600 col-span-2">
                <MapPin className="w-4 h-4 text-zinc-400" />
                <span>{event?.location}</span>
              </div>
            </div>
          </div>

          {/* Attendee Info */}
          <div className="p-6 border-b border-dashed border-zinc-200">
            <p className="text-xs uppercase tracking-widest text-zinc-500 mb-2">Attendee</p>
            <p className="text-lg font-bold text-zinc-900">
              {registration.first_name} {registration.last_name}
            </p>
            <p className="text-sm text-zinc-600">{registration.email}</p>
            <p className="text-sm text-zinc-500">{registration.nationality}</p>
          </div>

          {/* Registration Code */}
          <div className="p-6 border-b border-zinc-200 text-center bg-zinc-50">
            <p className="text-xs uppercase tracking-widest text-zinc-500 mb-2">Registration Code</p>
            <p className="text-2xl font-mono font-black tracking-wider text-zinc-900" data-testid="registration-code">
              {registration.code}
            </p>
          </div>

          {/* QR Code and Barcode */}
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              {/* QR Code */}
              <div className="text-center">
                <p className="text-xs uppercase tracking-widest text-zinc-500 mb-3">Mobile Scan</p>
                <div className="bg-white p-3 inline-block border border-zinc-200">
                  <QRCodeSVG 
                    value={registration.code} 
                    size={100}
                    level="H"
                    data-testid="qr-code"
                  />
                </div>
              </div>
              
              {/* Barcode */}
              <div className="text-center">
                <p className="text-xs uppercase tracking-widest text-zinc-500 mb-3">Scanner</p>
                <div className="bg-white p-2 border border-zinc-200 overflow-hidden">
                  <Barcode 
                    value={registration.code}
                    width={1.2}
                    height={50}
                    fontSize={10}
                    margin={0}
                    displayValue={false}
                    data-testid="barcode"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 space-y-3">
          <Button
            onClick={downloadPDF}
            disabled={downloading}
            className="w-full h-12 bg-[#0055FF] hover:bg-[#0044CC] text-white font-semibold"
            data-testid="download-pdf-btn"
          >
            {downloading ? (
              <span className="flex items-center gap-2">
                <div className="spinner w-4 h-4"></div>
                Generating PDF...
              </span>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Download PDF Ticket
              </>
            )}
          </Button>
          
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={sendEmail}
              disabled={emailing}
              variant="outline"
              className="h-12"
              data-testid="email-ticket-btn"
            >
              {emailing ? (
                <div className="spinner w-4 h-4"></div>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </>
              )}
            </Button>
            
            <Button
              onClick={shareTicket}
              variant="outline"
              className="h-12"
              data-testid="share-ticket-btn"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 p-4 bg-white border border-zinc-200 text-sm text-zinc-600">
          <p className="font-semibold text-zinc-900 mb-2">Important:</p>
          <ul className="space-y-1">
            <li>• Present this ticket at the venue entrance</li>
            <li>• Save the PDF for offline access</li>
            <li>• The barcode can be scanned by handheld devices</li>
            <li>• The QR code works with smartphone cameras</li>
          </ul>
        </div>

        {/* Back Link */}
        <div className="mt-6 text-center">
          <Link to="/" className="text-sm text-[#0055FF] hover:underline">
            ← Back to Events
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TicketPage;
