import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, LogIn, Key, Utensils, Sparkles } from 'lucide-react';
import { isAuthenticated } from '@/lib/auth';
import LogoutButton from './LogoutButton';
import MobileMenu from './MobileMenu';

export default async function Header() {
  const isAuth = await isAuthenticated();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background shadow-sm">
      <div className="container flex h-16 max-w-screen-2xl items-center px-6">
        {isAuth && <MobileMenu />}

        <div className="flex items-center flex-1">
          <Link href={isAuth ? "/dashboard" : "/"} className="flex items-center space-x-2 mr-8">
            <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">G</span>
            </div>
            <span className="font-bold text-lg tracking-tight">Gramwon</span>
          </Link>

          {isAuth && (
            <nav className="hidden md:flex items-center space-x-1">
              <Button variant="ghost" size="sm" asChild className="gap-2">
                <Link href="/dashboard">
                  <LayoutDashboard className="h-4 w-4" />
                  대시보드
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild className="gap-2">
                <Link href="/passwords">
                  <Key className="h-4 w-4" />
                  패스워드
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild className="gap-2">
                <Link href="/meals">
                  <Utensils className="h-4 w-4" />
                  식사당번
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild className="gap-2">
                <Link href="/cleaning">
                  <Sparkles className="h-4 w-4" />
                  청소당번
                </Link>
              </Button>
            </nav>
          )}
        </div>

        <div className="flex items-center">
          <nav className="flex items-center space-x-1">
            {isAuth ? (
              <LogoutButton />
            ) : (
              <Button variant="default" size="sm" asChild className="gap-2">
                <Link href="/">
                  <LogIn className="h-4 w-4" />
                  로그인
                </Link>
              </Button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
