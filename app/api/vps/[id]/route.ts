import { SshVpsServerRepository } from '@/src/infrastructure/repositories/system/SshVpsServerRepository';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const repo = new SshVpsServerRepository();

  try {
    const server = await repo.getById(id);
    if (!server) {
      return NextResponse.json({ error: 'Server not found' }, { status: 404 });
    }
    return NextResponse.json(server);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
