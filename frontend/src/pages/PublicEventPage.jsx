import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API } from '@/App';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users,
  ArrowRight,
  Ticket
} from 'lucide-react';

const PublicEventPage = () => {
  const [events, setEvents] = useState([]);
  const [branding, setBranding] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [eventsRes, brandingRes] = await Promise.all([
        axios.get(`${API}/events?active_only=true`),
        axios.get(`${API}/branding`)
      ]);
      setEvents(eventsRes.data);
      setBranding(brandingRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const isEventFull = (event) => {
    return (event.registration_count || 0) >= event.max_registrations;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="spinner w-8 h-8"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-zinc-200 py-4 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black tracking-tighter text-zinc-900">
              {branding?.company_name || 'Event Manager'}
            </h1>
            {branding?.tagline && (
              <p className="text-sm text-zinc-500">{branding.tagline}</p>
            )}
          </div>
          <Link to="/admin/login">
            <Button variant="ghost" size="sm" data-testid="admin-login-link">
              Admin
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-zinc-900 text-white py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl">
            <p className="text-xs font-bold tracking-widest uppercase text-zinc-500 mb-4">
              Upcoming Events
            </p>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tighter mb-4">
              Register for<br />Our Events
            </h2>
            <p className="text-zinc-400 text-lg">
              Browse our upcoming events and secure your spot. Get your digital ticket 
              with QR code and barcode for easy check-in.
            </p>
          </div>
        </div>
      </section>

      {/* Events List */}
      <section className="py-12 px-6">
        <div className="max-w-6xl mx-auto">
          {events.length === 0 ? (
            <div className="text-center py-16">
              <Ticket className="w-16 h-16 text-zinc-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-zinc-900 mb-2">No Events Available</h3>
              <p className="text-zinc-500">Check back later for upcoming events</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event, index) => (
                <div 
                  key={event.id}
                  className="card-sharp overflow-hidden stagger-item group"
                  style={{ animationDelay: `${index * 50}ms` }}
                  data-testid={`public-event-${event.id}`}
                >
                  {/* Date Banner */}
                  <div className="bg-zinc-900 text-white px-5 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-zinc-500">
                        {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
                      </p>
                      <p className="text-2xl font-black">
                        {new Date(event.date).getDate()}
                      </p>
                    </div>
                    {isEventFull(event) ? (
                      <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 uppercase">
                        Full
                      </span>
                    ) : (
                      <span className="bg-green-600 text-white text-xs font-bold px-2 py-1 uppercase">
                        Open
                      </span>
                    )}
                  </div>
                  
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-zinc-900 mb-3 group-hover:text-[#0055FF] transition-colors">
                      {event.name}
                    </h3>
                    
                    {event.description && (
                      <p className="text-sm text-zinc-600 mb-4 line-clamp-2">
                        {event.description}
                      </p>
                    )}
                    
                    <div className="space-y-2 text-sm text-zinc-600 mb-5">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-zinc-400" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-zinc-400" />
                        <span className="line-clamp-1">{event.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-zinc-400" />
                        <span>
                          {event.registration_count || 0} / {event.max_registrations} registered
                        </span>
                      </div>
                    </div>
                    
                    <Link to={`/event/${event.id}`}>
                      <Button 
                        className={`w-full ${
                          isEventFull(event) 
                            ? 'bg-zinc-300 text-zinc-500 cursor-not-allowed' 
                            : 'bg-[#0055FF] hover:bg-[#0044CC] text-white'
                        }`}
                        disabled={isEventFull(event)}
                        data-testid={`register-btn-${event.id}`}
                      >
                        {isEventFull(event) ? 'Registration Closed' : (
                          <>
                            Register Now
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </>
                        )}
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 py-8 px-6 mt-12">
        <div className="max-w-6xl mx-auto text-center text-sm text-zinc-500">
          <p>&copy; {new Date().getFullYear()} {branding?.company_name || 'Event Manager'}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default PublicEventPage;
