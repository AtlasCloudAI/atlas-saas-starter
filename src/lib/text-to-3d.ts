import { submitRawGen } from './atlas';

export const TEXT_TO_3D_MODEL = 'tencent/hunyuan3d-pro/text-to-3d';
export const TEXT_TO_3D_COST = 8;
export const TEXT_TO_3D_TEMPLATE_ID = 'text-to-3d';

export function normalizeText3DFaceCount(value: unknown) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 300000;
  return Math.max(40000, Math.min(1500000, Math.round(n)));
}

export function normalizeGenerateType(value: unknown) {
  return value === 'Geometry' ? 'Geometry' : 'Normal';
}

export async function submitTextTo3D({
  prompt,
  pbr,
  faceCount,
  generateType,
}: {
  prompt: string;
  pbr: boolean;
  faceCount: number;
  generateType: 'Normal' | 'Geometry';
}) {
  return submitRawGen('generateImage', {
    model: TEXT_TO_3D_MODEL,
    prompt,
    generate_type: generateType,
    enable_pbr: pbr,
    face_count: faceCount,
  });
}
