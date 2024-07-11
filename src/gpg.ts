import * as tc from '@actions/tool-cache';
import * as exec from '@actions/exec'

// hack to workaround gpg on windows interaction with paths
function win_path_to_msys(path: string) {
    if (process.platform != "win32")
        return path;        
    path = path.replace('\\', '/')
    const drive = path[0];
    path = '/' + drive + path.slice(2)
    return path;
}

export async function verify(file_path: string, sig_url: string) {
    let keyring = await tc.downloadTool("https://dlang.org/d-keyring.gpg");
    keyring = win_path_to_msys(keyring);
    let sig_path = await tc.downloadTool(sig_url);
    sig_path = win_path_to_msys(sig_path);
    await exec.exec(
	'gpg',
        [ '--lock-never', '--verify', '--keyring', keyring, '--no-default-keyring',
          sig_path, file_path ]
    )
}

export async function install() {
    // other platforms have gpg pre-installed
    if (process.platform == "darwin") {
	await exec.exec('brew', [ 'install', 'gnupg' ])
    }
}
