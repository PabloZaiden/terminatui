import fs from 'fs';
import os from 'os';
import path from 'path';

export async function buildBinary(
    rootDir: string,
    entrypoint: string,
    binaryName: string, 
    plugins : Bun.BunPlugin[] = []) {

    // create a temp directory for output in the os temp directory
    const outDir = fs.mkdtempSync(path.join(os.tmpdir(), `${binaryName}-build-`));
    const finalOutDir = `${rootDir}/dist`;

    // Parse --target argument (e.g., --target=linux-x64)
    const targetArg = process.argv.find(arg => arg.startsWith('--target='));
    const target = targetArg?.split('=')[1] as
        | 'bun-linux-x64'
        | 'bun-linux-arm64'
        | 'bun-darwin-x64'
        | 'bun-darwin-arm64'
        | 'bun-windows-x64'
        | undefined;

    const outfile = target?.startsWith('bun-windows') ? `${outDir}/${binaryName}.exe` : `${outDir}/${binaryName}`;
    console.info('Building binary...');
    if (target) {
        console.info(`Target: ${target}`);
    }

    const result = await Bun.build({
        entrypoints: [entrypoint],
        compile: target
            ? { outfile, target }
            : { outfile },
        plugins: plugins,
        minify: true,
        sourcemap: true,
        define: {
            'process.env.NODE_ENV': JSON.stringify('production'),
        },
    });

    if (!result.success) {
        console.error('Build failed:');
        for (const _log of result.logs) {
            console.error(_log);
        }
        process.exit(1);
    }


    console.info('Ensuring dist directory exists...');
    fs.mkdirSync(finalOutDir, { recursive: true });

    console.info('Copying built file to dist directory...');
    const finalBinaryPath = `${finalOutDir}/${target ? `${binaryName}-${target.replace('bun-', '')}` : binaryName}`;
    fs.copyFileSync(outfile, finalBinaryPath);

    console.info('Cleaning up temporary files...');
    fs.rmSync(outDir, { recursive: true, force: true });

    console.info('Build completed:', finalBinaryPath);
}