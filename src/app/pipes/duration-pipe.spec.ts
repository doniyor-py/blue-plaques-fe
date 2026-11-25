import { DurationPipe } from './duration-pipe';

describe('DurationPipe', () => {
  const pipe = new DurationPipe();

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  const examples: [number, string][] = [
    [1, '1 min'],
    [3, '3 mins'],
    [45, '45 mins'],
    [60, '1 hr'],
    [61, '1 hr 1 min'],
    [67, '1 hr 7 mins'],
    [120, '2 hrs'],
    [135, '2 hrs 15 mins'],
    [59.6, '1 hr'],
    [2.4, '2 mins']
  ];

  for (const [minutes, text] of examples) {
    it(`shows ${minutes} minutes as "${text}"`, () => {
      expect(pipe.transform(minutes)).toBe(text);
    });
  }

  it('shows nothing when there is no value yet', () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
  });
});
