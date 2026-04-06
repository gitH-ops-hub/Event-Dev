import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '@/App';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  UserPlus, 
  CheckCircle2,
  Download,
  Mail
} from 'lucide-react';
import { toast } from 'sonner';

const WalkInPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [lastRegistration, setLastRegistration] = useState(null);
  
  const [formData, setFormData] = useState({
    event_id: '',
    first_name: '',
    last_name: '',
    nationality: '',
    email: '',
    notes: '',
    custom_fields: {}
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${API}/events?active_only=true`);
      setEvents(response.data);
      if (response.data.length > 0) {
        setFormData(prev => ({ ...prev, event_id: response.data[0].id }));
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const response = await axios.post(`${API}/registrations/walk-in`, formData);
      setLastRegistration(response.data);
      toast.success('Walk-in registered successfully');
      
      // Reset form but keep event selected
      setFormData(prev => ({
        event_id: prev.event_id,
        first_name: '',
        last_name: '',
        nationality: '',
        email: '',
        notes: '',
        custom_fields: {}
      }));
    } catch (error) {
      console.error('Error registering walk-in:', error);
      const message = error.response?.data?.detail || 'Failed to register';
      toast.error(typeof message === 'string' ? message : 'Failed to register');
    } finally {
      setSubmitting(false);
    }
  };

  const downloadTicket = async () => {
    if (!lastRegistration) return;
    
    try {
      const response = await axios.get(`${API}/registrations/${lastRegistration.id}/pdf`);
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
      link.download = `ticket_${lastRegistration.code}.pdf`;
      link.click();
      
      toast.success('Ticket downloaded');
    } catch (error) {
      console.error('Error downloading ticket:', error);
      toast.error('Failed to download ticket');
    }
  };

  const sendEmail = async () => {
    if (!lastRegistration || !lastRegistration.email) return;
    
    try {
      await axios.post(`${API}/send-ticket-email`, {
        registration_id: lastRegistration.id,
        recipient_email: lastRegistration.email
      });
      toast.success(`Ticket sent to ${lastRegistration.email}`);
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('Failed to send email');
    }
  };

  const selectedEvent = events.find(e => e.id === formData.event_id);

  if (loading) {
    return (
      <AdminLayout title="Walk-in Registration">
        <div className="flex items-center justify-center h-64">
          <div className="spinner w-8 h-8"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Walk-in Registration">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Registration Form */}
        <div className="card-sharp p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-100 text-green-700">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Register Walk-in Guest</h2>
              <p className="text-sm text-zinc-500">For guests, recommendations, or on-site registrations</p>
            </div>
          </div>

          {events.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-zinc-500">No active events available</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="event_id">Event *</Label>
                <Select 
                  value={formData.event_id} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, event_id: value }))}
                >
                  <SelectTrigger className="mt-1" data-testid="walkin-event-select">
                    <SelectValue placeholder="Select event" />
                  </SelectTrigger>
                  <SelectContent>
                    {events.map((event) => (
                      <SelectItem key={event.id} value={event.id}>
                        {event.name} ({event.date})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first_name">First Name *</Label>
                  <Input
                    id="first_name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    required
                    className="mt-1"
                    data-testid="walkin-firstname-input"
                  />
                </div>
                <div>
                  <Label htmlFor="last_name">Last Name *</Label>
                  <Input
                    id="last_name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    required
                    className="mt-1"
                    data-testid="walkin-lastname-input"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="nationality">Nationality *</Label>
                <Input
                  id="nationality"
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleChange}
                  required
                  className="mt-1"
                  data-testid="walkin-nationality-input"
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email (Optional)</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1"
                  data-testid="walkin-email-input"
                />
              </div>
              
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Recommended by, guest of, or any other notes..."
                  rows={3}
                  className="mt-1"
                  data-testid="walkin-notes-input"
                />
              </div>

              {/* Custom Fields from Event */}
              {selectedEvent?.custom_fields?.map((field) => (
                <div key={field.id}>
                  <Label htmlFor={field.name}>
                    {field.label} {field.required && '*'}
                  </Label>
                  {field.field_type === 'select' ? (
                    <Select
                      value={formData.custom_fields[field.name] || ''}
                      onValueChange={(value) => setFormData(prev => ({
                        ...prev,
                        custom_fields: { ...prev.custom_fields, [field.name]: value }
                      }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder={field.placeholder || `Select ${field.label}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options?.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : field.field_type === 'textarea' ? (
                    <Textarea
                      id={field.name}
                      value={formData.custom_fields[field.name] || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        custom_fields: { ...prev.custom_fields, [field.name]: e.target.value }
                      }))}
                      placeholder={field.placeholder}
                      required={field.required}
                      className="mt-1"
                    />
                  ) : (
                    <Input
                      id={field.name}
                      type={field.field_type}
                      value={formData.custom_fields[field.name] || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        custom_fields: { ...prev.custom_fields, [field.name]: e.target.value }
                      }))}
                      placeholder={field.placeholder}
                      required={field.required}
                      className="mt-1"
                    />
                  )}
                </div>
              ))}
              
              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                data-testid="walkin-submit-btn"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <div className="spinner w-4 h-4"></div>
                    Registering...
                  </span>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Register & Check-in
                  </>
                )}
              </Button>
            </form>
          )}
        </div>

        {/* Last Registration */}
        <div>
          {lastRegistration ? (
            <div className="card-sharp p-6 border-l-4 border-l-green-500 animate-slideUp">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
                <div>
                  <h3 className="text-lg font-bold text-green-700">Registration Complete</h3>
                  <p className="text-sm text-zinc-500">Guest is automatically checked in</p>
                </div>
              </div>
              
              <div className="bg-zinc-50 p-4 mb-4 space-y-2">
                <p>
                  <span className="text-zinc-500 text-sm">Name:</span><br />
                  <span className="font-semibold">
                    {lastRegistration.first_name} {lastRegistration.last_name}
                  </span>
                </p>
                <p>
                  <span className="text-zinc-500 text-sm">Code:</span><br />
                  <span className="font-mono text-lg font-bold">{lastRegistration.code}</span>
                </p>
                <p>
                  <span className="text-zinc-500 text-sm">Event:</span><br />
                  <span className="font-semibold">{lastRegistration.event?.name}</span>
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={downloadTicket}
                  variant="outline"
                  className="flex-1"
                  data-testid="walkin-download-btn"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Ticket
                </Button>
                {lastRegistration.email && (
                  <Button
                    onClick={sendEmail}
                    variant="outline"
                    className="flex-1"
                    data-testid="walkin-email-btn"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Email Ticket
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="card-sharp p-8 text-center bg-zinc-50">
              <UserPlus className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
              <p className="text-zinc-500">
                Register a walk-in guest to see their ticket here
              </p>
            </div>
          )}
          
          {/* Instructions */}
          <div className="card-sharp p-6 mt-6">
            <h3 className="font-bold mb-3">Walk-in Registration</h3>
            <ul className="space-y-2 text-sm text-zinc-600">
              <li className="flex items-start gap-2">
                <span className="text-green-600">•</span>
                Use this form for guests who arrive without prior registration
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600">•</span>
                Walk-ins are automatically marked as checked-in
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600">•</span>
                Add notes for recommended guests or VIPs
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600">•</span>
                Email is optional but allows sending the ticket
              </li>
            </ul>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default WalkInPage;
