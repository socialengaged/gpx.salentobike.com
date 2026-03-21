import type { Locale } from '@/i18n/types';
import { getMessages } from '@/i18n/getMessages';

/** Labels shared by QuickSummary (comune page) and ComuniLayer map popup. */
export type SummaryLabels = {
  summaryTitle: string;
  summaryOsmNote: string;
  cuisineBadge: string;
  attractionsBadge: string;
  whatIsHere: string;
  fullCard: string;
  noData: string;
  rowSpec: string;
  rowAttr: string;
  hintSpec: string;
  hintAttr: string;
  hintOsm: string;
  rowFontane: string;
  rowRistoranti: string;
  rowFarmacie: string;
  rowOspedali: string;
  rowBici: string;
};

export function getSummaryLabels(locale: Locale): SummaryLabels {
  const m = getMessages(locale);
  return {
    summaryTitle: m['comune.summary_title'],
    summaryOsmNote: m['comune.summary_osm_note'],
    cuisineBadge: m['comune.cuisine_badge'],
    attractionsBadge: m['comune.attractions_badge'],
    whatIsHere: m['comune.what_is_here'],
    fullCard: m['comune.full_card'],
    noData: m['comune.no_data'],
    rowSpec: m['comune.row.spec'],
    rowAttr: m['comune.row.attr'],
    hintSpec: m['comune.row.hint_spec'],
    hintAttr: m['comune.row.hint_attr'],
    hintOsm: m['comune.row.hint_osm'],
    rowFontane: m['comune.row.fontane'],
    rowRistoranti: m['comune.row.ristoranti'],
    rowFarmacie: m['comune.row.farmacie'],
    rowOspedali: m['comune.row.ospedali'],
    rowBici: m['comune.row.bici'],
  };
}
