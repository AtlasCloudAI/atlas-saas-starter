import { submitGen } from '@/lib/atlas';

export const IMAGE_TO_3D_TEMPLATE_ID = 'image-to-3d';
export const IMAGE_TO_3D_COST = 8;
export const IMAGE_TO_3D_MODEL = 'tencent/hunyuan3d-pro/image-to-3d';

export function normalizeFaceCount(value: unknown): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return 500000;
  return Math.max(40000, Math.min(1500000, Math.round(n)));
}

export async function submitImageTo3D(input: { image: string; pbr: boolean; faceCount: number }) {
  return submitGen({
    endpoint: 'generateImage',
    model: IMAGE_TO_3D_MODEL,
    image: input.image,
    imageField: 'image',
    extra: {
      generate_type: 'Normal',
      enable_pbr: input.pbr,
      face_count: input.faceCount,
    },
  });
}
