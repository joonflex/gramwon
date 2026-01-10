import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-6 py-12 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-2">
          Gramwon
        </h1>
        <p className="text-sm text-gray-500 mb-6">v1.1</p>
        <p className="text-xl text-gray-600 mb-12">
          여러 서비스를 한 곳에서 관리하세요
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          <a
            href={process.env.NODE_ENV === 'production' ? '/passwords' : 'http://localhost:3001'}
            className="block p-8 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="text-4xl mb-4">🔐</div>
            <h2 className="text-2xl font-semibold mb-2">Password Manager</h2>
            <p className="text-gray-600">비밀번호 관리 시스템</p>
          </a>

          <div className="block p-8 bg-white rounded-lg shadow-lg opacity-50 cursor-not-allowed">
            <div className="text-4xl mb-4">📊</div>
            <h2 className="text-2xl font-semibold mb-2">Dashboard</h2>
            <p className="text-gray-600">곧 출시 예정</p>
          </div>
        </div>
      </div>
    </div>
  );
}
