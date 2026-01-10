'use client';

import { Card, CardContent } from "@/components/ui/card";

interface SheetData {
  headers: string[];
  rows: string[][];
}

interface CleaningDesktopViewProps {
  data: SheetData;
}

export default function CleaningDesktopView({ data }: CleaningDesktopViewProps) {
  const { headers, rows } = data;

  // 현재 월 가져오기 (1-12)
  const currentMonth = new Date().getMonth() + 1;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {rows.map((row, rowIndex) => {
        // 첫 번째 컬럼이 월 번호
        const monthNumber = parseInt(row[0]) || rowIndex + 1;
        const isCurrent = monthNumber === currentMonth;

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

              {/* Cleaning Duties */}
              <div className="space-y-3">
                {headers.slice(1).map((header, headerIndex) => {
                  const value = row[headerIndex + 1];
                  if (!value || value.trim() === '') return null;

                  return (
                    <div key={headerIndex}>
                      <div className="text-xs text-muted-foreground mb-1.5">
                        {header}
                      </div>
                      <div className="text-sm font-medium">
                        {value}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
