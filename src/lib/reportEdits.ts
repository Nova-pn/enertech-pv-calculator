export interface ReportEdits {
  title: string;
  introduction: string;
  technicalNotes: string;
  conclusion: string;
}

export const defaultReportEdits: ReportEdits = {
  title: '',
  introduction: '',
  technicalNotes: '',
  conclusion: '',
};

const KEY = 'enertech-report-edits';

export function loadReportEdits(): ReportEdits {
  try {
    return { ...defaultReportEdits, ...(JSON.parse(localStorage.getItem(KEY) || '{}') as Partial<ReportEdits>) };
  } catch {
    return defaultReportEdits;
  }
}

export function saveReportEdits(edits: ReportEdits) {
  localStorage.setItem(KEY, JSON.stringify(edits));
}
