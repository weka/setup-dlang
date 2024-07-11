import * as utils from '../src/utils'
import * as tc from '@actions/tool-cache'

describe('Test autodetection of archive type from suffix', () => {
    const sz = jest.spyOn(tc, 'extract7z').mockResolvedValue('')
    const zip = jest.spyOn(tc, 'extractZip').mockResolvedValue('')
    const tar = jest.spyOn(tc, 'extractTar').mockResolvedValue('')
    afterEach(() => {
	expect(sz).toHaveBeenCalledTimes(0)
	expect(zip).toHaveBeenCalledTimes(0)
	expect(tar).toHaveBeenCalledTimes(0)
    })

    function myExtract(format: string) { return utils.extract(format, '') }

    test('7-zip', async () => {
	for (const possible of [
	    'file.7z',
	    '.7z',
	    'https://downloads.dlang.org/releases/2.x/2.109.1/dmd.2.109.1.windows.7z',
	]) {
	    await myExtract(possible)
	    expect(sz).toHaveBeenCalledTimes(1)
	    sz.mockClear()
	}
    })

    test('zip', async () => {
	for (const possible of [
	    'archive.zip',
	    '.zip',
	    'https://downloads.dlang.org/releases/2.x/2.065.0/dmd.2.065.0.linux.zip',
	]) {
	    await myExtract(possible)
	    expect(zip).toHaveBeenCalledTimes(1)
	    zip.mockClear()
	}
    })

    test('tar', async () => {
	for (const possible of [
	    'a.tar',
	    'a.tar.xz',
	    '.tar',
	    '.tar.gz',
	    'https://downloads.dlang.org/releases/2.x/2.078.1/dmd.2.078.1.osx.tar.xz',
	]) {
	    await myExtract(possible)
	    expect(tar).toHaveBeenCalledTimes(1)
	    tar.mockClear()
	}
    })
})
