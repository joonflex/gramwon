'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SheetData } from '@/lib/googleSheets';
import { FileSpreadsheet, Eye, EyeOff, Copy, Check } from 'lucide-react';

interface SheetTableProps {
  data: SheetData;
}

export default function SheetTable({ data }: SheetTableProps) {
  const { headers, rows } = data;
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());
  const [copiedCell, setCopiedCell] = useState<string | null>(null);

  // 비밀번호 컬럼 감지 (헤더에 "비밀번호" 또는 "비번" 포함)
  const passwordColumnIndices = headers
    .map((header, index) =>
      header.toLowerCase().includes('비밀번호') || header.toLowerCase().includes('비번')
        ? index
        : -1
    )
    .filter(index => index !== -1);

  const togglePasswordVisibility = (rowIndex: number, colIndex: number) => {
    const key = `${rowIndex}-${colIndex}`;
    setVisiblePasswords(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const copyToClipboard = async (text: string, rowIndex: number, colIndex: number) => {
    try {
      await navigator.clipboard.writeText(text);
      const key = `${rowIndex}-${colIndex}`;
      setCopiedCell(key);
      setTimeout(() => setCopiedCell(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const isPasswordColumn = (colIndex: number) => passwordColumnIndices.includes(colIndex);
  const isPasswordVisible = (rowIndex: number, colIndex: number) =>
    visiblePasswords.has(`${rowIndex}-${colIndex}`);
  const isCopied = (rowIndex: number, colIndex: number) =>
    copiedCell === `${rowIndex}-${colIndex}`;

  // 데이터가 없는 경우
  if (!headers || headers.length === 0 || !rows || rows.length === 0) {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-muted-foreground">데이터 없음</CardTitle>
          <CardDescription>
            Google Sheets에 표시할 데이터가 없습니다.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // 모바일에서 사용할 주요 컬럼 인덱스 찾기
  const getColumnIndex = (name: string) =>
    headers.findIndex(h => h.toLowerCase().includes(name.toLowerCase()));

  const siteNameIndex = getColumnIndex('로그인사이트');
  const siteUrlIndex = getColumnIndex('로그인 주소') >= 0 ? getColumnIndex('로그인 주소') : getColumnIndex('로그인주소');
  const idIndex = getColumnIndex('아이디');

  // URL인지 확인하는 함수
  const isUrl = (text: string) => {
    try {
      return text.startsWith('http://') || text.startsWith('https://') || text.startsWith('www.');
    } catch {
      return false;
    }
  };

  // URL에 http가 없으면 추가하는 함수
  const getFullUrl = (url: string) => {
    if (url.startsWith('www.')) {
      return `https://${url}`;
    }
    return url;
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="border-b bg-muted/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-lg">데이터 테이블</CardTitle>
              <CardDescription className="mt-1">
                총 <span className="font-semibold text-foreground">{rows.length}</span>개의 항목
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>

      {/* 모바일 카드형 레이아웃 (768px 미만) */}
      <CardContent className="p-4 md:hidden">
        <div className="space-y-3">
          {rows.map((row, rowIndex) => (
            <Card key={rowIndex} className="border shadow-sm">
              <CardContent className="p-4 space-y-3">
                {/* 사이트명 (헤더) */}
                {siteNameIndex >= 0 && row[siteNameIndex] && (
                  <div>
                    <h3 className="font-bold text-base leading-tight">
                      {row[siteNameIndex]}
                    </h3>
                  </div>
                )}

                {/* 로그인 주소 */}
                {siteUrlIndex >= 0 && row[siteUrlIndex] && (
                  <div className="space-y-1">
                    <span className="text-xs font-medium text-muted-foreground">
                      로그인 주소
                    </span>
                    <div className="flex items-center gap-2">
                      <a
                        href={getFullUrl(row[siteUrlIndex])}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline truncate flex-1"
                      >
                        {row[siteUrlIndex]}
                      </a>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 flex-shrink-0"
                        onClick={() => copyToClipboard(row[siteUrlIndex], rowIndex, siteUrlIndex)}
                      >
                        {isCopied(rowIndex, siteUrlIndex) ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {/* 아이디 */}
                {idIndex >= 0 && row[idIndex] && (
                  <div className="space-y-1">
                    <span className="text-xs font-medium text-muted-foreground">
                      아이디
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono flex-1">
                        {row[idIndex]}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 flex-shrink-0"
                        onClick={() => copyToClipboard(row[idIndex], rowIndex, idIndex)}
                      >
                        {isCopied(rowIndex, idIndex) ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {/* 비밀번호 */}
                {passwordColumnIndices.map(pwIndex => {
                  if (!row[pwIndex]) return null;
                  const isVisible = isPasswordVisible(rowIndex, pwIndex);
                  const copied = isCopied(rowIndex, pwIndex);

                  return (
                    <div key={pwIndex} className="space-y-1">
                      <span className="text-xs font-medium text-muted-foreground">
                        {headers[pwIndex]}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-mono flex-1 ${isVisible ? '' : 'select-none'}`}>
                          {isVisible ? row[pwIndex] : '••••••••'}
                        </span>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => togglePasswordVisibility(rowIndex, pwIndex)}
                          >
                            {isVisible ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => copyToClipboard(row[pwIndex], rowIndex, pwIndex)}
                          >
                            {copied ? (
                              <Check className="h-4 w-4 text-green-600" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>

      {/* PC 테이블 레이아웃 (768px 이상) */}
      <CardContent className="p-0 hidden md:block">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                {headers.map((header, index) => (
                  <TableHead
                    key={index}
                    className={`font-semibold text-foreground h-12 whitespace-nowrap ${
                      index === 0 ? 'pl-6' : ''
                    } ${index === headers.length - 1 ? 'pr-6' : ''}`}
                  >
                    {header || `컬럼 ${index + 1}`}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, rowIndex) => (
                <TableRow
                  key={rowIndex}
                  className="hover:bg-muted/30 transition-colors"
                >
                  {row.map((cell, cellIndex) => {
                    const isPassword = isPasswordColumn(cellIndex);
                    const isVisible = isPasswordVisible(rowIndex, cellIndex);
                    const copied = isCopied(rowIndex, cellIndex);

                    return (
                      <TableCell
                        key={cellIndex}
                        className={`py-3 whitespace-nowrap ${
                          cellIndex === 0 ? 'pl-6' : ''
                        } ${cellIndex === row.length - 1 ? 'pr-6' : ''}`}
                      >
                        {cell ? (
                          <div className="flex items-center gap-2">
                            {isPassword ? (
                              <>
                                <span
                                  className={`font-mono ${
                                    isVisible ? '' : 'select-none'
                                  }`}
                                >
                                  {isVisible ? cell : '••••••••'}
                                </span>
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() =>
                                      togglePasswordVisibility(rowIndex, cellIndex)
                                    }
                                  >
                                    {isVisible ? (
                                      <EyeOff className="h-3.5 w-3.5" />
                                    ) : (
                                      <Eye className="h-3.5 w-3.5" />
                                    )}
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() =>
                                      copyToClipboard(cell, rowIndex, cellIndex)
                                    }
                                  >
                                    {copied ? (
                                      <Check className="h-3.5 w-3.5 text-green-600" />
                                    ) : (
                                      <Copy className="h-3.5 w-3.5" />
                                    )}
                                  </Button>
                                </div>
                              </>
                            ) : cellIndex === 2 ? (
                              // 3열 (아이디) - 복사 버튼 있음
                              <>
                                <span className="max-w-xs overflow-hidden text-ellipsis block">
                                  {cell}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() =>
                                    copyToClipboard(cell, rowIndex, cellIndex)
                                  }
                                >
                                  {copied ? (
                                    <Check className="h-3.5 w-3.5 text-green-600" />
                                  ) : (
                                    <Copy className="h-3.5 w-3.5" />
                                  )}
                                </Button>
                              </>
                            ) : isUrl(cell) ? (
                              // URL - 복사 버튼 없음
                              <a
                                href={getFullUrl(cell)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline max-w-xs overflow-hidden text-ellipsis block"
                              >
                                {cell}
                              </a>
                            ) : (
                              // 나머지 열 - 복사 버튼 없음
                              <span className="max-w-xs overflow-hidden text-ellipsis block">
                                {cell}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
