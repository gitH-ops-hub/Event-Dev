import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '@/App';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Palette, 
  Save,
  Image,
  Type
} from 'lucide-react';
import { toast } from 'sonner';

const BrandingPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    company_name: '',
    logo_url: '',
    primary_color: '#0055FF',
    tagline: ''
  });

  useEffect(() => {
    fetchBranding();
  }, []);

  const fetchBranding = async () => {
    try {
      const response = await axios.get(`${API}/branding`);
      setFormData(response.data);
    } catch (error) {
      console.error('Error fetching branding:', error);
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
    setSaving(true);
    
    try {
      await axios.put(`${API}/branding`, formData);
      toast.success('Branding updated successfully');
    } catch (error) {
      console.error('Error saving branding:', error);
      toast.error('Failed to save branding');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Branding">
        <div className="flex items-center justify-center h-64">
          <div className="spinner w-8 h-8"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Branding">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form */}
        <div className="card-sharp p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-100 text-purple-700">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Brand Settings</h2>
              <p className="text-sm text-zinc-500">Customize the appearance of your tickets</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="company_name" className="flex items-center gap-2">
                <Type className="w-4 h-4" />
                Company / Event Name
              </Label>
              <Input
                id="company_name"
                name="company_name"
                value={formData.company_name}
                onChange={handleChange}
                placeholder="Your Company Name"
                className="mt-1"
                data-testid="branding-company-input"
              />
              <p className="text-xs text-zinc-500 mt-1">
                This appears at the top of your tickets
              </p>
            </div>
            
            <div>
              <Label htmlFor="tagline">Tagline</Label>
              <Input
                id="tagline"
                name="tagline"
                value={formData.tagline}
                onChange={handleChange}
                placeholder="Your Events, Simplified"
                className="mt-1"
                data-testid="branding-tagline-input"
              />
            </div>
            
            <div>
              <Label htmlFor="logo_url" className="flex items-center gap-2">
                <Image className="w-4 h-4" />
                Logo URL
              </Label>
              <Input
                id="logo_url"
                name="logo_url"
                type="url"
                value={formData.logo_url}
                onChange={handleChange}
                placeholder="https://example.com/logo.png"
                className="mt-1"
                data-testid="branding-logo-input"
              />
              <p className="text-xs text-zinc-500 mt-1">
                Enter a URL to your logo image
              </p>
            </div>
            
            <div>
              <Label htmlFor="primary_color">Primary Color</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="primary_color"
                  name="primary_color"
                  type="color"
                  value={formData.primary_color}
                  onChange={handleChange}
                  className="w-14 h-10 p-1 cursor-pointer"
                  data-testid="branding-color-picker"
                />
                <Input
                  value={formData.primary_color}
                  onChange={handleChange}
                  name="primary_color"
                  placeholder="#0055FF"
                  className="flex-1 font-mono"
                  data-testid="branding-color-input"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={saving}
              className="w-full bg-[#0055FF] hover:bg-[#0044CC] text-white"
              data-testid="branding-save-btn"
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <div className="spinner w-4 h-4"></div>
                  Saving...
                </span>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Preview */}
        <div>
          <h3 className="font-bold mb-4">Ticket Preview</h3>
          <div className="ticket-container shadow-lg">
            <div className="ticket-header text-center" style={{ backgroundColor: formData.primary_color || '#0A0A0A' }}>
              {formData.logo_url && (
                <img 
                  src={formData.logo_url} 
                  alt="Logo" 
                  className="h-12 mx-auto mb-2 object-contain"
                  onError={(e) => e.target.style.display = 'none'}
                />
              )}
              <h2 className="text-2xl font-black">
                {formData.company_name || 'Event Manager'}
              </h2>
              {formData.tagline && (
                <p className="text-sm opacity-80 mt-1">{formData.tagline}</p>
              )}
            </div>
            <div className="ticket-body">
              <div className="text-center mb-4">
                <p className="text-xs uppercase tracking-wider text-zinc-500 mb-1">Event Ticket</p>
                <h3 className="text-lg font-bold">Sample Event Name</h3>
              </div>
              
              <div className="space-y-2 text-sm mb-4">
                <p><span className="text-zinc-500">Date:</span> January 15, 2024</p>
                <p><span className="text-zinc-500">Time:</span> 10:00 AM</p>
                <p><span className="text-zinc-500">Location:</span> Convention Center</p>
              </div>
              
              <div className="border-t border-dashed border-zinc-200 pt-4">
                <p className="text-sm"><span className="text-zinc-500">Name:</span> John Doe</p>
                <p className="text-sm"><span className="text-zinc-500">Code:</span> <span className="font-mono font-bold">ABC123XYZ456</span></p>
              </div>
            </div>
            <div className="ticket-codes border-t border-zinc-200">
              <div className="text-center">
                <div className="bg-zinc-200 w-20 h-20 mx-auto mb-1"></div>
                <p className="text-xs text-zinc-500">QR Code</p>
              </div>
              <div className="text-center">
                <div className="bg-zinc-200 w-full h-12 mb-1"></div>
                <p className="text-xs text-zinc-500">Barcode</p>
              </div>
            </div>
          </div>
          
          <p className="text-xs text-zinc-500 mt-4 text-center">
            This is a preview of how your tickets will appear
          </p>
        </div>
      </div>
    </AdminLayout>
  );
};

export default BrandingPage;
