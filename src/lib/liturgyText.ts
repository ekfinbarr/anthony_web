/**
 * Pamphlet markup for liturgy texts (Order of Mass, Baptism, Wake Keep, …).
 *
 * Written so text can be pasted from a printed pamphlet with light edits:
 *
 *   ## Penitential Act         sub-heading
 *   > The people stand.        rubric (instruction, shown in red italics)
 *   P: The Lord be with you.   speaker line — known role labels, any language
 *   R: And with your spirit.   people's part (shown in bold)
 *   @Choir: …                  any other speaker label, prefixed with "@"
 *   plain line                 continues the previous speaker, or a paragraph
 *   (blank line)               ends the current block
 */

export type LiturgyBlock =
  | { kind: "heading"; text: string }
  | { kind: "rubric"; text: string }
  | { kind: "speech"; speaker: string; people: boolean; lines: string[] }
  | { kind: "text"; lines: string[] };

/** Labels for the assembly's parts — rendered in bold. Lower-case, accents kept. */
const PEOPLE_LABELS = [
  "r", "r.", "resp", "response", "people", "all", "congregation", "assembly",
  "parents", "godparents", "parents and godparents", "family",
  // Yoruba
  "gbogbo", "ìjọ", "ijo", "àwọn ènìyàn", "awon eniyan",
  // Igbo
  "ndị mmadụ", "ndi mmadu", "mmadụ niile", "mmadu niile", "ụka", "uka", "nzaghachi",
  // Hausa
  "jama'a", "duka", "dukka",
  // Latin / Pidgin
  "omnes", "everybody", "all of us",
];

/** Labels for ministers — rendered as a role tag. */
const MINISTER_LABELS = [
  "p", "p.", "priest", "celebrant", "c", "d", "deacon", "l", "reader", "lector",
  "leader", "cantor", "psalmist", "minister", "catechist", "v", "v.", "commentator",
  // Yoruba
  "àlùfáà", "alufaa", "alufa", "olùdarí", "oludari", "òǹkàwé", "onkawe",
  // Igbo
  "onye nchụàjà", "onye nchuaja", "fada", "onye ọgụgụ", "onye ogugu", "onye ndu",
  // Hausa
  "firist", "liman", "mai karatu",
  // Latin
  "sacerdos", "diaconus", "lector",
];

const KNOWN = new Map<string, boolean>([
  ...MINISTER_LABELS.map((l) => [l, false] as const),
  ...PEOPLE_LABELS.map((l) => [l, true] as const),
]);

const SPEAKER = /^([^:]{1,32}):\s*(.*)$/u;

function matchSpeaker(line: string): { speaker: string; people: boolean; text: string } | null {
  if (line.startsWith("@")) {
    const m = line.slice(1).match(SPEAKER);
    return m ? { speaker: m[1].trim(), people: false, text: m[2] } : null;
  }

  const m = line.match(SPEAKER);
  if (!m) return null;
  const label = m[1].trim();
  const people = KNOWN.get(label.toLocaleLowerCase());
  return people === undefined ? null : { speaker: label, people, text: m[2] };
}

export function parseLiturgyText(body: string): LiturgyBlock[] {
  const blocks: LiturgyBlock[] = [];
  let current: Extract<LiturgyBlock, { kind: "speech" | "text" }> | null = null;

  for (const raw of body.replace(/\r\n/g, "\n").split("\n")) {
    const line = raw.trim();

    if (!line) {
      current = null;
      continue;
    }

    if (line.startsWith("##")) {
      blocks.push({ kind: "heading", text: line.replace(/^#+\s*/, "") });
      current = null;
      continue;
    }

    if (line.startsWith(">")) {
      blocks.push({ kind: "rubric", text: line.replace(/^>\s*/, "") });
      current = null;
      continue;
    }

    const speech = matchSpeaker(line);
    if (speech) {
      current = { kind: "speech", speaker: speech.speaker, people: speech.people, lines: speech.text ? [speech.text] : [] };
      blocks.push(current);
      continue;
    }

    if (current) {
      current.lines.push(line);
    } else {
      current = { kind: "text", lines: [line] };
      blocks.push(current);
    }
  }

  return blocks;
}

/** URL-safe anchor for a section title. */
export function sectionAnchor(index: number, title: string): string {
  const slug = title
    .toLocaleLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `part-${index + 1}${slug ? `-${slug}` : ""}`;
}
