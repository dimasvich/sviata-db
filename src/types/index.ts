export interface SviatoBlock {
  title?: string;
  description?: string;
  image?: string;
  alt?: string;
  staticList?: string[];
}
export enum DayRulesEnum {
  'ALLOWED' = 'Що можна робити сьогоді?',
  'FORBIDDEN' = 'Що не можна робити сьогоді?',
}
export interface Source {
  title: string;
  link: string;
}
export interface TimeBlock {
  year: string;
  html: string;
}
export interface Celebrate {
  when: string;
  date: string;
  isDayoff: boolean;
}
export interface WhoWasBornToday {
  year: string;
  title: string;
  html: string;
  image: string;
}
export enum SviatoType {
  'Державні свята',
  'Свята в Україні',
  'Свята в світі',
  'Церковні свята',
}
export enum CompleteStatus {
  EMPTY = 'EMPTY',
  PARTIAL = 'PARTIAL',
  FILLED = 'FILLED',
  OPENAI = 'OPENAI',
}
export enum SviatoTag {
  'Державні свята' = 'Державні свята',
  'Українські свята' = 'Українські свята',
  'Професійні свята' = 'Професійні свята',
  'Релігійні свята' = 'Релігійні свята',
  'Національні свята' = 'Національні свята',
  'Міжнародні свята' = 'Міжнародні свята',
}
export const SviatoTagToIdMap: Record<SviatoTag, number> = {
  [SviatoTag['Міжнародні свята']]: 13011,
  [SviatoTag['Українські свята']]: 13048,
  [SviatoTag['Професійні свята']]: 6076,
  [SviatoTag['Релігійні свята']]: 1824,
  [SviatoTag['Національні свята']]: 13052,
  [SviatoTag['Державні свята']]: 4999,
};
export interface DayInfo {
  dayOfMonth: number;
  year: number;
  month: number;
  date: string;
  dayOfYear: number;
  isFilled: boolean;
}
export interface Faq {
  question: string;
  answer: string;
}
