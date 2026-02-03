import { SshFileRepository } from '@/src/infrastructure/repositories/system/SshFileRepository';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const serverId = searchParams.get('serverId');
  const path = searchParams.get('path');

  if (!serverId || !path) {
    return NextResponse.json({ error: 'Server ID and path are required' }, { status: 400 });
  }

  const repo = new SshFileRepository();

  try {
    const content = await repo.getFileContent(serverId, path);
    return NextResponse.json({ content });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
