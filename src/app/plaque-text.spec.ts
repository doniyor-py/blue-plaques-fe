import { plaqueName, lifeYears, roleLine, street, categoryLabel, averageRating, reviewCount } from './plaque-text';

describe('plaque text helpers', () => {
  const dickens = {
    title: 'Charles Dickens blue plaque',
    inscription: 'Charles Dickens 1812-1870 novelist lived here',
    address: '48 Doughty Street, Camden, WC1',
    category: 'literature',
    people: [{ name: 'Charles Dickens', born: 1812, died: 1870 }],
    visits: [
      { ratings: { history: 5, condition: 4, accessibility: 3 } },
      { ratings: { history: 5, condition: 5, accessibility: 5 } },
      { note: 'no review' }
    ]
  };

  it('should make the roundel lines', () => {
    expect(plaqueName(dickens)).toBe('Charles Dickens');
    expect(lifeYears(dickens)).toBe('1812–1870');
    expect(roleLine(dickens)).toBe('novelist lived here');
  });

  it('should fall back to the title and skip unknown years', () => {
    const plaque = { title: 'Stone plaque', inscription: 'Site of an inn', people: [] };
    expect(plaqueName(plaque)).toBe('Stone plaque');
    expect(lifeYears(plaque)).toBe('');
    expect(roleLine(plaque)).toBe('Site of an inn');
  });

  it('should show the street and category', () => {
    expect(street(dickens)).toBe('48 Doughty Street');
    expect(categoryLabel(dickens)).toBe('Writers');
  });

  it('should average only the visits that were rated', () => {
    expect(reviewCount(dickens)).toBe(2);
    expect(averageRating(dickens)).toBe(4.5);
    expect(averageRating({ visits: [] })).toBeNull();
  });
});
