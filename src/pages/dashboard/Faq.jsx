import React, { useState, useEffect } from 'react';
import {
  Trash2,
  Edit2,
  Save,
  HelpCircle,
  Loader2,
} from 'lucide-react';

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import axios from 'axios';

const AdminFAQ = () => {
  const [faqs, setFaqs] = useState(["Shah"]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    question: '',
    answer: '',
  });

  const [isEditing, setIsEditing] = useState(null);

  // Fetch FAQs
  const fetchFaqs = async () => {
    try {
      const res = await axios.get('/api/faqs');

      setFaqs(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching FAQs:', err);
      setFaqs([]);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  // Save / Update FAQ
  const handleSave = async () => {
    if (!formData.question || !formData.answer) {
      return alert('Please fill all fields');
    }

    setLoading(true);

    try {
      if (isEditing !== null) {
        await axios.put(`/api/faqs/${isEditing}`, formData);
      } else {
        await axios.post('/api/faqs', formData);
      }

      // Reset Form
      setFormData({
        question: '',
        answer: '',
      });

      setIsEditing(null);

      await fetchFaqs();

    } catch (err) {
      console.error(err);
      alert('Failed to save FAQ');
    } finally {
      setLoading(false);
    }
  };

  // Delete FAQ
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Delete this FAQ?');

    if (!confirmDelete) return;

    try {
      await axios.delete(`/api/faqs/${id}`);

      await fetchFaqs();

    } catch (err) {
      console.error(err);
      alert('Failed to delete FAQ');
    }
  };

  // Edit FAQ
  const handleEdit = (faq) => {
    setIsEditing(faq._id);

    setFormData({
      question: faq.question,
      answer: faq.answer,
    });

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto p-6">

        {/* Heading */}
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Manage FAQs
        </h1>

        {/* Form Section */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-8">

          <div className="flex items-center gap-2 mb-5">
            <HelpCircle size={22} className="text-[#C5A059]" />

            <h2 className="text-xl font-semibold text-gray-800">
              {isEditing !== null ? 'Edit FAQ' : 'Add New FAQ'}
            </h2>
          </div>

          <div className="space-y-4">

            {/* Question */}
            <input
              type="text"
              placeholder="Enter question..."
              value={formData.question}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  question: e.target.value,
                })
              }
              className="w-full p-4 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-[#C5A059]"
            />

            {/* Answer */}
            <textarea
              rows={5}
              placeholder="Enter answer..."
              value={formData.answer}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  answer: e.target.value,
                })
              }
              className="w-full p-4 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-[#C5A059]"
            />

            {/* Buttons */}
            <div className="flex justify-end gap-3">

              {isEditing !== null && (
                <button
                  onClick={() => {
                    setIsEditing(null);

                    setFormData({
                      question: '',
                      answer: '',
                    });
                  }}
                  className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
              )}

              <button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-[#C5A059] text-white rounded-xl hover:bg-[#ad8845] transition disabled:opacity-70"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Save size={18} />
                )}

                {isEditing !== null ? 'Update FAQ' : 'Save FAQ'}
              </button>

            </div>
          </div>
        </div>

        {/* FAQ LIST */}
        <div className="space-y-4">

          {faqs.length === 0 ? (
            <div className="bg-white border border-dashed border-gray-300 rounded-xl p-8 text-center text-gray-500">
              No FAQs Added Yet
            </div>
          ) : (
            faqs.map((faq) => (
              <div
                key={faq._id}
                className="bg-white border border-gray-200 rounded-2xl p-6 flex justify-between items-start shadow-sm hover:shadow-md transition"
              >

                {/* Content */}
                <div className="flex-1 pr-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {faq.question}
                  </h3>

                  <p className="text-gray-600 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 shrink-0">

                  {/* Edit */}
                  <button
                    onClick={() => handleEdit(faq)}
                    className="p-2 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition"
                  >
                    <Edit2 size={18} />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(faq._id)}
                    className="p-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition"
                  >
                    <Trash2 size={18} />
                  </button>

                </div>
              </div>
            ))
          )}

        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminFAQ;