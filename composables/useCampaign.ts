import type { Campaign } from '~/server/db/types';

interface CreateCampaignData {
  name: string;
}

interface JoinCampaignData {
  campaignCode: string;
  characterId: number;
}

export function useCampaign() {
  const campaignStore = useCampaignStore();

  async function createCampaign(data: CreateCampaignData): Promise<Campaign | null> {
    try {
      campaignStore.setLoading(true);
      campaignStore.clearError();

      const response = await $fetch<{ data: Campaign }>('/api/campaigns', {
        method: 'POST',
        body: data,
      });

      const campaign = response.data;
      campaignStore.addCampaign(campaign);
      return campaign;
    } catch (error: unknown) {
      const errorMessage = (error as { data?: { message?: string } })?.data?.message || 'Failed to create campaign';
      campaignStore.setError(errorMessage);
      return null;
    } finally {
      campaignStore.setLoading(false);
    }
  }

  async function joinCampaign(data: JoinCampaignData): Promise<{ campaign: Campaign; character: unknown } | null> {
    try {
      campaignStore.setLoading(true);
      campaignStore.clearError();

      const response = await $fetch<{ data: { campaign: Campaign; character: unknown } }>('/api/campaigns/join', {
        method: 'POST',
        body: data,
      });

      const { campaign, character } = response.data;
      campaignStore.updateCampaign(campaign);
      return { campaign, character };
    } catch (error: unknown) {
      const errorMessage = (error as { data?: { message?: string } })?.data?.message || 'Failed to join campaign';
      campaignStore.setError(errorMessage);
      return null;
    } finally {
      campaignStore.setLoading(false);
    }
  }

  async function fetchUserCampaigns(): Promise<void> {
    try {
      campaignStore.setLoading(true);
      campaignStore.clearError();

      const response = await $fetch<{ data: Campaign[] }>('/api/campaigns/user');
      campaignStore.setCampaigns(response.data);
    } catch (error: unknown) {
      const errorMessage = (error as { data?: { message?: string } })?.data?.message || 'Failed to fetch campaigns';
      campaignStore.setError(errorMessage);
    } finally {
      campaignStore.setLoading(false);
    }
  }

  return {
    createCampaign,
    joinCampaign,
    fetchUserCampaigns,
    campaigns: computed(() => campaignStore.campaigns),
    currentCampaign: computed(() => campaignStore.currentCampaign),
    loading: computed(() => campaignStore.loading),
    error: computed(() => campaignStore.error),
  };
};
