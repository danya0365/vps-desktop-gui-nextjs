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
    const ext = path.split('.').pop()?.toLowerCase();
    const isImage = ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico'].includes(ext || '');
    const mimeTypes: Record<string, string> = {
      'png': 'image/png',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'gif': 'image/gif',
      'svg': 'image/svg+xml',
      'webp': 'image/webp',
      'ico': 'image/x-icon'
    };

    const content = await repo.getFileContent(serverId, path);
    return NextResponse.json({ 
      content, 
      isImage,
      mimeType: isImage ? mimeTypes[ext!] : 'text/plain'
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
