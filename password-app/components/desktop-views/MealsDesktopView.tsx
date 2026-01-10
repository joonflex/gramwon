'use client';

import { Card, CardContent } from "@/components/ui/card";

interface SheetData {
  headers: string[];
  rows: string[][];
}

interface MealsDesktopViewProps {
  data: SheetData;
}

export default function MealsDesktopView({ data }: MealsDesktopViewProps) {
  const { rows } = data;

  // 현재 월 가져오기 (1-12)
  const currentMonth = new Date().getMonth() + 1;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {rows.map((row, rowIndex) => {
        // 첫 번째 컬럼이 월 번호
        const monthNumber = parseInt(row[0]) || rowIndex + 1;
        const isCurrent = monthNumber === currentMonth;

        // 당번1, 당번2, 로테이션 추출
        const attendant1 = row[1] || '';
        const attendant2 = row[2] || '';
        const rotation = row[3] || '';

        return (
          <Card
            key={rowIndex}
            className={`${
              isCurrent
                ? 'border-primary shadow-lg ring-2 ring-primary/20'
                : 'border-border hover:shadow-md'
            } transition-all`}
          >
            <CardContent className="p-5">
              {/* Month Header */}
              <div className="flex items-center gap-2 mb-4">
                <h3 className={`text-2xl font-bold ${isCurrent ? 'text-primary' : 'text-foreground'}`}>
                  {monthNumber}월
                </h3>
                {isCurrent && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary text-primary-foreground">
                    현재
                  </span>
                )}
              </div>

              {/* Attendants */}
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-muted-foreground mb-1.5">👥 당번</div>
                  <div className="text-sm font-medium">
                    {attendant1}{attendant2 ? ` & ${attendant2}` : ''}
                  </div>
                </div>

                {/* Rotation */}
                {rotation && rotation.trim() !== '' && (
                  <div>
                    <div className="text-xs text-muted-foreground mb-1.5">🔄 로테이션</div>
                    <div className="text-sm font-medium text-muted-foreground">
                      {rotation}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
