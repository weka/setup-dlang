import * as utils from '../src/utils'

export function mockTags (expectedUrl: string | RegExp, pages: string[][]) {
    async function mocker (url: string, token: string,
			   callback: (tag: utils.IGithubTag) => boolean) {
	expect(url).toMatch(expectedUrl)
	const m = url.match(/(?:\?page=([0-9]+))?$/)
	const initialPageIndex = (m!![1] !== undefined ? parseInt(m!![1]) - 1 : 0)
	let pageIndex = initialPageIndex

	while (pageIndex < pages.length) {
	    let didBreak = false
	    for (const tagName of pages[pageIndex]) {
		const tag: utils.IGithubTag = {
		    name: tagName,
		    zipball_url: '', tarball_url: '',
		    commit: { sha: '', urm: '' },
		    node_id: ''
		}
		if (!callback(tag)) {
		    didBreak = true
		    break
		}
	    }
	    if (didBreak)
		break
	    ++ pageIndex
	}

	return pageIndex - initialPageIndex
    }
    jest.spyOn(utils, 'visitTags').mockImplementation(mocker);
}

export function saveProcessRestorePoint () {
    const origArch = process.arch
    const origPlatform = process.platform
    afterEach(() => {
	Object.defineProperty(process, 'platform', { value: origPlatform })
	Object.defineProperty(process, 'arch', { value: origArch })
    })
}

export function disableNetwork () {
    beforeEach(() => {
	function fail (): never {
	    throw new Error("No network access is allowed during these tests!")
	}
	jest.spyOn(utils, 'body_as_text').mockImplementation(fail)
	jest.spyOn(utils, 'get_response').mockImplementation(fail)
	jest.spyOn(utils, 'visitTags').mockImplementation(fail)
    })
}

export function hideConsoleLogs () {
    beforeEach(() => jest.spyOn(console, 'log').mockReturnValue(undefined))
    beforeEach(() => jest.spyOn(process.stdout, 'write').mockReturnValue(true))
}
