import { SshFileRepository } from '@/src/infrastructure/repositories/system/SshFileRepository';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const serverId = searchParams.get('serverId');
  const path = searchParams.get('path') || '/';

  if (!serverId) {
    return NextResponse.json({ error: 'Server ID is required' }, { status: 400 });
  }

  const repo = new SshFileRepository();

  try {
    const files = await repo.listDirectory(serverId, path);
    return NextResponse.json(files);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
