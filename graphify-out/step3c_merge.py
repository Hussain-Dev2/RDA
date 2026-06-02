import json
from pathlib import Path

# Load chunk results
chunk_paths = sorted(Path('graphify-out').glob('.graphify_chunk_*.json'))
semantic = {'nodes': [], 'edges': [], 'hyperedges': []}
for cp in chunk_paths:
    try:
        data = json.loads(cp.read_text())
        semantic['nodes'].extend(data.get('nodes', []))
        semantic['edges'].extend(data.get('edges', []))
        semantic['hyperedges'].extend(data.get('hyperedges', []))
        print(f'Loaded {cp.name}: {len(data.get("nodes",[]))} nodes, {len(data.get("edges",[]))} edges')
    except Exception as e:
        print(f'Warning: {cp.name} failed: {e}')

# Deduplicate nodes
seen = set()
deduped_nodes = []
for n in semantic['nodes']:
    if n['id'] not in seen:
        seen.add(n['id'])
        deduped_nodes.append(n)
semantic['nodes'] = deduped_nodes

Path('graphify-out/.graphify_semantic.json').write_text(json.dumps(semantic, indent=2))
print(f'Semantic total: {len(semantic["nodes"])} nodes, {len(semantic["edges"])} edges, {len(semantic["hyperedges"])} hyperedges')

# Merge with AST (Part C)
ast = json.loads(Path('graphify-out/.graphify_ast.json').read_text()) if Path('graphify-out/.graphify_ast.json').exists() else {'nodes':[],'edges':[],'input_tokens':0,'output_tokens':0}

seen_ids = {n['id'] for n in ast['nodes']}
merged_nodes = list(ast['nodes'])
for n in semantic['nodes']:
    if n['id'] not in seen_ids:
        merged_nodes.append(n)
        seen_ids.add(n['id'])

merged_edges = ast['edges'] + semantic['edges']
merged_hyperedges = semantic.get('hyperedges', [])

merged = {
    'nodes': merged_nodes,
    'edges': merged_edges,
    'hyperedges': merged_hyperedges,
    'input_tokens': semantic.get('input_tokens', 0),
    'output_tokens': semantic.get('output_tokens', 0),
}
Path('graphify-out/.graphify_extract.json').write_text(json.dumps(merged, indent=2))
print(f'Merged: {len(merged_nodes)} nodes, {len(merged_edges)} edges ({len(ast["nodes"])} AST + {len(semantic["nodes"])} semantic)')
