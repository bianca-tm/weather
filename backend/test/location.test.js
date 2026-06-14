const test = require('node:test');
const assert = require('node:assert/strict');
const { resolveLocation } = require('../server');

test('resolveLocation rejects unknown city/state combinations', async () => {
  await assert.rejects(
    () => resolveLocation({ city: 'NotARealCity', state: 'ZZ' }, async () => null),
    /We couldn't find weather data/i
  );
});

test('resolveLocation accepts matching city/state results', async () => {
  const location = await resolveLocation({ city: 'Dallas', state: 'Texas' }, async () => ({
    lat: 32.7767,
    lon: -96.797,
    address: {
      city: 'Dallas',
      state: 'Texas',
      state_code: 'TX'
    }
  }));

  assert.equal(location.city, 'Dallas');
  assert.equal(location.state, 'Texas');
  assert.equal(location.lat, 32.7767);
});

test('resolveLocation rejects mismatched city/state results', async () => {
  await assert.rejects(
    () => resolveLocation({ city: 'Dallas', state: 'Texas' }, async () => ({
      lat: 30.2672,
      lon: -97.7431,
      address: {
        city: 'Austin',
        state: 'Texas',
        state_code: 'TX'
      }
    })),
    /matching city\/state/i
  );
});
