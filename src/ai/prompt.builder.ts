export function buildInteriorPrompt(data: {
  roomType: string;
  length: number;
  width: number;
  height: number;
  prompt?: string;
}) {
  const basePrompt = `
ultra realistic interior design render,
${data.roomType} room,
room size ${data.length}m x ${data.width}m,
ceiling height ${data.height}m,
modern architecture photography,
soft natural lighting,
8k interior render
`;

  if (!data.prompt) return basePrompt;

  return `
${basePrompt},
user preference: ${data.prompt}
`;
}
