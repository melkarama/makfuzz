import axios from 'axios';
import { FileInfo, SearchState, SearchResponse } from './types';

const API_BASE = '/api/v1/fuzz';

export const api = {
    uploadFile: async (file: File): Promise<FileInfo> => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await axios.post(`${API_BASE}/upload`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    getFileInfo: async (fileId: string): Promise<FileInfo> => {
        const response = await axios.get(`${API_BASE}/file/${fileId}`);
        return response.data;
    },

    deleteFile: async (fileId: string): Promise<void> => {
        await axios.delete(`${API_BASE}/file/${fileId}`);
    },

    search: async (fileId: string, searchState: SearchState): Promise<SearchResponse> => {
        const response = await axios.post(`${API_BASE}/search/${fileId}`, {
            criterias: searchState.criterias.filter(c => c.value.trim() !== ''),
            searchColumnIndexes: searchState.searchColumnIndexes,
            threshold: searchState.threshold,
            topN: searchState.topN,
            language: searchState.language
        });
        return response.data;
    },

    exportCSV: async (fileId: string, searchState: SearchState): Promise<Blob> => {
        const response = await axios.post(`${API_BASE}/export/${fileId}/csv`, {
            criterias: searchState.criterias.filter(c => c.value.trim() !== ''),
            searchColumnIndexes: searchState.searchColumnIndexes,
            threshold: searchState.threshold,
            topN: 10000,
            language: searchState.language
        }, {
            responseType: 'blob'
        });
        return response.data;
    },

    health: async (): Promise<string> => {
        const response = await axios.get(`${API_BASE}/health`);
        return response.data;
    }
};
