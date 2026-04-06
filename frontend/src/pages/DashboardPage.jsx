import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API } from '@/App';
import AdminLayout from '@/components/AdminLayout';
import { 
  Calendar, 
  Users, 
  UserCheck, 
  Clock, 
  ArrowRight,
  Plus,
  TrendingUp
} from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, color = "blue" }) => {
  const colorClasses = {
    blue: "bg-blue-50 text-[#0055FF]",
    green: "bg-green-50 text-green-600",
    orange: "bg-orange-50 text-orange-600",
    purple: "bg-purple-50 text-purple-600"
  };

  return (
    <div className="card-sharp p-6 stagger-item">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold tracking-widest uppercase text-zinc-500 mb-2">
            {label}
          </p>
          <p className="text-3xl font-black tracking-tight text-zinc-900">
            {value}
          </p>
        </div>
        <div className={`p-3 ${colorClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [recentEvents, setRecentEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, eventsRes] = await Promise.all([
        axios.get(`${API}/stats`),
        axios.get(`${API}/events`)
      ]);
      setStats(statsRes.data);
      setRecentEvents(eventsRes.data.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="spinner w-8 h-8"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Dashboard">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8" data-testid="stats-grid">
        <StatCard
          icon={Calendar}
          label="Total Events"
          value={stats?.total_events || 0}
          color="blue"
        />
        <StatCard
          icon={Users}
          label="Total Registrations"
          value={stats?.total_registrations || 0}
          color="purple"
        />
        <StatCard
          icon={UserCheck}
          label="Checked In"
          value={stats?.checked_in || 0}
          color="green"
        />
        <StatCard
          icon={Clock}
          label="Pending Check-in"
          value={stats?.pending_checkin || 0}
          color="orange"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Recent Events */}
        <div className="card-sharp">
          <div className="flex items-center justify-between p-4 border-b border-zinc-200">
            <h2 className="text-lg font-bold tracking-tight">Recent Events</h2>
            <Link
              to="/admin/events"
              className="text-sm text-[#0055FF] font-medium flex items-center gap-1 hover:underline"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-zinc-100">
            {recentEvents.length === 0 ? (
              <div className="p-8 text-center">
                <Calendar className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
                <p className="text-zinc-500 text-sm">No events yet</p>
                <Link
                  to="/admin/events/new"
                  className="inline-flex items-center gap-2 mt-4 text-sm text-[#0055FF] font-medium hover:underline"
                  data-testid="create-first-event-link"
                >
                  <Plus className="w-4 h-4" />
                  Create your first event
                </Link>
              </div>
            ) : (
              recentEvents.map((event) => (
                <Link
                  key={event.id}
                  to={`/admin/events/${event.id}/edit`}
                  className="flex items-center justify-between p-4 hover:bg-zinc-50 transition-colors"
                  data-testid={`event-item-${event.id}`}
                >
                  <div>
                    <p className="font-semibold text-zinc-900">{event.name}</p>
                    <p className="text-sm text-zinc-500">
                      {event.date} • {event.location}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-zinc-900">
                      {event.registration_count || 0}
                    </p>
                    <p className="text-xs text-zinc-500">registrations</p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="card-sharp p-6">
          <h2 className="text-lg font-bold tracking-tight mb-6">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              to="/admin/events/new"
              className="flex items-center gap-4 p-4 border border-zinc-200 hover:border-[#0055FF] hover:bg-blue-50 transition-all group"
              data-testid="quick-action-new-event"
            >
              <div className="p-2 bg-[#0055FF] text-white">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-zinc-900 group-hover:text-[#0055FF]">
                  Create New Event
                </p>
                <p className="text-sm text-zinc-500">Set up a new event with custom fields</p>
              </div>
            </Link>
            
            <Link
              to="/admin/scanner"
              className="flex items-center gap-4 p-4 border border-zinc-200 hover:border-[#0055FF] hover:bg-blue-50 transition-all group"
              data-testid="quick-action-scanner"
            >
              <div className="p-2 bg-zinc-900 text-white">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-zinc-900 group-hover:text-[#0055FF]">
                  Open Scanner
                </p>
                <p className="text-sm text-zinc-500">Verify attendees at the venue</p>
              </div>
            </Link>
            
            <Link
              to="/admin/walk-in"
              className="flex items-center gap-4 p-4 border border-zinc-200 hover:border-[#0055FF] hover:bg-blue-50 transition-all group"
              data-testid="quick-action-walkin"
            >
              <div className="p-2 bg-green-600 text-white">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-zinc-900 group-hover:text-[#0055FF]">
                  Register Walk-in
                </p>
                <p className="text-sm text-zinc-500">Add guests and recommended attendees</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Walk-in Stats */}
      {stats?.walk_ins > 0 && (
        <div className="card-sharp p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-50 text-orange-600">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-zinc-900">
                {stats.walk_ins} Walk-in Registrations
              </p>
              <p className="text-sm text-zinc-500">
                Guests registered at the venue
              </p>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default DashboardPage;
