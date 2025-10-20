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
