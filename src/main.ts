import * as core from '@actions/core';
import * as tc from '@actions/tool-cache';
import { rmRF } from '@actions/io';
import * as gpg from './gpg';

import * as d from './d'
import { existsSync } from 'fs';
import { extract } from './utils'

async function run() {
    try {
        let default_compiler = "dmd-latest";
        if (process.arch != "x64") {
            default_compiler = "ldc-latest";
        }
        const input = core.getInput('compiler') || default_compiler;
        if (process.arch != "x64" && input.startsWith("dmd"))
            throw new Error("The dmd compiler is not supported for non-x64 architecture");
        const gh_token = core.getInput('gh_token') || "";
        const dub_version = core.getInput('dub') || "";
	let compiler: d.ITool
	if (input.startsWith('dmd'))
	    compiler = await d.DMD.initialize(input, gh_token)
	else if (input.startsWith('ldc'))
	    compiler = await d.LDC.initialize(input, gh_token)
	else
	    throw new Error(`Unrecognized compiler: '${input}'`)

	let dub: d.Dub | undefined
        if (dub_version.length) {
	    dub = await d.Dub.initialize(dub_version, gh_token)
            console.log(`Enabling ${input} with dub ${dub_version}`);
        } else
            console.log(`Enabling ${input}`);

	await compiler.makeAvailable()
	await dub?.makeAvailable()

        console.log("Done");
    } catch (error: any) {
	console.log(error);
	core.setFailed(error.message);
    }
}

run();
