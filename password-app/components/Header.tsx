import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, LogIn, LogOut } from 'lucide-react';
import { isAuthenticated } from '@/lib/auth';
import LogoutButton from './LogoutButton';

export default async function Header() {
  const isAuth = await isAuthenticated();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background shadow-sm">
      <div className="container flex h-16 max-w-screen-2xl items-center px-6">
        <div className="flex items-center">
          <Link href={isAuth ? "/dashboard" : "/"} className="flex items-center space-x-2 mr-8">
            <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">G</span>
            </div>
            <span className="font-bold text-lg tracking-tight">Gramwon</span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-end">
          <nav className="flex items-center space-x-1">
            {isAuth ? (
              <>
                <Button variant="default" size="sm" asChild className="gap-2">
                  <Link href="/dashboard">
                    <LayoutDashboard className="h-4 w-4" />
                    대시보드
                  </Link>
                </Button>
                <LogoutButton />
              </>
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
