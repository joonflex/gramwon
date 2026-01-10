'use client';

import { Card, CardContent } from "@/components/ui/card";

interface SheetData {
  headers: string[];
  rows: string[][];
}

interface CleaningMobileViewProps {
  data: SheetData;
}

export default function CleaningMobileView({ data }: CleaningMobileViewProps) {
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

                    {/* Cleaning Duties */}
                    <div className="space-y-2">
                      {headers.slice(1).map((header, headerIndex) => {
                        const value = row[headerIndex + 1];
                        if (!value || value.trim() === '') return null;

                        return (
                          <div key={headerIndex}>
                            <div className="text-xs text-muted-foreground mb-1">
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
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
