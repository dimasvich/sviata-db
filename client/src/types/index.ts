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
