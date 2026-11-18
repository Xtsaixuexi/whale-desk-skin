"""Build and verify a tracked, runtime-only skin candidate with stdlib Python."""
from pathlib import Path, PurePosixPath
import hashlib
import json
import posixpath
import re
import subprocess
import zipfile

ROOT = Path(__file__).resolve().parent.parent
SKIN = ROOT / 'skins/whale-desk'
TOP_FILES = {'skin.json', 'skin.css', 'patches.css', 'NOTICE', 'LICENSE',
             'LICENSE-ARTWORK', 'ARTWORK.json', 'README.md', 'README.zh.md'}
ASSET_EXTENSIONS = {'.svg', '.png', '.jpg', '.jpeg', '.webp', '.gif',
                    '.ttf', '.otf', '.woff', '.woff2', '.txt'}

def git(*args):
    return subprocess.check_output(['git', '-C', str(ROOT), *args])

def sha(data):
    return hashlib.sha256(data).hexdigest()

def validate(entries):
    manifest = json.loads(entries['skin.json'])
    if manifest['id'] != 'whale-desk' or manifest['skinManifestVersion'] != 2:
        raise ValueError('Unexpected skin identity')
    if not re.fullmatch(r'\d+\.\d+\.\d+(?:-[A-Za-z0-9.-]+)?', manifest['version']):
        raise ValueError('Invalid version for archive filename')
    def ref(source, value):
        if not value or re.match(r'(?:[a-z][\w+.-]*:|#|//)', value, re.I):
            return
        target = posixpath.normpath(posixpath.join(posixpath.dirname(source), value.split('#')[0].split('?')[0]))
        if target not in entries:
            raise ValueError(f'Unpackaged reference: {source}: {value}')
    for value in [manifest['contributes']['stylesheet'], manifest['contributes']['patches'],
                  *manifest['preview'].values(),
                  *(x['src'] for x in manifest['contributes']['backgroundMedia'].values())]:
        ref('skin.json', value)
    for name, data in entries.items():
        if Path(name).suffix in {'.css', '.svg'}:
            text = data.decode('utf-8')
            for value in re.findall(r'''url\(\s*['"]?([^)'"\s]+)['"]?\s*\)''', text):
                ref(name, value)
            for value in re.findall(r'''(?:src|(?:xlink:)?href)\s*=\s*["']([^"']+)["']''', text):
                ref(name, value)
        if name.endswith('.md'):
            for value in re.findall(r'!?\[[^\]]*\]\(([^\s)]+)\)', data.decode('utf-8')):
                ref(name, value)
    return manifest

def main():
    subprocess.run(['node', 'scripts/check-release.mjs'], cwd=ROOT, check=True)
    revision = git('rev-parse', 'HEAD').decode().strip()
    dirty = bool(git('status', '--porcelain').strip())
    tracked = git('ls-files', '-z', '--', 'skins/whale-desk').decode().split('\0')
    entries = {}
    source = f'https://github.com/Xtsaixuexi/whale-desk-skin/blob/{revision}/skins/whale-desk/'
    for tracked_path in filter(None, tracked):
        name = PurePosixPath(tracked_path).relative_to('skins/whale-desk').as_posix()
        parts = PurePosixPath(name).parts
        if name not in TOP_FILES and not (parts[0] in {'assets', 'preview'} and Path(name).suffix.lower() in ASSET_EXTENSIONS):
            continue
        file = SKIN / name
        if file.is_symlink() or not file.resolve().is_relative_to(SKIN.resolve()):
            raise ValueError(f'Unsafe package path: {name}')
        data = file.read_bytes()
        if name.endswith('.md'):
            # Development records stay in the source repository, not the install ZIP.
            data = data.decode('utf-8').replace('](TESTING.md)', ']('+source+'TESTING.md)').encode('utf-8')
        entries[name] = data
    missing = TOP_FILES - entries.keys()
    if missing:
        raise ValueError(f'Missing required files: {sorted(missing)}')
    manifest = validate(entries)
    out = ROOT / 'dist'
    out.mkdir(exist_ok=True)
    archive = out / f'whale-desk-{manifest["version"]}-{revision[:8]}.zip'
    with zipfile.ZipFile(archive, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=6) as z:
        for name, data in sorted(entries.items()):
            info = zipfile.ZipInfo('whale-desk/'+name, date_time=(2000, 1, 1, 0, 0, 0))
            info.compress_type = zipfile.ZIP_DEFLATED
            info.create_system = 3
            info.external_attr = 0o100644 << 16
            z.writestr(info, data)
    with zipfile.ZipFile(archive) as z:
        if z.testzip() is not None:
            raise ValueError('Archive CRC check failed')
        if set(z.namelist()) != {'whale-desk/'+x for x in entries}:
            raise ValueError('Unexpected archive content')
        for name, data in entries.items():
            if z.read('whale-desk/'+name) != data:
                raise ValueError('Archive byte mismatch: '+name)
    report = {'kind': 'installation-candidate-not-market-approval', 'version': manifest['version'],
              'sourceCommit': revision, 'workingTreeDirty': dirty,
              'archive': archive.name, 'archiveSha256': sha(archive.read_bytes()),
              'characterPermission': 'Author Xtsaixuexi declares required use and redistribution permissions obtained; see NOTICE for author responsibility and applicable license scope',
              'files': [{'path': k, 'bytes': len(v), 'sha256': sha(v)} for k, v in sorted(entries.items())]}
    metadata = out / 'package-manifest.json'
    metadata.write_text(json.dumps(report, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    (out/'SHA256SUMS.txt').write_text(''.join(f'{sha(p.read_bytes())}  {p.name}\n' for p in [archive, metadata]), encoding='utf-8')
    print(json.dumps({'status':'PASS', 'archive':archive.name, 'files':len(entries),
                      'sourceCommit':revision, 'workingTreeDirty':dirty}))

if __name__ == '__main__':
    main()
