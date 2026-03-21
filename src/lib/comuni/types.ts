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
}
