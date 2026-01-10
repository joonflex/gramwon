'use client';

import { Card, CardContent } from "@/components/ui/card";

interface SheetData {
  headers: string[];
  rows: string[][];
}

interface MealsMobileViewProps {
  data: SheetData;
}

export default function MealsMobileView({ data }: MealsMobileViewProps) {
  const { headers, rows } = data;

  // 현재 월 가져오기 (1-12)
  const currentMonth = new Date().getMonth() + 1;

  return (
    <div className="md:hidden">
      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

        {/* Timeline Items */}
        <div className="space-y-4">
          {rows.map((row, rowIndex) => {
            // 첫 번째 컬럼이 월 번호
            const monthNumber = parseInt(row[0]) || rowIndex + 1;
            const isCurrent = monthNumber === currentMonth;

            // 당번1, 당번2, 로테이션 추출
            const attendant1 = row[1] || '';
            const attendant2 = row[2] || '';
            const rotation = row[3] || '';

            return (
              <div key={rowIndex} className="relative pl-12 pb-2">
                {/* Timeline Dot */}
                <div className={`absolute left-2.5 top-3 w-3 h-3 rounded-full border-2 ${
                  isCurrent
                    ? 'bg-primary border-primary ring-4 ring-primary/20'
                    : 'bg-background border-border'
                }`} />

                {/* Content Card */}
                <Card className={`${isCurrent ? 'border-primary shadow-md' : 'border-border'}`}>
                  <CardContent className="p-4">
                    {/* Month Header */}
                    <div className="flex items-center gap-2 mb-3">
                      <h3 className={`text-lg font-bold ${isCurrent ? 'text-primary' : 'text-foreground'}`}>
                        {monthNumber}월
                      </h3>
                      {isCurrent && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary text-primary-foreground">
                          현재
                        </span>
                      )}
                    </div>

                    {/* Attendants */}
                    <div className="space-y-2">
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">👥 당번</div>
                        <div className="text-sm font-medium">
                          {attendant1}{attendant2 ? ` & ${attendant2}` : ''}
                        </div>
                      </div>

                      {/* Rotation */}
                      {rotation && rotation.trim() !== '' && (
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">🔄 로테이션</div>
                          <div className="text-sm font-medium text-muted-foreground">
                            {rotation}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
