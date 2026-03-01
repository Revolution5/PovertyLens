// daniel q. 2/28/26 start
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.redirect(new URL('/offline', process.env.NEXTAUTH_URL || 'http://localhost:3000'));
}