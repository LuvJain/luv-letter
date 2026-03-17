import { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setSchedules, setLoading, setError } from '../store/schedule-slice';
import { setTemplates } from '../store/template-slice';
import { fetchSchedules, deleteSchedule, bulkUpdateSchedules } from '../services/schedule-service';
import { fetchTemplates } from '../services/template-service';
import ScheduleFilters from './schedule-filters';
import ScheduleTable from './schedule-table';
import BulkEditModal from './bulk-edit-modal';

const PAGE_SIZE = 20;

export default function ScheduleList() {
  const dispatch = useDispatch();
  const { schedules, loading, error } = useSelector((state) => state.schedules);
  const { templates } = useSelector((state) => state.templates);

  const [filters, setFilters] = useState({
    status: '',
    channel: '',
    dateFrom: '',
    dateTo: '',
    offset: 0,
  });

  const [totalCount, setTotalCount] = useState(0);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showBulkEdit, setShowBulkEdit] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const currentPage = Math.floor(filters.offset / PAGE_SIZE) + 1;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const loadSchedules = useCallback(async () => {
    dispatch(setLoading(true));
    dispatch(setError(null));
    try {
      const queryFilters = { limit: PAGE_SIZE, offset: filters.offset };
      if (filters.status) queryFilters.status = filters.status;
      if (filters.channel) queryFilters.channel = filters.channel;
      if (filters.dateFrom) queryFilters.dateFrom = filters.dateFrom;
      if (filters.dateTo) queryFilters.dateTo = filters.dateTo;

      const result = await fetchSchedules(queryFilters);
      dispatch(setSchedules(result.schedules));
      setTotalCount(result.totalCount);
    } catch (err) {
      dispatch(setError(err.message || 'Failed to load schedules'));
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, filters]);

  const loadTemplates = useCallback(async () => {
    try {
      const data = await fetchTemplates();
      dispatch(setTemplates(data));
    } catch (err) {
      console.error('Error loading templates:', err.message);
    }
  }, [dispatch]);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  useEffect(() => {
    loadSchedules();
  }, [loadSchedules]);

  // Clear selection when filters change
  useEffect(() => {
    setSelectedIds([]);
  }, [filters]);

  const handleFiltersChange = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setFilters((prev) => ({ ...prev, offset: prev.offset + PAGE_SIZE }));
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setFilters((prev) => ({
        ...prev,
        offset: Math.max(0, prev.offset - PAGE_SIZE),
      }));
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.length === schedules.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(schedules.map((s) => s.id));
    }
  };

  const handleDelete = (scheduleId) => {
    setShowDeleteConfirm(scheduleId);
  };

  const confirmDelete = async () => {
    const scheduleId = showDeleteConfirm;
    setShowDeleteConfirm(null);
    dispatch(setError(null));

    try {
      await deleteSchedule(scheduleId);
      showSuccess('Schedule cancelled');
      setSelectedIds((prev) => prev.filter((id) => id !== scheduleId));
      loadSchedules();
    } catch (err) {
      dispatch(setError(err.message || 'Failed to cancel schedule'));
    }
  };

  const handleBulkEditSubmit = async (newScheduledAt) => {
    dispatch(setError(null));
    try {
      const result = await bulkUpdateSchedules(selectedIds, {
        scheduledAt: newScheduledAt,
      });
      setShowBulkEdit(false);
      setSelectedIds([]);
      showSuccess(`${result.updatedCount} schedule${result.updatedCount !== 1 ? 's' : ''} rescheduled`);
      loadSchedules();
    } catch (err) {
      dispatch(setError(err.message || 'Failed to bulk update schedules'));
      setShowBulkEdit(false);
    }
  };

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 pb-20">
      <div className="flex justify-between items-center mb-6 animate-slide-up">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-rose-500 bg-clip-text text-transparent">
          schedules
        </h1>
        {selectedIds.length > 0 && (
          <button
            type="button"
            onClick={() => setShowBulkEdit(true)}
            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-full text-sm font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            reschedule ({selectedIds.length})
          </button>
        )}
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

      <ScheduleFilters filters={filters} onFiltersChange={handleFiltersChange} />

      {loading ? (
        <div className="card text-center py-16">
          <div className="text-4xl mb-4 animate-pulse">...</div>
          <p className="text-sm text-gray-400">loading schedules</p>
        </div>
      ) : (
        <>
          <ScheduleTable
            schedules={schedules}
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
            onToggleSelectAll={handleToggleSelectAll}
            onDelete={handleDelete}
            templates={templates}
          />

          {/* Pagination */}
          {totalCount > 0 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-xs text-gray-400">
                showing {filters.offset + 1}-
                {Math.min(filters.offset + PAGE_SIZE, totalCount)} of{' '}
                {totalCount}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrevPage}
                  disabled={currentPage <= 1}
                  className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-semibold hover:bg-gray-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  previous
                </button>
                <span className="text-xs text-gray-500 font-semibold">
                  {currentPage} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={handleNextPage}
                  disabled={currentPage >= totalPages}
                  className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-semibold hover:bg-gray-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Bulk edit modal */}
      {showBulkEdit && (
        <BulkEditModal
          selectedCount={selectedIds.length}
          onSubmit={handleBulkEditSubmit}
          onClose={() => setShowBulkEdit(false)}
        />
      )}

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 animate-slide-up">
            <h2 className="text-lg font-bold text-gray-900 mb-3">
              cancel schedule?
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              this will set the schedule status to cancelled. this action cannot
              be undone.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors"
              >
                keep it
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors"
              >
                cancel schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
