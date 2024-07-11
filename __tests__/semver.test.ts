import { parseSimpleSemver as p, cmpSemver as cmp } from '../src/semver'

function c(a: string, b: string) { return cmp(p(a), p(b)); }

test('Parsing semver', () => {
    expect(p('v1.2.3')).toStrictEqual([1, 2, 3, []])
    expect(p('2.3.1')).toStrictEqual([2, 3, 1, []])
    expect(p('1.24.3-beta.3+git-master+gdc-1')).toStrictEqual([1, 24, 3, ['beta', 3]])

    expect(p('0.7.1-alpha.0.1')).toStrictEqual([0, 7, 1, ['alpha', 0, 1]])
    expect(p('0.7.0-alpha.')).toStrictEqual([0, 7, 0, ['alpha', '']])

    expect(() => p('1.1-3-beta.1')).toThrow()
    expect(() => p('0.')).toThrow()
    expect(() => p('alpha-0.1.1')).toThrow()

    expect(p('0.1.2-pre-release.0.beta-2.a')).toStrictEqual(
	[0, 1, 2, ['pre-release', 0, 'beta-2', 'a']])

    expect(p('1.2.3-beta.alpha.0+git+108ahbc8d')).toStrictEqual(
	[1, 2, 3, ['beta', 'alpha', 0]])
})

test('Comparing semvers', () => {
    expect(c('v1.2.3', '1.2.3')).toBe(0)
    expect(c('1.2.3', '1.2.5')).toBeLessThan(0)
    expect(c('1.2.4', '1.2.3')).toBeGreaterThan(0)

    expect(c('0.9.11', '1.0.0')).toBeLessThan(0)
    expect(c('1.0.11', '1.2.0')).toBeLessThan(0)
    expect(c('1.0.0', '0.9.11')).toBeGreaterThan(0)
    expect(c('1.2.0', '1.0.11')).toBeGreaterThan(0)

    expect(c('0.1.2', '0.1.3-beta.1')).toBeLessThan(0)
    expect(c('0.1.2', '0.1.2-beta.1')).toBeGreaterThan(0)
    expect(c('0.1.3-beta.1', '0.1.2')).toBeGreaterThan(0)
    expect(c('0.1.2-beta.1', '0.1.2')).toBeLessThan(0)

    expect(c('0.1.2-beta.0.1', '0.1.2-beta.0.0')).toBeGreaterThan(0)
    expect(c('0.1.2-beta.0.1', '0.1.2-beta.0.1')).toBe(0)
    expect(c('0.1.2-beta.0.1', '0.1.2-beta.0.2')).toBeLessThan(0)

    expect(c('0.1.2-rc.0', '0.1.2-rc.0.2')).toBeLessThan(0)
    expect(c('0.1.2-rc.0', '0.1.2-rc.0.2')).toBeLessThan(0)

    expect(c('1.2.3', '0.9.8-alpha.2.0')).toBeGreaterThan(0)
    expect(c('0.9.8-alpha.2.0', '1.2.3')).toBeLessThan(0)

    expect(c('1.2.3-beta', '1.2.3-alpha')).toBeGreaterThan(0)
    expect(c('1.2.3-beta.1', '1.2.3-rc.1')).toBeLessThan(0)

    expect(c('1.2.3-beta.1', '1.2.3-beta.1')).toBe(0)
    expect(c('1.2.3-beta.1.alpha.2', '1.2.3-beta.1')).toBeGreaterThan(0)
})

test('Expected failures', () => {
    // Empty identifiers in pre-release aren't allowed
    expect(p('0.1.2-alpha..')).toStrictEqual([0, 1, 2, ['alpha', '', '']])
})
