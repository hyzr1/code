import json
from pathlib import Path
rows=json.loads(Path('.check/expanded-cases.json').read_text());support=Path('.check/support.py').read_text()
total=0
for row in rows:
 scope={};exec(support,scope);exec(row['solution'],scope);scope['fn']=scope['Solution']
 for case in row['cases']:
  try: exec(case['code'],scope)
  except Exception as e: raise RuntimeError(row['id']+' '+case['name']+' '+str(e)) from e
  total+=1
print(f'Validated {total} independently generated cases across {len(rows)} problems.')
