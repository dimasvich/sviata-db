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
export enum SviatoType {
  'Державні свята',
  'Свята в Україні',
  'Свята в світі',
  'Церковні свята',
}
export enum SviatoTag {
  'Державні свята' = 'Державні свята',
  'Українські свята' = 'Українські свята',
  'Професійні свята' = 'Професійні свята',
  'Релігійні свята' = 'Релігійні свята',
  'Закордонні свята' = 'Закордонні свята',
  'Міжнародні свята' = 'Міжнародні свята',
  'Тематичні свята' = 'Тематичні свята',
}
export interface DayInfo {
  dayOfMonth: number;
  year: number;
  month: number;
  date: string;
  dayOfYear: number;
  isFilled: boolean;
}
