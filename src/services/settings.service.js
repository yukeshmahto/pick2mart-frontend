import { fetchClient } from './apiClient';

export const settingsService = {
  getSettings: () =>
    fetchClient('/settings', {
      method: 'GET',
    }),

  updateSettings: (data) =>
    fetchClient('/settings', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  getHomepageSections: () =>
    fetchClient('/settings/homepage-sections', {
      method: 'GET',
    }),

  updateHomepageSections: (sections) =>
    fetchClient('/settings/homepage-sections', {
      method: 'PATCH',
      body: JSON.stringify({ sections }),
    }),
};
