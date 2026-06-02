import json
from graphify.detect import detect
from pathlib import Path

result = detect(Path('.'))
Path('graphify-out/.graphify_detect.json').write_text(json.dumps(result))
print(f'Corpus: {result["total_files"]} files · ~{result["total_words"]} words')
ft = result['files']
for cat, files in ft.items():
    if files:
        print(f'  {cat}: {len(files)} files')
