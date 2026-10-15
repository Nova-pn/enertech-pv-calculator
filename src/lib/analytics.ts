import { supabase } from './supabase';

export type AnalyticsEventName =
  | 'page_view'
  | 'sizing_started'
  | 'sizing_completed'
  | 'pdf_generated'
  | 'project_saved'
  | 'supplier_viewed'
  | 'supplier_whatsapp_clicked'
  | 'supplier_phone_clicked'
  | 'catalog_item_selected';

const SESSION_KEY = 'enertech-analytics-session';

function sessionId() {
  const existing = localStorage.getItem(SESSION_KEY);
  if (existing) return existing;
  const value = crypto.randomUUID();
  localStorage.setItem(SESSION_KEY, value);
  return value;
}

export async function trackEvent(eventName: AnalyticsEventName, eventData: Record<string, unknown> = {}) {
  if (!supabase) return;
  try {
    const { data } = await supabase.auth.getSession();
    const { error } = await supabase.from('activity_events').insert({
      session_id: sessionId(),
      user_id: data.session?.user.id ?? null,
      event_name: eventName,
      event_data: eventData,
      language: document.documentElement.lang || 'fr',
    });
    if (error) console.warn('[analytics]', error.message);
  } catch (error) {
    console.warn('[analytics]', error);
  }
}
