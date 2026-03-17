import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  templates: [],
  loading: false,
  error: null,
  selectedTemplate: null,
};

const templateSlice = createSlice({
  name: 'templates',
  initialState,
  reducers: {
    setTemplates(state, action) {
      state.templates = action.payload;
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
    },
    selectTemplate(state, action) {
      state.selectedTemplate = action.payload;
    },
    addTemplate(state, action) {
      state.templates.unshift(action.payload);
    },
    updateTemplate(state, action) {
      const index = state.templates.findIndex(
        (t) => t.id === action.payload.id
      );
      if (index !== -1) {
        state.templates[index] = action.payload;
      }
      if (state.selectedTemplate?.id === action.payload.id) {
        state.selectedTemplate = action.payload;
      }
    },
    deleteTemplate(state, action) {
      state.templates = state.templates.filter(
        (t) => t.id !== action.payload
      );
      if (state.selectedTemplate?.id === action.payload) {
        state.selectedTemplate = null;
      }
    },
  },
});

export const {
  setTemplates,
  setLoading,
  setError,
  selectTemplate,
  addTemplate,
  updateTemplate,
  deleteTemplate,
} = templateSlice.actions;

export default templateSlice.reducer;
