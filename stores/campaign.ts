import { defineStore } from 'pinia';
import type { Campaign } from '~/server/db/types';

interface CampaignState {
  campaigns: Campaign[];
  currentCampaign: Campaign | null;
  loading: boolean;
  error: string | null;
}

export const useCampaignStore = defineStore('campaign', {
  state: (): CampaignState => ({
    campaigns: [],
    currentCampaign: null,
    loading: false,
    error: null,
  }),

  getters: {
    activeCampaigns: (state) => 
      state.campaigns.filter(campaign => campaign.status === 'active'),
    
    userCampaigns: (state) => 
      state.campaigns,
  },

  actions: {
    setLoading(loading: boolean) {
      this.loading = loading;
    },

    setError(error: string | null) {
      this.error = error;
    },

    setCampaigns(campaigns: Campaign[]) {
      this.campaigns = campaigns;
    },

    addCampaign(campaign: Campaign) {
      this.campaigns.push(campaign);
    },

    setCurrentCampaign(campaign: Campaign | null) {
      this.currentCampaign = campaign;
    },

    updateCampaign(updatedCampaign: Campaign) {
      const index = this.campaigns.findIndex(c => c.id === updatedCampaign.id);
      if (index !== -1) {
        this.campaigns[index] = updatedCampaign;
      }
      
      if (this.currentCampaign?.id === updatedCampaign.id) {
        this.currentCampaign = updatedCampaign;
      }
    },

    clearError() {
      this.error = null;
    },

    reset() {
      this.campaigns = [];
      this.currentCampaign = null;
      this.loading = false;
      this.error = null;
    },
  },
});