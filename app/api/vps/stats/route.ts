import { SshVpsServerRepository } from '@/src/infrastructure/repositories/system/SshVpsServerRepository';
import { NextResponse } from 'next/server';

export async function GET() {
  const repo = new SshVpsServerRepository();

  try {
    const stats = await repo.getStats();
    return NextResponse.json(stats);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
