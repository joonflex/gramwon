import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Key, Utensils, Sparkles } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">대시보드</h1>
          <p className="text-gray-600">관리할 항목을 선택하세요</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 패스워드 관리 */}
          <Link href="/passwords">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center space-x-3 mb-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Key className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle>패스워드</CardTitle>
                </div>
                <CardDescription>
                  그램원 계정 및 패스워드 관리
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          {/* 식사 당번 (준비 중) */}
          <Card className="opacity-50 cursor-not-allowed">
            <CardHeader>
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Utensils className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>식사 당번</CardTitle>
              </div>
              <CardDescription>
                준비 중입니다
              </CardDescription>
            </CardHeader>
          </Card>

          {/* 청소 당번 (준비 중) */}
          <Card className="opacity-50 cursor-not-allowed">
            <CardHeader>
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Sparkles className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>청소 당번</CardTitle>
              </div>
              <CardDescription>
                준비 중입니다
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
}
