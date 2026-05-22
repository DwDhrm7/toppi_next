import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Tentukan route mana saja yang BISA diakses tanpa login (Public Routes)
const publicRoutes = ['/login', '/_next', '/favicon.ico', '/assets'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Lewati file statis, aset, dan halaman login
  if (publicRoutes.some(route => pathname.startsWith(route)) || pathname.match(/\.(png|jpg|jpeg|svg|css|js)$/)) {
    return NextResponse.next();
  }

  // Cek keberadaan autentikasi. 
  // CATATAN PENTING: Karena saat login kita hanya menyimpan token di localStorage, 
  // Middleware (yang berjalan di server) TIDAK BISA membaca localStorage.
  // Untuk proteksi server-side sungguhan, backend saat login harus men-set Cookies ("token"), 
  // barulah middleware ini akan membacanya.
  
  // Untuk saat ini, kita periksa keberadaan Cookie (Persiapan Backend).
  // const token = request.cookies.get('token')?.value;

  // if (!token && pathname !== '/login') {
  //   return NextResponse.redirect(new URL('/login', request.url));
  // }

  // Jika Anda mengakses route dasar "/", redirect ke login
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Hanya jalankan middleware pada route ini
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
