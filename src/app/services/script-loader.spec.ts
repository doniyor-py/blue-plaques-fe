import { TestBed } from '@angular/core/testing';

import { ScriptLoader } from './script-loader';

describe('ScriptLoader', () => {
  let loader: ScriptLoader;
  const missing = '/this-script-does-not-exist.js';

  beforeEach(() => {
    TestBed.configureTestingModule({});
    loader = TestBed.inject(ScriptLoader);
  });

  afterEach(() => {
    document.querySelectorAll(`script[src="${missing}"]`).forEach(s => s.remove());
  });

  function scriptsOnPage(): number {
    return document.querySelectorAll(`script[src="${missing}"]`).length;
  }

  it('adds the script to the page only once, however often it is asked for', () => {
    const first = loader.load(missing);
    const second = loader.load(missing);
    expect(second).toBe(first);
    expect(scriptsOnPage()).toBe(1);
    first.catch(() => undefined);
  });

  it('fails when the script cannot load, and removes the broken tag', async () => {
    await expectAsync(loader.load(missing)).toBeRejected();
    expect(scriptsOnPage()).toBe(0);
  });

  it('tries again on the next call after a failure', async () => {
    await expectAsync(loader.load(missing)).toBeRejected();
    const retry = loader.load(missing);
    expect(scriptsOnPage()).toBe(1);
    await expectAsync(retry).toBeRejected();
  });
});
