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
  if (names.length === 0) { return plaque.title; }
  return names.length === 2 ? names.join(' & ') : names[0];
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

export function averageRating(plaque: any): number | null {
  const rated = (plaque.visits || []).filter((visit: any) => visit.ratings);
  if (rated.length === 0) { return null; }
  const total = rated.reduce((sum: number, visit: any) =>
    sum + (visit.ratings.history + visit.ratings.condition + visit.ratings.accessibility) / 3, 0);
  return total / rated.length;
}

export function reviewCount(plaque: any): number {
  return (plaque.visits || []).filter((visit: any) => visit.ratings).length;
}
