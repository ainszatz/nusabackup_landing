interface JsonLdProps {
  data: Record<string, unknown>
}

// JSON.stringify is safe for ld+json, but </script> inside a string value
// could close the tag early. Replace with the unicode escape sequence.
function safeJsonLd(data: Record<string, unknown>): string {
  return JSON.stringify(data).replace(/<\/script>/gi, '<\\/script>')
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLd(data) }}
    />
  )
}
