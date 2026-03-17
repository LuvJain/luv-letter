import { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  setCurrentSchedule,
  setLoading,
  setError,
  addSchedule,
  setRecipients,
  resetCurrentSchedule,
  setSchedules,
} from '../store/schedule-slice';
import { setTemplates } from '../store/template-slice';
import { fetchTemplates } from '../services/template-service';
import { createSchedule, fetchSchedules } from '../services/schedule-service';
import ScheduleForm from './schedule-form';
import RecipientUploader from './recipient-uploader';
import RecipientList from './recipient-list';

const STEPS = [
  { id: 'details', label: 'details' },
  { id: 'recipients', label: 'recipients' },
  { id: 'review', label: 'review' },
];

export default function ScheduleCreator() {
  const dispatch = useDispatch();
  const { currentSchedule, loading, error, recipients, schedules } =
    useSelector((state) => state.schedules);
  const { templates } = useSelector((state) => state.templates);

  const [step, setStep] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    dispatch(setLoading(true));
    dispatch(setError(null));
    try {
      const [templateData, scheduleData] = await Promise.all([
        fetchTemplates(),
        fetchSchedules(),
      ]);
      dispatch(setTemplates(templateData));
      dispatch(setSchedules(scheduleData.schedules));
    } catch (err) {
      dispatch(setError(err.message || 'Failed to load data'));
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleTemplateChange = (templateId) => {
    dispatch(
      setCurrentSchedule({ ...currentSchedule, templateId })
    );
  };

  const handleChannelChange = (channel) => {
    dispatch(
      setCurrentSchedule({ ...currentSchedule, channel })
    );
  };

  const handleScheduledAtChange = (scheduledAt) => {
    dispatch(
      setCurrentSchedule({ ...currentSchedule, scheduledAt })
    );
  };

  const handleRecipientsUpload = (uploaded) => {
    dispatch(setRecipients(uploaded));
  };

  const handleRemoveRecipient = (index) => {
    const updated = recipients.filter((_, i) => i !== index);
    dispatch(setRecipients(updated));
  };

  const canProceedFromDetails = () => {
    if (!currentSchedule.templateId) return false;
    if (!currentSchedule.scheduledAt) return false;

    // Validate scheduledAt is in the future
    const scheduledDate = new Date(currentSchedule.scheduledAt);
    if (scheduledDate <= new Date()) return false;

    return true;
  };

  const canProceedFromRecipients = () => {
    return recipients.length > 0;
  };

  const handleNext = () => {
    dispatch(setError(null));

    if (step === 0 && !canProceedFromDetails()) {
      if (!currentSchedule.templateId) {
        dispatch(setError('Please select a template'));
      } else if (!currentSchedule.scheduledAt) {
        dispatch(setError('Please select a date and time'));
      } else {
        dispatch(setError('Scheduled date must be in the future'));
      }
      return;
    }

    if (step === 1 && !canProceedFromRecipients()) {
      dispatch(setError('Please upload at least one recipient'));
      return;
    }

    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const handleBack = () => {
    dispatch(setError(null));
    setStep((s) => Math.max(s - 1, 0));
  };

  const handleSubmit = async () => {
    dispatch(setError(null));
    setSubmitting(true);

    try {
      const result = await createSchedule(
        currentSchedule.templateId,
        currentSchedule.scheduledAt,
        currentSchedule.channel,
        recipients
      );
      dispatch(addSchedule(result.schedule));
      setSuccessMessage('Schedule created successfully!');
      dispatch(resetCurrentSchedule());
      setStep(0);
      setShowForm(false);

      // Clear success message after 4 seconds
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      dispatch(setError(err.message || 'Failed to create schedule'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleForm = () => {
    if (showForm) {
      dispatch(resetCurrentSchedule());
      dispatch(setError(null));
      setStep(0);
      setShowForm(false);
    } else {
      setShowForm(true);
    }
  };

  const getSelectedTemplateName = () => {
    const template = templates.find(
      (t) => t.id === currentSchedule.templateId
    );
    return template ? template.name : '-';
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-6">
      {STEPS.map((s, i) => (
        <div key={s.id} className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (i < step) setStep(i);
            }}
            className={`w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center transition-all ${
              i === step
                ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white'
                : i < step
                  ? 'bg-orange-100 text-orange-600 cursor-pointer hover:bg-orange-200'
                  : 'bg-gray-100 text-gray-400'
            }`}
            disabled={i > step}
          >
            {i + 1}
          </button>
          <span
            className={`text-xs font-semibold ${
              i === step ? 'text-gray-700' : 'text-gray-400'
            }`}
          >
            {s.label}
          </span>
          {i < STEPS.length - 1 && (
            <div
              className={`w-8 h-0.5 ${
                i < step ? 'bg-orange-300' : 'bg-gray-200'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <ScheduleForm
            templates={templates}
            templateId={currentSchedule.templateId}
            channel={currentSchedule.channel}
            scheduledAt={currentSchedule.scheduledAt}
            recipientCount={recipients.length}
            onTemplateChange={handleTemplateChange}
            onChannelChange={handleChannelChange}
            onScheduledAtChange={handleScheduledAtChange}
          />
        );
      case 1:
        return (
          <div className="space-y-4">
            <RecipientUploader onUpload={handleRecipientsUpload} />
            <RecipientList
              recipients={recipients}
              onRemove={handleRemoveRecipient}
            />
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              review schedule
            </h3>
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">template</span>
                <span className="font-semibold text-gray-700">
                  {getSelectedTemplateName()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">channel</span>
                <span className="font-semibold text-gray-700">
                  {currentSchedule.channel}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">scheduled for</span>
                <span className="font-semibold text-gray-700">
                  {currentSchedule.scheduledAt
                    ? new Date(currentSchedule.scheduledAt).toLocaleString()
                    : '-'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">recipients</span>
                <span className="font-semibold text-gray-700">
                  {recipients.length}
                </span>
              </div>
            </div>
            <RecipientList
              recipients={recipients}
              onRemove={handleRemoveRecipient}
            />
          </div>
        );
      default:
        return null;
    }
  };

  const renderScheduleList = () => {
    if (schedules.length === 0) {
      return (
        <div className="card text-center py-12">
          <div className="text-4xl mb-3">-</div>
          <p className="text-sm text-gray-400">no schedules yet</p>
          <p className="text-xs text-gray-300 mt-1">
            create your first schedule above
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {schedules.map((schedule) => (
          <div
            key={schedule.id}
            className="card p-4 flex justify-between items-center"
          >
            <div>
              <p className="text-sm font-semibold text-gray-800">
                {schedule.channel} schedule
              </p>
              <p className="text-xs text-gray-400">
                {new Date(schedule.scheduled_at).toLocaleString()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs px-2 py-1 rounded-full font-semibold ${
                  schedule.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-700'
                    : schedule.status === 'sent'
                      ? 'bg-green-100 text-green-700'
                      : schedule.status === 'cancelled'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-600'
                }`}
              >
                {schedule.status}
              </span>
              {schedule.schedule_recipients && (
                <span className="text-xs text-gray-400">
                  {schedule.schedule_recipients.length} recipient
                  {schedule.schedule_recipients.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto p-4 pb-20">
      <div className="flex justify-between items-center mb-6 animate-slide-up">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-rose-500 bg-clip-text text-transparent">
          schedules
        </h1>
        <button
          onClick={handleToggleForm}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
            showForm
              ? 'bg-gray-100 text-gray-700'
              : 'bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-lg hover:shadow-xl hover:scale-105'
          }`}
        >
          {showForm ? 'x' : '+ new'}
        </button>
      </div>

      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 animate-slide-up">
          {successMessage}
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 animate-slide-up">
          {error}
        </div>
      )}

      {showForm && (
        <div className="card mb-6 animate-slide-up">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-900">new schedule</h2>
            <button
              type="button"
              onClick={handleToggleForm}
              className="text-gray-400 hover:text-gray-600 text-xl transition-colors"
            >
              x
            </button>
          </div>

          {renderStepIndicator()}
          {renderStep()}

          {/* Navigation buttons */}
          <div className="flex justify-between mt-6">
            {step > 0 ? (
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors"
              >
                back
              </button>
            ) : (
              <div />
            )}

            {step < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-lg text-sm font-semibold shadow hover:shadow-lg transition-all"
              >
                next
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting || recipients.length === 0}
                className="btn-primary px-6"
              >
                {submitting ? 'creating...' : 'create schedule'}
              </button>
            )}
          </div>
        </div>
      )}

      {loading ? (
        <div className="card text-center py-16">
          <div className="text-4xl mb-4 animate-pulse">...</div>
          <p className="text-sm text-gray-400">loading schedules</p>
        </div>
      ) : (
        renderScheduleList()
      )}
    </div>
  );
}
