"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface QuickReplyTemplate {
  id: string;
  title: string;
  message: string;
  category: string;
  usage_count: number;
  is_active: boolean;
}

interface QuickRepliesProps {
  onSelectTemplate: (message: string, templateId: string) => void;
}

export default function QuickReplies({ onSelectTemplate }: QuickRepliesProps) {
  const { getToken } = useAuth();
  const [templates, setTemplates] = useState<QuickReplyTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<QuickReplyTemplate | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const token = await getToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_HOST}/api/messaging/quick-replies/`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      const token = await getToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_HOST}/api/messaging/quick-replies/${templateId}/delete/`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        toast.success('Template deleted');
        fetchTemplates();
      } else {
        toast.error('Failed to delete template');
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Failed to delete template');
    }
  };

  const categories = [
    { value: 'greeting', label: 'Greeting' },
    { value: 'booking_confirmation', label: 'Booking Confirmation' },
    { value: 'check_in', label: 'Check-in Instructions' },
    { value: 'check_out', label: 'Check-out Instructions' },
    { value: 'amenities', label: 'Amenities Info' },
    { value: 'directions', label: 'Directions' },
    { value: 'house_rules', label: 'House Rules' },
    { value: 'emergency', label: 'Emergency' },
    { value: 'thank_you', label: 'Thank You' },
    { value: 'custom', label: 'Custom' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Quick Replies</h3>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <PlusIcon className="h-5 w-5" />
          <span>New Template</span>
        </button>
      </div>

      {templates.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          <p>No quick reply templates yet.</p>
          <p className="text-sm mt-2">Create templates to respond faster to guests!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((template) => (
            <div
              key={template.id}
              className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{template.title}</h4>
                  <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded mt-1">
                    {categories.find(c => c.value === template.category)?.label || template.category}
                  </span>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => setEditingTemplate(template)}
                    className="p-1 text-gray-400 hover:text-blue-600 transition"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteTemplate(template.id)}
                    className="p-1 text-gray-400 hover:text-red-600 transition"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{template.message}</p>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  Used {template.usage_count} times
                </span>
                <button
                  onClick={() => onSelectTemplate(template.message, template.id)}
                  className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition"
                >
                  Use Template
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal would go here */}
      {showCreateModal && (
        <CreateTemplateModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchTemplates();
          }}
          categories={categories}
        />
      )}

      {editingTemplate && (
        <EditTemplateModal
          template={editingTemplate}
          onClose={() => setEditingTemplate(null)}
          onSuccess={() => {
            setEditingTemplate(null);
            fetchTemplates();
          }}
          categories={categories}
        />
      )}
    </div>
  );
}

// Create Template Modal Component
function CreateTemplateModal({ onClose, onSuccess, categories }: any) {
  const { getToken } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    category: 'custom',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = await getToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_HOST}/api/messaging/quick-replies/create/`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        toast.success('Template created!');
        onSuccess();
      } else {
        toast.error('Failed to create template');
      }
    } catch (error) {
      console.error('Error creating template:', error);
      toast.error('Failed to create template');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Quick Reply Template</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map((cat: any) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {saving ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Edit Template Modal Component
function EditTemplateModal({ template, onClose, onSuccess, categories }: any) {
  const { getToken } = useAuth();
  const [formData, setFormData] = useState({
    title: template.title,
    message: template.message,
    category: template.category,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = await getToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_HOST}/api/messaging/quick-replies/${template.id}/`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        toast.success('Template updated!');
        onSuccess();
      } else {
        toast.error('Failed to update template');
      }
    } catch (error) {
      console.error('Error updating template:', error);
      toast.error('Failed to update template');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Quick Reply Template</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map((cat: any) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {saving ? 'Updating...' : 'Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

