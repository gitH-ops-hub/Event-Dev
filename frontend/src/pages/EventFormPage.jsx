import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { API } from '@/App';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Save, 
  ArrowLeft,
  Plus,
  Trash2,
  GripVertical
} from 'lucide-react';
import { toast } from 'sonner';

const FIELD_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'email', label: 'Email' },
  { value: 'tel', label: 'Phone' },
  { value: 'date', label: 'Date' },
  { value: 'textarea', label: 'Text Area' },
  { value: 'select', label: 'Dropdown' },
];

const EventFormPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const isEditing = !!eventId;
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    date: '',
    time: '',
    location: '',
    guidelines: '',
    max_registrations: 100,
    is_active: true,
    custom_fields: []
  });

  useEffect(() => {
    if (isEditing) {
      fetchEvent();
    }
  }, [eventId]);

  const fetchEvent = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/events/${eventId}`);
      setFormData(response.data);
    } catch (error) {
      console.error('Error fetching event:', error);
      toast.error('Failed to load event');
      navigate('/admin/events');
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
      if (isEditing) {
        await axios.put(`${API}/events/${eventId}`, formData);
        toast.success('Event updated successfully');
      } else {
        await axios.post(`${API}/events`, formData);
        toast.success('Event created successfully');
      }
      navigate('/admin/events');
    } catch (error) {
      console.error('Error saving event:', error);
      const message = error.response?.data?.detail || 'Failed to save event';
      toast.error(typeof message === 'string' ? message : 'Failed to save event');
    } finally {
      setSaving(false);
    }
  };

  // Custom Fields Management
  const addCustomField = () => {
    const newField = {
      id: `field_${Date.now()}`,
      name: `custom_field_${formData.custom_fields.length + 1}`,
      label: '',
      field_type: 'text',
      required: false,
      options: [],
      placeholder: ''
    };
    setFormData(prev => ({
      ...prev,
      custom_fields: [...prev.custom_fields, newField]
    }));
  };

  const updateCustomField = (index, key, value) => {
    const updated = [...formData.custom_fields];
    updated[index] = { ...updated[index], [key]: value };
    
    // Auto-generate name from label
    if (key === 'label') {
      updated[index].name = value.toLowerCase().replace(/[^a-z0-9]/g, '_');
    }
    
    setFormData(prev => ({ ...prev, custom_fields: updated }));
  };

  const removeCustomField = (index) => {
    const updated = formData.custom_fields.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, custom_fields: updated }));
  };

  if (loading) {
    return (
      <AdminLayout title={isEditing ? 'Edit Event' : 'Create Event'}>
        <div className="flex items-center justify-center h-64">
          <div className="spinner w-8 h-8"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={isEditing ? 'Edit Event' : 'Create Event'}>
      <div className="max-w-3xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/admin/events')}
          className="mb-6 -ml-2"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Events
        </Button>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <div className="card-sharp p-6">
            <h2 className="text-lg font-bold mb-6">Event Details</h2>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Event Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Annual Tech Conference 2024"
                  required
                  className="mt-1"
                  data-testid="event-name-input"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Brief description of the event..."
                  rows={3}
                  className="mt-1"
                  data-testid="event-description-input"
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                    className="mt-1"
                    data-testid="event-date-input"
                  />
                </div>
                <div>
                  <Label htmlFor="time">Time *</Label>
                  <Input
                    id="time"
                    name="time"
                    type="time"
                    value={formData.time}
                    onChange={handleChange}
                    required
                    className="mt-1"
                    data-testid="event-time-input"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Convention Center, 123 Main St"
                  required
                  className="mt-1"
                  data-testid="event-location-input"
                />
              </div>
              
              <div>
                <Label htmlFor="max_registrations">Maximum Registrations *</Label>
                <Input
                  id="max_registrations"
                  name="max_registrations"
                  type="number"
                  min="1"
                  value={formData.max_registrations}
                  onChange={handleChange}
                  required
                  className="mt-1 max-w-[200px]"
                  data-testid="event-max-registrations-input"
                />
              </div>
              
              <div>
                <Label htmlFor="guidelines">Entry Guidelines</Label>
                <Textarea
                  id="guidelines"
                  name="guidelines"
                  value={formData.guidelines}
                  onChange={handleChange}
                  placeholder="Please carry a valid ID&#10;No outside food allowed&#10;Dress code: Business casual"
                  rows={4}
                  className="mt-1"
                  data-testid="event-guidelines-input"
                />
                <p className="text-xs text-zinc-500 mt-1">One guideline per line</p>
              </div>
              
              <div className="flex items-center gap-3 pt-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                  data-testid="event-active-switch"
                />
                <Label htmlFor="is_active" className="cursor-pointer">
                  Registration Open
                </Label>
              </div>
            </div>
          </div>

          {/* Custom Fields */}
          <div className="card-sharp p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold">Custom Registration Fields</h2>
                <p className="text-sm text-zinc-500 mt-1">
                  Add additional fields to the registration form
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={addCustomField}
                data-testid="add-custom-field-btn"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Field
              </Button>
            </div>

            {formData.custom_fields.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-zinc-200">
                <p className="text-zinc-500 text-sm">
                  No custom fields added yet. Click "Add Field" to create one.
                </p>
                <p className="text-zinc-400 text-xs mt-2">
                  Default fields: First Name, Last Name, Nationality, Email
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {formData.custom_fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="border border-zinc-200 p-4 bg-zinc-50"
                    data-testid={`custom-field-${index}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="pt-2 text-zinc-400 cursor-move">
                        <GripVertical className="w-4 h-4" />
                      </div>
                      
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs">Field Label *</Label>
                          <Input
                            value={field.label}
                            onChange={(e) => updateCustomField(index, 'label', e.target.value)}
                            placeholder="Phone Number"
                            className="mt-1"
                            data-testid={`custom-field-label-${index}`}
                          />
                        </div>
                        
                        <div>
                          <Label className="text-xs">Field Type</Label>
                          <Select
                            value={field.field_type}
                            onValueChange={(value) => updateCustomField(index, 'field_type', value)}
                          >
                            <SelectTrigger className="mt-1" data-testid={`custom-field-type-${index}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {FIELD_TYPES.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label className="text-xs">Placeholder</Label>
                          <Input
                            value={field.placeholder || ''}
                            onChange={(e) => updateCustomField(index, 'placeholder', e.target.value)}
                            placeholder="Enter placeholder text"
                            className="mt-1"
                            data-testid={`custom-field-placeholder-${index}`}
                          />
                        </div>
                        
                        {field.field_type === 'select' && (
                          <div>
                            <Label className="text-xs">Options (comma separated)</Label>
                            <Input
                              value={field.options?.join(', ') || ''}
                              onChange={(e) => updateCustomField(index, 'options', e.target.value.split(',').map(o => o.trim()))}
                              placeholder="Option 1, Option 2, Option 3"
                              className="mt-1"
                              data-testid={`custom-field-options-${index}`}
                            />
                          </div>
                        )}
                        
                        <div className="flex items-center gap-3 pt-6">
                          <Switch
                            checked={field.required}
                            onCheckedChange={(checked) => updateCustomField(index, 'required', checked)}
                            data-testid={`custom-field-required-${index}`}
                          />
                          <Label className="text-sm cursor-pointer">Required</Label>
                        </div>
                      </div>
                      
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCustomField(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        data-testid={`remove-custom-field-${index}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex items-center gap-4">
            <Button
              type="submit"
              disabled={saving}
              className="bg-[#0055FF] hover:bg-[#0044CC] text-white"
              data-testid="save-event-btn"
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <div className="spinner w-4 h-4"></div>
                  Saving...
                </span>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {isEditing ? 'Update Event' : 'Create Event'}
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin/events')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default EventFormPage;
