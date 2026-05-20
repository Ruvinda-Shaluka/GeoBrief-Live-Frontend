import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

// We will expand this type later when we build the backend model
export interface Incident {
  _id: string;
  title: string;
  description: string;
  type: 'road' | 'power' | 'safety' | 'other';
  coordinates: [number, number]; // [longitude, latitude] for Mapbox
  status: 'active' | 'resolved';
}

interface IncidentState {
  incidents: Incident[];
  isLoading: boolean;
}

const initialState: IncidentState = {
  incidents: [],
  isLoading: false,
};

const incidentSlice = createSlice({
  name: 'incidents',
  initialState,
  reducers: {
    setIncidents: (state, action: PayloadAction<Incident[]>) => {
      state.incidents = action.payload;
    },
    addIncident: (state, action: PayloadAction<Incident>) => {
      state.incidents.push(action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    }
  },
});

export const { setIncidents, addIncident, setLoading } = incidentSlice.actions;
export default incidentSlice.reducer;