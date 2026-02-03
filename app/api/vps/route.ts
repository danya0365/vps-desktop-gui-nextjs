import { SshVpsServerRepository } from '@/src/infrastructure/repositories/system/SshVpsServerRepository';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search');
  const status = searchParams.get('status');

  const repo = new SshVpsServerRepository();

  try {
    let servers = await repo.getAll();

    if (search) {
      servers = servers.filter(
        (s) =>
          s.name.toLowerCase().includes(search.toLowerCase()) ||
          s.hostname.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (status) {
      servers = servers.filter((s) => s.status === status);
    }

    return NextResponse.json(servers);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
