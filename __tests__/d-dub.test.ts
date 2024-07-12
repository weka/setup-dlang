import { Dub } from '../src/d'
import * as testUtils from './test-helpers.test'
import * as utils from  '../src/utils'

testUtils.saveProcessRestorePoint()
testUtils.disableNetwork()
testUtils.hideConsoleLogs()

function init (version: string) { return Dub.initialize(version, '') }


test('Test dub URLs for exact versions', async () => {
    Object.defineProperty(process, 'arch', { value: 'x64' })

    Object.defineProperty(process, 'platform', { value: 'linux' })
    await expect(init('v1.38.1')).resolves.toHaveProperty(
	'url', 'https://github.com/dlang/dub/releases/download/v1.38.1/dub-v1.38.1-linux-x86_64.tar.gz')

    Object.defineProperty(process, 'platform', { value: 'darwin' })
    await expect(init('v1.38.1')).resolves.toHaveProperty(
	'url', 'https://github.com/dlang/dub/releases/download/v1.38.1/dub-v1.38.1-osx-x86_64.tar.gz')

    Object.defineProperty(process, 'platform', { value: 'win32' })
    await expect(init('v1.38.1')).resolves.toHaveProperty(
	'url', 'https://github.com/dlang/dub/releases/download/v1.38.1/dub-v1.38.1-windows-x86_64.zip')
})

test('Test that dub accepts both v<version> and <version>', async () => {
    Object.defineProperty(process, 'arch', { value: 'x64' })
    Object.defineProperty(process, 'platform', { value: 'linux' })
    await expect(init('v1.37.0')).resolves.toHaveProperty(
	'url', 'https://github.com/dlang/dub/releases/download/v1.37.0/dub-v1.37.0-linux-x86_64.tar.gz')
    await expect(init('1.37.0')).resolves.toHaveProperty(
	'url', 'https://github.com/dlang/dub/releases/download/v1.37.0/dub-v1.37.0-linux-x86_64.tar.gz')
})

test("Test that dub doesn't accept prereleases", async () => {
    const version = 'v1.13.0-rc.1'
    await expect(init(version)).rejects.toThrow(version)
})

test('Test that dub gracefully handles invalid versions', async () => {
    for (const bad of [ '1.2', 'xy', 'garbage', '1-2-3' ])
	await expect(init(bad)).rejects.toThrow(bad)
})

test('Test that dub fails on unsupported platforms', async () => {
    Object.defineProperty(process, 'platform', { value: 'freebsd' })
    await expect(init('1.37.0')).rejects.toThrow(process.platform)
})

describe('Test "latest"', () => {
    test('Test simple resolution', async () => {
	const version = 'v1.38.1'
	jest.spyOn(utils, 'body_as_text').mockImplementation(async (url) => {
	    if (url != 'https://api.github.com/repos/dlang/dub/releases/latest')
		throw new Error(`Unexpected query to '${url}'`)
	    return JSON.stringify({
		name: version,
		tag_name: version,
	    })
	})

	await expect(init('latest')).resolves.toHaveProperty('version', version)
    })

    test('Test releases with fancy titles', async () => {
	const version = 'v1.37.0'
	jest.spyOn(utils, 'body_as_text').mockResolvedValue(JSON.stringify({
	    name: `${version}: This is a description of the releases`,
	    tag_name: `${version}`,
	}))

	await expect(init('latest')).resolves.toHaveProperty('version', version)
    })
})

test('Test that dub adds itself to PATH', async () => {
    const dubDir = '/usr/cache/your/dub'
    const dub = await init('1.37.0')
    jest.spyOn(dub as any, 'getCached').mockResolvedValue(dubDir)
    const origEnv = process.env

    for (const system of [ 'linux', 'darwin', 'win32' ]) {
	process.env['PATH']='/bin'
	await dub.makeAvailable()
	expect(process.env['PATH']).toMatch(dubDir)
    }

    process.env = origEnv
})

test('Test that dub uses arm64 binaries on arm64 macos when available', async () => {
    Object.defineProperty(process, 'platform', { value: 'darwin' })

    Object.defineProperty(process, 'arch', { value: 'arm64' })
    await expect(init('v1.38.1')).resolves.toHaveProperty(
	'url', 'https://github.com/dlang/dub/releases/download/v1.38.1/dub-v1.38.1-osx-arm64.tar.gz')
    await expect(init('v1.38.0')).resolves.toHaveProperty(
	'url', 'https://github.com/dlang/dub/releases/download/v1.38.0/dub-v1.38.0-osx-x86_64.tar.gz')

    Object.defineProperty(process, 'arch', { value: 'x64' })
    await expect(init('v1.38.1')).resolves.toHaveProperty(
	'url', 'https://github.com/dlang/dub/releases/download/v1.38.1/dub-v1.38.1-osx-x86_64.tar.gz')
    await expect(init('v1.38.0')).resolves.toHaveProperty(
	'url', 'https://github.com/dlang/dub/releases/download/v1.38.0/dub-v1.38.0-osx-x86_64.tar.gz')
})
