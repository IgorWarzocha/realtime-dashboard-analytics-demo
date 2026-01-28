/**
 * Centralized color palette for campaign visualization.
 * Emerald, Amber, Rose, Violet, Cyan.
 */
export const CAMPAIGN_COLORS = [
  "#10b981",
  "#f59e0b",
  "#f43f5e",
  "#8b5cf6",
  "#06b6d4",
];

export const getCampaignColor = (index: number) => {
  return CAMPAIGN_COLORS[index % CAMPAIGN_COLORS.length];
};
