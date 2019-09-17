"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function compiler(description) {
    const matches = description.match(/(\w+)-(.+)/);
    if (!matches)
        throw new Error("invalid compiler string: " + description);
    switch (matches[1]) {
        case "dmd": return dmd(matches[2]);
        case "ldc": return ldc(matches[2]);
        default: throw new Error("unrecognized compiler: " + matches[1]);
    }
}
exports.compiler = compiler;
function dmd(version) {
    if (!version.match(/2.(\d+).(\d+)/))
        throw new Error("unrecognized DMD version:" + version);
    switch (process.platform) {
        case "win32": return {
            name: "dmd",
            version: version,
            url: `http://downloads.dlang.org/releases/2.x/${version}/dmd.${version}.windows.7z`,
            binpath: "\\dmd2\\windows\\bin"
        };
        case "linux": return {
            name: "dmd",
            version: version,
            url: `http://downloads.dlang.org/releases/2.x/${version}/dmd.${version}.linux.tar.xz`,
            binpath: "/dmd2/linux/bin64"
        };
        case "darwin": return {
            name: "dmd",
            version: version,
            url: `http://downloads.dlang.org/releases/2.x/${version}/dmd.${version}.osx.tar.xz`,
            binpath: "/dmd2/osx/bin/"
        };
        default:
            throw new Error("unsupported platform: " + process.platform);
    }
}
function ldc(version) {
    if (!version.match(/(\d+).(\d+).(\d+)/))
        throw new Error("unrecognized DMD version:" + version);
    switch (process.platform) {
        case "win32": return {
            name: "ldc2",
            version: version,
            url: `https://github.com/ldc-developers/ldc/releases/download/v${version}/ldc2-${version}-windows-multilib.7z`,
            binpath: `\\ldc2-${version}-windows-multilib\\bin`
        };
        case "linux": return {
            name: "ldc2",
            version: version,
            url: `https://github.com/ldc-developers/ldc/releases/download/v${version}/ldc2-${version}-linux-x86_64.tar.xz`,
            binpath: `/ldc2-${version}-linux-x86_64/bin`
        };
        case "darwin": return {
            name: "ldc2",
            version: version,
            url: `https://github.com/ldc-developers/ldc/releases/download/v${version}/ldc2-${version}-osx-x86_64.tar.xz`,
            binpath: `/ldc2-${version}-osx-x86_64/bin`
        };
        default:
            throw new Error("unsupported platform: " + process.platform);
    }
}