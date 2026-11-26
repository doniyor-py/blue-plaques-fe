export const CATEGORY_LABELS: Record<string, string> = {
  'literature': 'Writers',
  'science-medicine': 'Scientists',
  'music': 'Musicians',
  'politics-military': 'Politicians',
  'art-design': 'Artists',
  'film-tv-theatre': 'Film, TV & theatre',
  'royalty': 'Royalty',
  'sport': 'Sport',
  'other': 'Other'
};

export function plaqueName(plaque: any): string {
  const names = (plaque.people || []).map((person: any) => person.name);
  if (names.length === 0) { return shortTitle(plaque); }
  return names.length === 2 ? names.join(' & ') : names[0];
}

// "Charles Dickens blue plaque" -> "Charles Dickens"
function shortTitle(plaque: any): string {
  const title: string = plaque.title || '';
  const suffix = ' ' + plaque.colour + ' plaque';
  return title.length > suffix.length && title.toLowerCase().endsWith(suffix) ? title.slice(0, -suffix.length) : title;
}

export function lifeYears(plaque: any): string {
  const person = plaque.people?.[0];
  return person?.born && person?.died ? `${person.born}–${person.died}` : '';
}

export function roleLine(plaque: any): string {
  let text: string = plaque.inscription || '';
  const person = plaque.people?.[0];
  if (person?.name) { text = text.replace(person.name, ''); }
  if (lifeYears(plaque)) { text = text.replace(/\d{4}\s*-\s*\d{4}/, ''); }
  return text.replace(/\s+/g, ' ').trim();
}

export function street(plaque: any): string {
  return (plaque.address || '').split(',')[0].trim();
}

export function categoryLabel(plaque: any): string {
  return CATEGORY_LABELS[plaque.category] || '';
}

export function plaqueColour(plaque: any): string {
  const colours: Record<string, string> = {
    'blue': 'var(--plaque-blue)', 'green': 'var(--green-900)', 'black': 'var(--ink)', 'brown': 'var(--marker-brown)'
  };
  return colours[plaque?.colour] || 'var(--marker-other)';
}

export function initials(name: string): string {
  const parts = (name || '').split(/[\s._-]+/).filter(part => part);
  const letters = parts.length > 1 ? parts[0][0] + parts[1][0] : (parts[0] ?? '').slice(0, 2);
  return letters.toUpperCase();
}
