export interface ReportBranding {
  companyName: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  primaryColor: string;
  logoDataUrl: string;
}

const KEY = 'enertech-report-branding';

export const defaultBranding: ReportBranding = {
  companyName: '', address: '', phone: '', email: '', website: '', primaryColor: '#0f3d2e', logoDataUrl: '',
};

export function loadBranding(): ReportBranding {
  try { return { ...defaultBranding, ...(JSON.parse(localStorage.getItem(KEY) || '{}') as Partial<ReportBranding>) }; } catch { return defaultBranding; }
}

export function saveBranding(branding: ReportBranding) {
  localStorage.setItem(KEY, JSON.stringify(branding));
}
