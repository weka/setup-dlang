import { GDC } from '../src/d'
import * as testUtils from './test-helpers.test'
import * as exec from '@actions/exec'

testUtils.saveProcessRestorePoint()
testUtils.hideConsoleLogs()
const origEnv = process.env
beforeEach(() => {
    process.env = origEnv
    jest.spyOn(exec, 'exec').mockResolvedValue(0)
    Object.defineProperty(process, 'platform', { value: 'linux' })
})
afterEach(() => jest.restoreAllMocks())

async function init (version: string) {
    const gdc = await GDC.initialize(version)
    await gdc.makeAvailable()
}

test('Test simple versions', async () => {
    await init('gdc')
    expect(process.env['DC']).toBe('/usr/bin/gdc')
    await init('gdc-13')
    expect(process.env['DC']).toBe('/usr/bin/gdc-13')
    await init('gdc-9')
    expect(process.env['DC']).toBe('/usr/bin/gdc-9')
})

test('Test error messages', async () => {
    await expect(init('dmd-2.109.0')).rejects.toThrow('dmd-2.109.0')
})

test('Test that gdc fails on non-Linux', async () => {
    for (const platform of [ 'win32', 'darwin', 'freebsd' ]) {
	Object.defineProperty(process, 'platform', { value: platform })
	await expect(init('gdc')).rejects.toThrow(platform)
    }
})
