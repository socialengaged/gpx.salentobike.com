export interface Comune {
  istat: string;
  nome: string;
  slug: string;
  regione: string;
  provincia_sigla: string;
  cap: string | null;
  improved_intro: string | null;
  attractions_section: string | null;
  restaurants_section: string | null;
  lat: number | null;
  lon: number | null;
  /** OSM Overpass counts within ~5 km of comune center */
  poi_fontane?: number | null;
  poi_ristoranti?: number | null;
  poi_farmacie?: number | null;
  poi_ospedali?: number | null;
  poi_bici?: number | null;
}

export interface ComuneLite {
  istat: string;
  nome: string;
  slug: string;
  lat: number;
  lon: number;
  prov: string;
  hasRist: boolean;
  hasAttr: boolean;
  /** Conteggio specialità da testo schede (stima) */
  txt_spec: number;
  /** Conteggio luoghi/attrazioni da testo (stima) */
  txt_attr: number;
  poi_fontane?: number | null;
  poi_ristoranti?: number | null;
  poi_farmacie?: number | null;
  poi_ospedali?: number | null;
  poi_bici?: number | null;
}
