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
  title: string;
  html: string;
  image: boolean;
}
export enum SviatoType {
  'Державні свята',
  'Свята в Україні',
  'Свята в світі',
  'Церковні свята',
}
export enum CompleteStatus {
  'EMPTY',
  'PARTIAL',
  'FILLED',
  'OPENAI',
}
export enum SviatoTag {
  'Державні свята' = 'Державні свята',
  'Українські свята' = 'Українські свята',
  'Професійні свята' = 'Професійні свята',
  'Релігійні свята' = 'Релігійні свята',
  'Національні свята' = 'Національні свята',
  'Міжнародні свята' = 'Міжнародні свята',
}
export interface DayInfo {
  dayOfMonth: number;
  year: number;
  month: number;
  date: string;
  dayOfYear: number;
  isFilled: boolean;
}
