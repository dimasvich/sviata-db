import * as cheerio from 'cheerio';
import * as dayjs from 'dayjs';
import 'dayjs/locale/uk';

dayjs.locale('uk');

export function getNext5YearsForecast(date: string): {
  year: number;
  date: string;
  weekday: string;
}[] {
  const base = dayjs(date, ['YYYY-MM-DD', 'DD-MM-YYYY']);
  if (!base.isValid()) return [];

  const currentYear = dayjs().year();
  const years = [0, 1, 2, 3, 4].map((i) => currentYear + i);

  return years.map((year) => {
    const d = base.year(year);
    return {
      year,
      date: d.format('D MMMM'),
      weekday: d.format('dddd'),
    };
  });
}
export function capitalizeFirstLetter(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
export function removeBisSkinChecked(html: string): string {
  const $ = cheerio.load(html);

  $('[bis_skin_checked]').each((_, el) => {
    $(el).removeAttr('bis_skin_checked');
  });
  $('p').each((_, el) => {
    if (!$(el).text().trim()) {
      $(el).remove();
    }
  });
  return $.html();
}
export function groupSequentialImages(html: string): string {
  console.log('=== Початок групування ===');

  const figureRegex = /<figure[\s\S]*?<\/figure>/g;
  const matches = [...html.matchAll(figureRegex)];

  console.log(`Знайдено ${matches.length} <figure> елементів`);

  if (matches.length === 0) return html;

  const positions = matches.map((m) => ({
    html: m[0],
    start: m.index ?? 0,
    end: (m.index ?? 0) + m[0].length,
  }));

  const groups: (typeof positions)[] = [];
  let currentGroup: typeof positions = [];

  for (let i = 0; i < positions.length; i++) {
    const current = positions[i];
    const next = positions[i + 1];
    currentGroup.push(current);

    if (!next) {
      groups.push(currentGroup);
      break;
    }

    const between = html.slice(current.end, next.start);
    const onlyWhitespace = /^[\s\n\r\t]*$/.test(between);

    if (!onlyWhitespace) {
      groups.push(currentGroup);
      currentGroup = [];
    }
  }

  console.log(`Знайдено ${groups.length} груп(и)`);

  let output = html;
  for (let g = groups.length - 1; g >= 0; g--) {
    const group = groups[g];
    if (group.length <= 1) {
      console.log(
        `→ Група #${g} має лише ${group.length} елемент — пропускаємо`,
      );
      continue;
    }

    console.log(`→ Обгортання групи #${g} (${group.length} figure)`);

    const groupHtml = group.map((x) => x.html).join('\n');

    const wrapper = `
<div class="gallery-wrapper swiper">
  <figure class="wp-block-gallery has-nested-images columns-default is-cropped">
    ${groupHtml}
  </figure>
  <div class="swiper-pagination"></div>
</div>`;

    const start = group[0].start;
    const end = group[group.length - 1].end;
    output = output.slice(0, start) + wrapper + output.slice(end);
  }

  console.log('=== Кінець групування ===');
  console.log('\n=== Фінальний HTML ===\n', output);
  return output;
}
export function convertYouTubeLinks(html: string): string {
  return html.replace(
    /<p>\s*<a[^>]*class=["'][^"']*youtube-video[^"']*["'][^>]*href=["']([^"']+)["'][^>]*>.*?<\/a>\s*<\/p>\s*(?:<p>(.*?)<\/p>)?/g,
    (_, hrefLink, captionText = '') => {
      const figcaption = captionText
        ? `<figcaption class="wp-element-caption">${captionText.trim()}</figcaption>`
        : '';

      return `
          <figure class="wp-block-embed">
            <iframe 
              src="${hrefLink}"  
              title="YouTube video" 
              frameborder="0" 
              allowfullscreen
            ></iframe>
            ${figcaption}
          </figure>
      `;
    },
  );
}
export function convertImagesToFigure(html: string): string {
  const $ = require('cheerio').load(html, { decodeEntities: false });

  $('img').each((_, el) => {
    const $el = $(el);

    if ($el.parents('figure.wp-block-gallery').length > 0) {
      return;
    }

    const altText = $el.attr('alt')?.trim() || '';
    const figcaption = altText
      ? `<figcaption class="wp-element-caption">${altText}</figcaption>`
      : '';

    $el.replaceWith(`
      <figure class="wp-block-embed">
        ${$.html($el)}
        ${figcaption}
      </figure>
    `);
  });

  return $.html();
}
export function addNoFollow(html: string): string {
  return html.replace(/<a\s+([^>]*?)>/gi, (match, attrs) => {
    if (/rel\s*=\s*["'][^"']*["']/i.test(attrs)) {
      return match.replace(/rel\s*=\s*["']([^"']*)["']/i, (_full, relValue) => {
        const values = relValue.split(/\s+/);
        if (!values.includes('nofollow')) {
          values.push('nofollow');
        }
        return `rel="${values.join(' ')}"`;
      });
    } else {
      return `<a ${attrs} rel="nofollow">`;
    }
  });
}
