import { SshVpsServerRepository } from '@/src/infrastructure/repositories/system/SshVpsServerRepository';
import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  const repo = new SshVpsServerRepository();

  try {
    const server = await repo.refreshMetrics(id);
    return NextResponse.json(server);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
