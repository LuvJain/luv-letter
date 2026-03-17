import { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  setTemplates,
  setLoading,
  setError,
  selectTemplate,
  addTemplate,
  updateTemplate as updateTemplateAction,
  deleteTemplate as deleteTemplateAction,
} from '../store/template-slice';
import {
  fetchTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
} from '../services/template-service';
import TemplateForm from './template-form';
import TemplateList from './template-list';

export default function TemplateManager() {
  const dispatch = useDispatch();
  const { templates, loading, error, selectedTemplate } = useSelector(
    (state) => state.templates
  );
  const [showForm, setShowForm] = useState(false);

  const loadTemplates = useCallback(async () => {
    dispatch(setLoading(true));
    dispatch(setError(null));
    try {
      const data = await fetchTemplates();
      dispatch(setTemplates(data));
    } catch (err) {
      dispatch(setError(err.message || 'Failed to load templates'));
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  const handleCreate = async (formData) => {
    dispatch(setError(null));
    try {
      const created = await createTemplate(
        formData.name,
        formData.content,
        formData.channel,
        formData.variables
      );
      dispatch(addTemplate(created));
      setShowForm(false);
    } catch (err) {
      dispatch(setError(err.message || 'Failed to create template'));
    }
  };

  const handleUpdate = async (formData) => {
    if (!selectedTemplate) return;
    dispatch(setError(null));
    try {
      const updated = await updateTemplate(selectedTemplate.id, formData);
      dispatch(updateTemplateAction(updated));
      dispatch(selectTemplate(null));
      setShowForm(false);
    } catch (err) {
      dispatch(setError(err.message || 'Failed to update template'));
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this template?')) return;
    dispatch(setError(null));
    try {
      await deleteTemplate(id);
      dispatch(deleteTemplateAction(id));
    } catch (err) {
      dispatch(setError(err.message || 'Failed to delete template'));
    }
  };

  const handleEdit = (template) => {
    dispatch(selectTemplate(template));
    setShowForm(true);
  };

  const handleCancel = () => {
    dispatch(selectTemplate(null));
    setShowForm(false);
  };

  const handleToggleForm = () => {
    if (showForm) {
      handleCancel();
    } else {
      dispatch(selectTemplate(null));
      setShowForm(true);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 pb-20">
      <div className="flex justify-between items-center mb-6 animate-slide-up">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-rose-500 bg-clip-text text-transparent">
          templates
        </h1>
        <button
          onClick={handleToggleForm}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
            showForm
              ? 'bg-gray-100 text-gray-700'
              : 'bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-lg hover:shadow-xl hover:scale-105'
          }`}
        >
          {showForm ? '✕' : '+ new'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 animate-slide-up">
          {error}
        </div>
      )}

      {showForm && (
        <div className="mb-6">
          <TemplateForm
            template={selectedTemplate}
            onSubmit={selectedTemplate ? handleUpdate : handleCreate}
            onCancel={handleCancel}
          />
        </div>
      )}

      {loading ? (
        <div className="card text-center py-16">
          <div className="text-4xl mb-4 animate-pulse">...</div>
          <p className="text-sm text-gray-400">loading templates</p>
        </div>
      ) : (
        <TemplateList
          templates={templates}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
