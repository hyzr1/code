/** Read captured JSON or authored argument lines without evaluating code. */
export function inputFields(input: string): { name: string; value: string }[] {
  try {
    const parsed = JSON.parse(input);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return Object.entries(parsed).map(([name, value]) => ({ name, value: JSON.stringify(value) }));
    }
  } catch { /* Authored examples use Python-style assignment lines. */ }
  const lines = input.trim().split('\n');
  const matches = lines.map(line => /^([A-Za-z_]\w*)\s*=\s*(.+)$/.exec(line.trim()));
  if (matches.every(Boolean)) return matches.map(match => ({ name: match![1], value: match![2] }));
  return [{ name: '', value: input }];
}

export function InputFields({ input }: { input: string }) {
  return <div className="test-input-fields"><div className="test-field-label">Input</div>
    {inputFields(input).map((field, i) => <div className="test-value-box" key={i}>
      {field.name && <span className="test-argument-name">{field.name} =</span>}
      <pre>{field.value}</pre>
    </div>)}
  </div>;
}

export default function TestCaseFields({ input, output }: { input: string; output: string }) {
  return <div className="test-case-fields"><InputFields input={input} />
    <div className="test-field-label">Expected output</div><div className="test-value-box"><pre>{output}</pre></div>
  </div>;
}
