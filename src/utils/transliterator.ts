export function transliterate(text) {
  const map = {
    А: 'A',
    а: 'a',
    Б: 'B',
    б: 'b',
    В: 'V',
    в: 'v',
    Г: 'H',
    г: 'h',
    Ґ: 'G',
    ґ: 'g',
    Д: 'D',
    д: 'd',
    Е: 'E',
    е: 'e',
    Є: 'Ye',
    є: 'ie',
    Ж: 'Zh',
    ж: 'zh',
    З: 'Z',
    з: 'z',
    И: 'Y',
    и: 'y',
    І: 'I',
    і: 'i',
    Ї: 'Yi',
    ї: 'i',
    Й: 'Y',
    й: 'i',
    К: 'K',
    к: 'k',
    Л: 'L',
    л: 'l',
    М: 'M',
    м: 'm',
    Н: 'N',
    н: 'n',
    О: 'O',
    о: 'o',
    П: 'P',
    п: 'p',
    Р: 'R',
    р: 'r',
    С: 'S',
    с: 's',
    Т: 'T',
    т: 't',
    У: 'U',
    у: 'u',
    Ф: 'F',
    ф: 'f',
    Х: 'Kh',
    х: 'kh',
    Ц: 'Ts',
    ц: 'ts',
    Ч: 'Ch',
    ч: 'ch',
    Ш: 'Sh',
    ш: 'sh',
    Щ: 'Shch',
    щ: 'shch',
    Ю: 'Yu',
    ю: 'iu',
    Я: 'Ya',
    я: 'ia',
    Ь: '',
    ь: '',
    '’': '',
    "'": '',
  };

  let result = text
    .split('')
    .map((char) => (map[char] !== undefined ? map[char] : char))
    .join('');

  result = result
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return result;
}
export function formatDateForSlug(dateStr: string) {
  const months = [
    'sichnia',
    'liutoho',
    'bereznia',
    'kvitnia',
    'travnia',
    'chervnia',
    'lypnia',
    'serpnia',
    'veresnia',
    'zhovtnia',
    'lystopada',
    'hrudnia',
  ];

  const [year, month, day] = dateStr.split('-').map(Number);

  const monthSlug = months[month - 1];
  return `${day}-${monthSlug}`;
}
