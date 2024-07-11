import { Compiler } from '../src/d'
import fs from 'fs'

describe('Test Compiler class', () => {
    const logSpy = jest.spyOn(console, 'log').mockReturnValue(undefined)
    jest.spyOn(process.stdout, 'write').mockReturnValue(true)

    let originalEnv = process.env
    afterEach(() => process.env = originalEnv)

    beforeEach(() => logSpy.mockClear())

    const bin = '/relative/path/to/bin'
    const libs = [ '/first', '/second' ]
    const name = 'compiler_name'
    const dmdWrapper = 'dmd_wrapper'
    let c = new Compiler('url', undefined, name, 'ver', bin, libs, dmdWrapper)
    const root = '/root/folder'

    // The values are computed when d.ts is imported so
    // they will have the values of the host system, even
    // if process.platform is modified in the tests.
    const sep = process.platform == 'win32' ? '\\' : '/'
    const extension = process.platform == 'win32' ? '.exe' : ''
    const pathSep = (process.platform == 'win32' ? ';' : ':')

    test('Test setting PATH', () => {
	process.env['PATH']='/bin'
	c.addBinPath(root)
	expect(process.env['PATH']).toBe(root + bin + pathSep + '/bin')
	expect(logSpy).toHaveBeenCalledTimes(1)
    })

    test('Test setting LD_LIBRARY_PATH on UNIX', () => {
	for (let platform of [ 'linux', 'freebsd', 'darwin' ]) {
	    Object.defineProperty(process, 'platform', { value: platform })

	    process.env['LD_LIBRARY_PATH']=''
	    jest.spyOn(fs, 'existsSync').mockReturnValue(true)

	    c.addLibPaths(root)
	    expect(process.env['LD_LIBRARY_PATH']).toBe(
		root + libs[1] + ':' + root + libs[0])
	    expect(logSpy).toHaveBeenCalledTimes(2)
	    expect(logSpy.mock.calls[0][0]).toMatch(root + libs[0])
	    expect(logSpy.mock.calls[1][0]).toMatch(root + libs[1])
	    logSpy.mockClear()

	    process.env['LD_LIBRARY_PATH']=''
	    jest.spyOn(fs, 'existsSync')
		.mockReturnValueOnce(false)
		.mockReturnValueOnce(true)

	    c.addLibPaths(root)
	    expect(process.env['LD_LIBRARY_PATH']).toBe(root + libs[1])
	    expect(logSpy).toHaveBeenCalledTimes(1)
	    expect(logSpy.mock.calls[0][0]).toMatch(root + libs[1])
	    logSpy.mockClear()
	}
    })

    test('Test setting PATH for libraries on windows', () => {
	Object.defineProperty(process, 'platform', { value: 'win32' })

	process.env['PATH']='\\bin'
	jest.spyOn(fs, 'existsSync').mockReturnValue(true)

	c.addLibPaths(root)
	expect(process.env['PATH']).toBe(
	    root + libs[1] + pathSep + root + libs[0] + pathSep + '\\bin')
	expect(logSpy).toHaveBeenCalledTimes(2)
	expect(logSpy.mock.calls[0][0]).toMatch(root + libs[0])
	expect(logSpy.mock.calls[1][0]).toMatch(root + libs[1])
	logSpy.mockClear()

	process.env['PATH']='\\dir'
	jest.spyOn(fs, 'existsSync')
	    .mockReturnValueOnce(true)
	    .mockReturnValueOnce(false)

	c.addLibPaths(root)
	expect(process.env['PATH']).toBe(root + libs[0] + pathSep + '\\dir')
	expect(logSpy).toHaveBeenCalledTimes(1)
	expect(logSpy.mock.calls[0][0]).toMatch(root + libs[0])
	logSpy.mockClear()
    })

    test('Test makeAvailable', async () => {
	jest.spyOn(c, 'getCached').mockResolvedValue(root)

	for (const platform of [ 'linux', 'darwin', 'freebsd' ]) {
	    Object.defineProperty(process, 'platform', { value: platform })
	    jest.spyOn(fs, 'existsSync').mockReturnValue(true).
		mockReturnValueOnce(false)

	    process.env['PATH'] = '/bin'
	    process.env['LD_LIBRARY_PATH'] = ''
	    await c.makeAvailable()

	    expect(process.env['PATH']).toBe(root + bin + pathSep + '/bin')
	    expect(process.env['LD_LIBRARY_PATH']).toBe(root + libs[1])
	    expect(process.env['DC']).toBe(`${root}${bin}${sep}${name}${extension}`)
	    expect(process.env['DMD']).toBe(`${root}${bin}${sep}${dmdWrapper}${extension}`)
	}


	Object.defineProperty(process, 'platform', { value: 'win32' })
	jest.spyOn(fs, 'existsSync').mockReturnValue(true)

	process.env['PATH'] = '\\bin'
	await c.makeAvailable()

	const expPath = `${root}${libs[1]}${pathSep}` + `${root}${libs[0]}${pathSep}` +
	    `${root}${bin}${pathSep}` + '\\bin'
	expect(process.env['PATH']).toBe(expPath)
	expect(process.env['DC']).toBe(`${root}${bin}${sep}${name}${extension}`)
	expect(process.env['DMD']).toBe(`${root}${bin}${sep}${dmdWrapper}${extension}`)
    })

    test('DC and DMD get set to the absolute path of the compiler', () => {
	for (const platform of [ 'linux', 'win32', 'darwin', 'freebsd' ]) {
	    Object.defineProperty(process, 'platform', { value: platform })
	    c.setDC(root)
	    expect(process.env['DC']).toBe(root + bin + sep + name + extension)
	    expect(process.env['DMD']).toBe(root + bin + sep + dmdWrapper + extension)
	}
    })
})
