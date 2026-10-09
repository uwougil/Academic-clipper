// Pure strings only. Do not import the real-source test with its top-level clips.
import assert from 'node:assert/strict';
import dns from 'node:dns';
import dnsPromises from 'node:dns/promises';
import {writeFile} from 'node:fs/promises';
import {syncBuiltinESMExports} from 'node:module';
import {after, test} from 'node:test';
import {assertChemicalGroupFormula} from './helpers/chemical-group-output-oracle.mjs';

const attempts = [];
const original = {fetch: globalThis.fetch, lookup: dns.lookup, promiseLookup: dnsPromises.lookup};
globalThis.fetch = async (...args) => {attempts.push({kind: 'HTTP', target: String(args[0])}); throw new Error('Unexpected pure-oracle HTTP');};
dns.lookup = (...args) => {attempts.push({kind: 'DNS', target: String(args[0])}); throw new Error('Unexpected pure-oracle DNS');};
dnsPromises.lookup = async (...args) => {attempts.push({kind: 'DNS-promise', target: String(args[0])}); throw new Error('Unexpected pure-oracle DNS');};
syncBuiltinESMExports();
const observations = [];
after(async () => {
  globalThis.fetch = original.fetch; dns.lookup = original.lookup; dnsPromises.lookup = original.promiseLookup;
  syncBuiltinESMExports();
  const lifecycle = {attempts, restoredNetworkBindings: globalThis.fetch === original.fetch && dns.lookup === original.lookup && dnsPromises.lookup === original.promiseLookup,
    parses: 0, clips: 0, sourceReads: 0, sourceAudits: 0,
    zeroParseProof: 'Only builtin modules and the test-only string oracle are imported; no production module or DOM API.'};
  if (process.env.CHEMICAL_GROUP_ORACLE_RECEIPT) await writeFile(process.env.CHEMICAL_GROUP_ORACLE_RECEIPT,
    JSON.stringify({version: 'chemical-group-output-oracle-controls/1.0', observations, lifecycle}, null, 2) + '\n');
  assert.deepEqual(attempts, []);
  assert.equal(lifecycle.restoredNetworkBindings, true);
});

const valid = [
  [0, '$\\mathrm{Pb}(\\mathrm{OAc})_{4}$'],
  [1, '$\\mathrm{Fe}_{2}(\\mathrm{ox})_{3}$'],
  [2, '$(\\mathrm{CD}_{3})_{2}\\mathrm{CO}$'],
  [0, 'Pb(OAc)₄'], [1, 'Fe₂(ox)₃'], [2, '(CD₃)₂CO'],
  [0, '$ \\text{Pb} \\left(\\mathrm{OAc}\\right) _{4} $'],
  [1, '$\\mathrm{Fe}_{2}\\, (\\text{ox})_{3}$'],
  [2, '$\\left(\\text{CD}_{3}\\right)_{2} \\quad \\mathrm{CO}$'],
];
const invalid = [
  [0, '$Pb(OAc)_{4}0$'], [0, 'Pb(OAc)₄₀'], [0, '$Pb(OAc)_40$'],
  [1, '$Fe_{2}(ox)_{3}9$'], [1, 'Fe₂(ox)₃₀'],
  [2, '$(CD_{3})_{2}CO7$'], [2, '(CD₃)₂CO₇'],
  [0, '$(OAc)_{4}$'], [1, '$(ox)_{3}$'], [2, '$(CD_{3})_{2}$'],
  [0, '$Pb(OAc)_{2}$'], [1, '$Fe_{3}(ox)_{3}$'], [1, '$Fe_{2}(ox)_{2}$'],
  [2, '$(CD_{2})_{2}CO$'], [2, '$(CD_{3})_{3}CO$'],
  [0, '$Pb(OAc)_{40}$'], [1, '$Fe_{20}(ox)_{3}$'], [2, '$(CD_{30})_{2}CO$'],
  [0, '$Pb(OAc)_{4}extra$'], [1, '$extraFe_{2}(ox)_{3}$'], [2, '$(CD_{3})_{2}C$'],
  [0, 'xPb(OAc)₄'], [0, 'Pb(OAc)₄x'], [1, 'Fe₂(ox)₃_'], [2, '(CD₃)₂CO\u0301'],
  [0, 'Pb(OAc)₄\u{10400}'], [0, 'Pb(OAc)₄\u{1D7CE}'],
  [0, '$Pb(OAc)_{4}$ and $Pb(OAc)_{4}$'],
  [1, '$Fe_{2}(ox)_{3}$ and Fe₂(ox)₃'],
  [2, '(CD₃)₂CO and (CD₃)₂CO'],
  [0, '$Pb(OAc)_{4}$ and $Pb(OAc)_{40}$'],
  [1, '$Fe_{2}$$(ox)_{3}$'], [2, '$(CD_{3})_{2}$CO'],
];
for (const [expectedPass, cases] of [[true, valid], [false, invalid]]) for (const [index, value] of cases) {
  test(`pure whole-formula oracle ${expectedPass ? 'accepts' : 'rejects'} role ${index}: ${value}`, () => {
    const observation = {index, value, expectedPass, status: 'UNEXECUTED'};
    try {
      if (expectedPass) assertChemicalGroupFormula(`before ${value}; after`, index);
      else assert.throws(() => assertChemicalGroupFormula(`before ${value}; after`, index), assert.AssertionError);
      observation.status = 'PASS';
    } finally {observations.push(observation);}
  });
}
