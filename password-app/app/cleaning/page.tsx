import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import CleaningDesktopView from '@/components/desktop-views/CleaningDesktopView';
import CleaningMobileView from '@/components/mobile-views/CleaningMobileView';
import { fetchSheetData } from '@/lib/googleSheets';

// 60초 캐싱 적용
export const revalidate = 60;

export default async function CleaningPage() {
  let sheetData = null;
  let error = null;

  try {
    const sheetId = process.env.CLEANING_SHEET_ID;

    if (!sheetId) {
      error = 'Google Sheet ID가 설정되지 않았습니다';
    } else {
      // gid=0 = 첫 번째 탭
      sheetData = await fetchSheetData(sheetId, 0);
    }
  } catch (err) {
    error = '데이터를 불러오는 중 오류가 발생했습니다';
    console.error('Sheet data fetch error:', err);
  }

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header Section */}
      <div className="bg-background border-b">
        <div className="container max-w-7xl mx-auto px-6 py-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              청소 당번
            </h1>
            <p className="text-sm text-muted-foreground mt-1.5">
              그램원 청소 당번 일정을 확인하고 관리합니다
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container max-w-7xl mx-auto px-6 py-6">
        {/* Status Banner */}
        {!error && (
          <Alert className="mb-6 border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertTitle className="text-green-900 dark:text-green-100">연결됨</AlertTitle>
            <AlertDescription className="text-green-800 dark:text-green-200">
              Google Sheets와 정상적으로 연결되었습니다
            </AlertDescription>
          </Alert>
        )}

        {/* Error State */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>데이터 로드 오류</AlertTitle>
            <AlertDescription className="mt-2">
              {error}
              <br />
              <span className="text-xs">관리자에게 문의하거나 페이지를 새로고침 해주세요.</span>
            </AlertDescription>
          </Alert>
        )}

        {/* Data Table */}
        {!error && sheetData && (
          <>
            {/* Desktop View */}
            <div className="hidden md:block">
              <CleaningDesktopView data={sheetData} />
            </div>

            {/* Mobile View */}
            <CleaningMobileView data={sheetData} />
          </>
        )}

        {/* Empty State */}
        {!error && !sheetData && (
          <div className="flex flex-col items-center justify-center py-20 bg-background rounded-lg border border-dashed">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">데이터 없음</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              표시할 데이터가 없습니다. Google Sheets가 올바르게 설정되었는지 확인해주세요.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
