import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { deductCredits, grantCredits } from '@/lib/credits';
import {
  PICTURE_BOOK_CHARACTER_COST,
  PICTURE_BOOK_CHARACTER_MODEL,
  PICTURE_BOOK_CHARACTER_TEMPLATE_ID,
  PICTURE_BOOK_PAGE_COST,
  PICTURE_BOOK_PAGE_TEMPLATE_ID,
  PICTURE_BOOK_REFERENCE_MODEL,
  cleanPictureBookField,
  submitPictureBookCharacterImage,
  submitPictureBookPageImage,
} from '@/lib/picture-book';

function dataImage(value: unknown): string | undefined {
  return typeof value === 'string' && value.startsWith('data:image/') ? value : undefined;
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const type = body.type === 'page' ? 'page' : 'character';
  const prompt = cleanPictureBookField(body.prompt, '', 1800);
  const childPhoto = dataImage(body.childPhoto);
  const characterImage = type === 'page' ? dataImage(body.characterImage) || (typeof body.characterImage === 'string' && body.characterImage.startsWith('http') ? body.characterImage : undefined) : undefined;
  if (prompt.length < 12) return NextResponse.json({ error: 'prompt_required' }, { status: 400 });
  if (type === 'page' && !characterImage) return NextResponse.json({ error: 'character_image_required' }, { status: 400 });
  const totalInputSize = [childPhoto, characterImage].filter(Boolean).join('').length;
  if (totalInputSize > 9_000_000) return NextResponse.json({ error: 'image_too_large' }, { status: 400 });

  const templateId = type === 'page' ? PICTURE_BOOK_PAGE_TEMPLATE_ID : PICTURE_BOOK_CHARACTER_TEMPLATE_ID;
  const cost = type === 'page' ? PICTURE_BOOK_PAGE_COST : PICTURE_BOOK_CHARACTER_COST;
  const model = type === 'page' || childPhoto ? PICTURE_BOOK_REFERENCE_MODEL : PICTURE_BOOK_CHARACTER_MODEL;

  try {
    await deductCredits(session.user.id, cost, 'generate', templateId);
  } catch {
    return NextResponse.json({ error: 'insufficient_credits' }, { status: 402 });
  }

  let res;
  try {
    res =
      type === 'page'
        ? await submitPictureBookPageImage({ prompt, characterImage: characterImage!, childPhoto })
        : await submitPictureBookCharacterImage({ prompt, childPhoto });
  } catch (e) {
    await grantCredits(session.user.id, cost, 'refund', templateId);
    return NextResponse.json({ error: 'atlas_submit_failed', detail: String(e) }, { status: 502 });
  }

  const creation = await prisma.creation.create({
    data: {
      userId: session.user.id,
      templateId,
      model,
      prompt,
      inputImage: characterImage || childPhoto || null,
      status: 'processing',
      taskId: res.id,
      getUrl: res.getUrl,
      cost,
    },
  });

  return NextResponse.json({ id: creation.id, status: 'processing' });
}
