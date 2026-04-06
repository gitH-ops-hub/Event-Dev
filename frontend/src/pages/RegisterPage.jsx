import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { API } from '@/App';
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
  Calendar, 
  MapPin, 
  Clock, 
  Users,
  ArrowLeft,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';

const RegisterPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  
  const [event, setEvent] = useState(null);
  const [branding, setBranding] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    nationality: '',
    email: '',
    custom_fields: {}
  });

  useEffect(() => {
    fetchData();
  }, [eventId]);

  const fetchData = async () => {
    try {
      const [eventRes, brandingRes] = await Promise.all([
        axios.get(`${API}/events/${eventId}`),
        axios.get(`${API}/branding`)
      ]);
      setEvent(eventRes.data);
      setBranding(brandingRes.data);
    } catch (error) {
      console.error('Error fetching event:', error);
      setError('Event not found');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCustomFieldChange = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      custom_fields: { ...prev.custom_fields, [fieldName]: value }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    
    try {
      const response = await axios.post(`${API}/registrations`, {
        event_id: eventId,
        ...formData
      });
      
      toast.success('Registration successful!');
      navigate(`/ticket/${response.data.id}`);
    } catch (err) {
      console.error('Error registering:', err);
      const detail = err.response?.data?.detail;
      if (typeof detail === 'string') {
        setError(detail);
      } else if (Array.isArray(detail)) {
        setError(detail.map(e => e.msg || JSON.stringify(e)).join(' '));
      } else {
        setError('Registration failed. Please try again.');
      }
      toast.error('Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="spinner w-8 h-8"></div>
      </div>
    );
  }

  if (error && !event) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-zinc-900 mb-2">Event Not Found</h2>
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

  const isFull = (event?.registration_count || 0) >= event?.max_registrations;

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 py-4 px-6">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-zinc-600 hover:text-zinc-900">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Events</span>
          </Link>
          <span className="text-sm font-bold text-zinc-900">
            {branding?.company_name || 'Event Manager'}
          </span>
        </div>
      </header>

      <div className="max-w-3xl mx-auto py-8 px-6">
        {/* Event Info */}
        <div className="card-sharp p-6 mb-6">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 mb-4">
            {event.name}
          </h1>
          
          {event.description && (
            <p className="text-zinc-600 mb-4">{event.description}</p>
          )}
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2 text-zinc-600">
              <Calendar className="w-4 h-4 text-zinc-400" />
              <span>{event.date}</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-600">
              <Clock className="w-4 h-4 text-zinc-400" />
              <span>{event.time}</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-600">
              <MapPin className="w-4 h-4 text-zinc-400" />
              <span>{event.location}</span>
            </div>
          </div>
          
          <div className="mt-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-zinc-400" />
            <span className={`text-sm font-medium ${isFull ? 'text-red-600' : 'text-green-600'}`}>
              {event.registration_count || 0} / {event.max_registrations} spots filled
            </span>
          </div>
        </div>

        {/* Registration Form */}
        {isFull ? (
          <div className="card-sharp p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-zinc-900 mb-2">Registration Closed</h2>
            <p className="text-zinc-500">
              This event has reached maximum capacity. Please check back for future events.
            </p>
          </div>
        ) : !event.is_active ? (
          <div className="card-sharp p-8 text-center">
            <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-zinc-900 mb-2">Registration Unavailable</h2>
            <p className="text-zinc-500">
              Registration for this event is currently closed.
            </p>
          </div>
        ) : (
          <div className="card-sharp p-6">
            <h2 className="text-lg font-bold mb-6">Registration Form</h2>
            
            {error && (
              <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 text-red-700 text-sm mb-6" data-testid="registration-error">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first_name">First Name *</Label>
                  <Input
                    id="first_name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    required
                    className="mt-1"
                    data-testid="register-firstname-input"
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
                    data-testid="register-lastname-input"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="mt-1"
                  data-testid="register-email-input"
                />
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
                  data-testid="register-nationality-input"
                />
              </div>

              {/* Custom Fields */}
              {event.custom_fields?.map((field) => (
                <div key={field.id}>
                  <Label htmlFor={field.name}>
                    {field.label} {field.required && '*'}
                  </Label>
                  {field.field_type === 'select' ? (
                    <Select
                      value={formData.custom_fields[field.name] || ''}
                      onValueChange={(value) => handleCustomFieldChange(field.name, value)}
                    >
                      <SelectTrigger className="mt-1" data-testid={`register-custom-${field.name}`}>
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
                      onChange={(e) => handleCustomFieldChange(field.name, e.target.value)}
                      placeholder={field.placeholder}
                      required={field.required}
                      className="mt-1"
                      data-testid={`register-custom-${field.name}`}
                    />
                  ) : (
                    <Input
                      id={field.name}
                      type={field.field_type}
                      value={formData.custom_fields[field.name] || ''}
                      onChange={(e) => handleCustomFieldChange(field.name, e.target.value)}
                      placeholder={field.placeholder}
                      required={field.required}
                      className="mt-1"
                      data-testid={`register-custom-${field.name}`}
                    />
                  )}
                </div>
              ))}

              <Button
                type="submit"
                disabled={submitting}
                className="w-full h-12 bg-[#0055FF] hover:bg-[#0044CC] text-white text-base font-semibold"
                data-testid="register-submit-btn"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <div className="spinner w-4 h-4"></div>
                    Registering...
                  </span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Complete Registration
                  </>
                )}
              </Button>
            </form>
          </div>
        )}

        {/* Guidelines */}
        {event.guidelines && (
          <div className="card-sharp p-6 mt-6 bg-zinc-50">
            <h3 className="font-bold mb-3">Entry Guidelines</h3>
            <ul className="space-y-2 text-sm text-zinc-600">
              {event.guidelines.split('\n').filter(g => g.trim()).map((guideline, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-[#0055FF]">•</span>
                  <span>{guideline}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegisterPage;
