const tokenPattern =
  /(#.*$|\b(?:def|return|for|in)\b|\b\d+\b|\b(?:print|append|double)(?=\()|[()[\],.:*+=])/g;

export default function CodeSample({
  source,
  file,
}: {
  source: string;
  file: string;
}) {
  return (
    <div className="sample-editor">
      <div className="sample-toolbar">
        <span>
          <b aria-hidden="true">⌘</b>
          {file}
        </span>
        <span>
          Python <i>3</i>
        </span>
      </div>
      <pre aria-label={`${file} Python example`}>
        <code>
          {source.split("\n").map((line, index) => (
            <span className="sample-line" key={index}>
              <span className="sample-gutter" aria-hidden="true">
                {index + 1}
              </span>
              <span>
                {line.split(tokenPattern).map((token, i) => {
                  const type = token.startsWith("#")
                    ? "comment"
                    : /^(def|return|for|in)$/.test(token)
                      ? "keyword"
                      : /^\d+$/.test(token)
                        ? "number"
                        : /^(print|append|double)$/.test(token)
                          ? "function"
                          : /^[()[\],.:*+=]$/.test(token)
                            ? "punctuation"
                            : "plain";
                  return (
                    <span key={i} className={`syntax-${type}`}>
                      {token}
                    </span>
                  );
                })}
                {line.length === 0 ? " " : null}
              </span>
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}
