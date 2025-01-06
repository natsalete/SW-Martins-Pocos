import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  // Rotas que não precisam de autenticação
  const publicRoutes = ['/', '/sign-in', '/sign-up'];

  // Verifica se a rota atual está na lista de rotas públicas
  const isPublicRoute = publicRoutes.some((route) =>
    req.nextUrl.pathname.startsWith(route)
  );

  if (!isPublicRoute) {
    // Para rotas protegidas, verifica se o token existe nos cookies
    const token = req.cookies.get('token'); // Busca o token nos cookies

    if (!token) {
      // Redireciona para a página de login se não estiver autenticado
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = '/sign-in';
      return NextResponse.redirect(loginUrl);
    }
  }

  // Continua para a rota caso seja pública ou o token esteja presente
  return NextResponse.next();
}
