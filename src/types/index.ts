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
