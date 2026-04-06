import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API } from '@/App';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  Calendar, 
  MapPin, 
  Users, 
  Clock,
  Edit,
  Trash2,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${API}/events`);
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    
    try {
      await axios.delete(`${API}/events/${deleteId}`);
      setEvents(events.filter(e => e.id !== deleteId));
      toast.success('Event deleted successfully');
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    } finally {
      setDeleteId(null);
    }
  };

  const copyRegistrationLink = (eventId) => {
    const link = `${window.location.origin}/event/${eventId}`;
    navigator.clipboard.writeText(link);
    setCopiedId(eventId);
    toast.success('Registration link copied!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) {
    return (
      <AdminLayout title="Events">
        <div className="flex items-center justify-center h-64">
          <div className="spinner w-8 h-8"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Events">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <p className="text-zinc-500">
          {events.length} event{events.length !== 1 ? 's' : ''} total
        </p>
        <Link to="/admin/events/new">
          <Button className="bg-[#0055FF] hover:bg-[#0044CC] text-white" data-testid="create-event-btn">
            <Plus className="w-4 h-4 mr-2" />
            Create Event
          </Button>
        </Link>
      </div>

      {/* Events Grid */}
      {events.length === 0 ? (
        <div className="card-sharp p-12 text-center">
          <Calendar className="w-16 h-16 text-zinc-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-zinc-900 mb-2">No events yet</h3>
          <p className="text-zinc-500 mb-6">Create your first event to start accepting registrations</p>
          <Link to="/admin/events/new">
            <Button className="bg-[#0055FF] hover:bg-[#0044CC] text-white" data-testid="create-first-event-btn">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Event
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((event, index) => (
            <div
              key={event.id}
              className="card-sharp overflow-hidden stagger-item"
              style={{ animationDelay: `${index * 50}ms` }}
              data-testid={`event-card-${event.id}`}
            >
              {/* Status Banner */}
              <div className={`px-4 py-2 text-xs font-bold uppercase tracking-wider ${
                event.is_active 
                  ? 'bg-green-50 text-green-700' 
                  : 'bg-zinc-100 text-zinc-500'
              }`}>
                {event.is_active ? 'Active' : 'Inactive'}
              </div>
              
              <div className="p-5">
                <h3 className="text-lg font-bold text-zinc-900 mb-3 line-clamp-1">
                  {event.name}
                </h3>
                
                <div className="space-y-2 text-sm text-zinc-600 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-zinc-400" />
                    <span>{event.date}</span>
                  </div>
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
                      {event.registration_count || 0} / {event.max_registrations} registrations
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-4 border-t border-zinc-100">
                  <Link to={`/admin/events/${event.id}/edit`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full" data-testid={`edit-event-${event.id}`}>
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                  </Link>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyRegistrationLink(event.id)}
                    data-testid={`copy-link-${event.id}`}
                  >
                    {copiedId === event.id ? (
                      <Check className="w-3 h-3 text-green-600" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </Button>
                  
                  <a
                    href={`/event/${event.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm" data-testid={`view-event-${event.id}`}>
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </a>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeleteId(event.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    data-testid={`delete-event-${event.id}`}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this event? This will also delete all registrations 
              associated with this event. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
              data-testid="confirm-delete-btn"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default EventsPage;
