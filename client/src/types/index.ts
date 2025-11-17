export interface SviatoBlock {
  title?: string;
  description?: string;
  image?: string;
  alt?: string;
  staticList?: string[];
}

export interface Article {
  id?: string;
  title: string;
  blocks: SviatoBlock[];
}
export enum SviatoType {
  'Державні свята',
  'Свята в Україні',
  'Свята в світі',
  'Церковні свята',
}
export enum DayRulesEnum {
  'ALLOWED' = 'Що можна робити сьогоді?',
  'FORBIDDEN' = 'Що не можна робити сьогоді?',
}
export interface Celebrate {
  when: string;
  date: string;
  isDayoff: boolean;
}
export interface WhoWasBornTodayItem {
  title: string;
  html: string;
  image: string;
  year?: string;
}

export interface DayType {
  title: string;
  description: string;
  date: string;
  checkedAlternative: boolean;
  dayRules: { title: string; html: string; _id?: string }[];
  whoWasBornToday: WhoWasBornTodayItem[];
  omens: string[];
  bornNames: string[];
  images: string[];
  mainImage: string | null;
  seoText: string;
  articleId: string | null;
  timeline: { year: string; html: string }[];
}

export interface SearchItem {
  _id: string;
  name: string;
}
