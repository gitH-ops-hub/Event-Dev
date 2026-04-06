import React, { useState, useEffect } from 'react';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Download,
  Mail,
  UserCheck,
  Clock,
  Users
} from 'lucide-react';
import { toast } from 'sonner';

const RegistrationsPage = () => {
  const [registrations, setRegistrations] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [regsRes, eventsRes] = await Promise.all([
        axios.get(`${API}/registrations`),
        axios.get(`${API}/events`)
      ]);
      setRegistrations(regsRes.data);
      setEvents(eventsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load registrations');
    } finally {
      setLoading(false);
    }
  };

  const filteredRegistrations = registrations.filter(reg => {
    // Event filter
    if (selectedEvent !== 'all' && reg.event_id !== selectedEvent) return false;
    
    // Status filter
    if (filterStatus === 'checked_in' && !reg.checked_in) return false;
    if (filterStatus === 'pending' && reg.checked_in) return false;
    if (filterStatus === 'walk_in' && !reg.is_walk_in) return false;
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const fullName = `${reg.first_name} ${reg.last_name}`.toLowerCase();
      if (!fullName.includes(query) && !reg.email.toLowerCase().includes(query) && !reg.code.toLowerCase().includes(query)) {
        return false;
      }
    }
    
    return true;
  });

  const downloadTicket = async (regId, code) => {
    try {
      const response = await axios.get(`${API}/registrations/${regId}/pdf`);
      const pdfData = response.data.pdf;
      
      // Convert base64 to blob and download
      const byteCharacters = atob(pdfData);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `ticket_${code}.pdf`;
      link.click();
      
      toast.success('Ticket downloaded');
    } catch (error) {
      console.error('Error downloading ticket:', error);
      toast.error('Failed to download ticket');
    }
  };

  const sendEmail = async (regId, email) => {
    try {
      await axios.post(`${API}/send-ticket-email`, {
        registration_id: regId,
        recipient_email: email
      });
      toast.success(`Ticket sent to ${email}`);
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('Failed to send email');
    }
  };

  const getEventName = (eventId) => {
    const event = events.find(e => e.id === eventId);
    return event?.name || 'Unknown Event';
  };

  if (loading) {
    return (
      <AdminLayout title="Registrations">
        <div className="flex items-center justify-center h-64">
          <div className="spinner w-8 h-8"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Registrations">
      {/* Filters */}
      <div className="card-sharp p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <Input
                placeholder="Search by name, email, or code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="search-registrations-input"
              />
            </div>
          </div>
          
          <div className="flex gap-4">
            <Select value={selectedEvent} onValueChange={setSelectedEvent}>
              <SelectTrigger className="w-[200px]" data-testid="filter-event-select">
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
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[150px]" data-testid="filter-status-select">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="checked_in">Checked In</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="walk_in">Walk-ins</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="card-sharp p-4">
          <div className="flex items-center gap-2 text-zinc-500 text-sm mb-1">
            <Users className="w-4 h-4" />
            Total
          </div>
          <div className="text-2xl font-bold">{filteredRegistrations.length}</div>
        </div>
        <div className="card-sharp p-4">
          <div className="flex items-center gap-2 text-green-600 text-sm mb-1">
            <UserCheck className="w-4 h-4" />
            Checked In
          </div>
          <div className="text-2xl font-bold">
            {filteredRegistrations.filter(r => r.checked_in).length}
          </div>
        </div>
        <div className="card-sharp p-4">
          <div className="flex items-center gap-2 text-orange-600 text-sm mb-1">
            <Clock className="w-4 h-4" />
            Pending
          </div>
          <div className="text-2xl font-bold">
            {filteredRegistrations.filter(r => !r.checked_in).length}
          </div>
        </div>
        <div className="card-sharp p-4">
          <div className="flex items-center gap-2 text-blue-600 text-sm mb-1">
            <Users className="w-4 h-4" />
            Walk-ins
          </div>
          <div className="text-2xl font-bold">
            {filteredRegistrations.filter(r => r.is_walk_in).length}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card-sharp overflow-hidden">
        {filteredRegistrations.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
            <p className="text-zinc-500">No registrations found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table className="table-sharp">
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRegistrations.map((reg) => (
                  <TableRow key={reg.id} data-testid={`registration-row-${reg.id}`}>
                    <TableCell className="font-mono text-sm font-bold">
                      {reg.code}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{reg.first_name} {reg.last_name}</p>
                        <p className="text-xs text-zinc-500">{reg.nationality}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-zinc-600">
                      {reg.email || '-'}
                    </TableCell>
                    <TableCell className="text-sm">
                      {getEventName(reg.event_id)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {reg.checked_in ? (
                          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                            Checked In
                          </Badge>
                        ) : (
                          <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">
                            Pending
                          </Badge>
                        )}
                        {reg.is_walk_in && (
                          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                            Walk-in
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => downloadTicket(reg.id, reg.code)}
                          title="Download Ticket"
                          data-testid={`download-ticket-${reg.id}`}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        {reg.email && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => sendEmail(reg.id, reg.email)}
                            title="Send Email"
                            data-testid={`email-ticket-${reg.id}`}
                          >
                            <Mail className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default RegistrationsPage;
