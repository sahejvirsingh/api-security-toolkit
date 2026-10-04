import sanitize from "sanitize-html";

export function sanitizeHtml(dirty: string): string {
  if (typeof dirty !== "string") return "";
  return sanitize(dirty, {
    allowedTags: ["b", "i", "em", "strong", "span", "br", "p", "a"],
    allowedAttributes: {
      "*": ["class", "style"],
      "a": ["href", "target"]
    },
    textFilter: (text) => text,
    disallowedTagsMode: "discard",
  });
}

export function sanitizeText(input: string): string {
  if (typeof input !== "string") return "";
  return input
    .replace(/[<>]/g, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+=/gi, "")
    .replace(/data:/gi, "")
    .replace(/vbscript:/gi, "")
    .replace(/file:/gi, "")
    .trim();
}
