'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Eye, EyeOff, ExternalLink, Copy, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface SheetData {
  headers: string[];
  rows: string[][];
}

interface PasswordsDesktopViewProps {
  data: SheetData;
}

export default function PasswordsDesktopView({ data }: PasswordsDesktopViewProps) {
  const { headers, rows } = data;
  const [visiblePasswords, setVisiblePasswords] = useState<Set<number>>(new Set());
  const [copiedItems, setCopiedItems] = useState<Set<string>>(new Set());

  const togglePasswordVisibility = (index: number) => {
    setVisiblePasswords(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItems(prev => new Set(prev).add(id));
      setTimeout(() => {
        setCopiedItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {rows.map((row, rowIndex) => {
        const serviceName = row[0];
        const isPasswordVisible = visiblePasswords.has(rowIndex);

        // 헤더 인덱스 찾기 (첫 번째 컬럼은 서비스명이므로 제외)
        const urlIndex = headers.findIndex((h, idx) =>
          idx > 0 && (h.includes('로그인주소') || h.includes('로그인시간') || h.includes('로그인') || h.toLowerCase().includes('url') || h.includes('링크') || h.includes('주소') || h.includes('사이트'))
        );
        const idIndex = headers.findIndex((h, idx) =>
          idx > 0 && (h.includes('아이디') || h.toLowerCase().includes('id'))
        );
        const pwIndex = headers.findIndex((h, idx) =>
          idx > 0 && (h.includes('비밀번호') || h.toLowerCase().includes('password') || h.toLowerCase().includes('pw'))
        );
        const noteIndex = headers.findIndex((h, idx) =>
          idx > 0 && (h.includes('비고') || h.includes('메모') || h.toLowerCase().includes('note'))
        );

        const url = urlIndex >= 0 ? row[urlIndex] : '';
        const userId = idIndex >= 0 ? row[idIndex] : '';
        const password = pwIndex >= 0 ? row[pwIndex] : '';
        const note = noteIndex >= 0 ? row[noteIndex] : '';

        return (
          <Card key={rowIndex} className="shadow-md hover:shadow-lg transition-all">
            <CardContent className="p-5">
              {/* Header with Service Name and Actions */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-primary">
                  {serviceName}
                </h3>
                <div className="flex items-center gap-1">
                  {/* URL Link Button */}
                  {url && url.trim() !== '' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => window.open(url, '_blank')}
                      aria-label="링크 열기"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                  {/* Password Toggle Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => togglePasswordVisibility(rowIndex)}
                    aria-label={isPasswordVisible ? "비밀번호 숨기기" : "비밀번호 보기"}
                  >
                    {isPasswordVisible ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Content */}
              <div className="space-y-3">
                {/* User ID */}
                {userId && userId.trim() !== '' && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="text-xs font-semibold text-muted-foreground">
                        👤 아이디
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2"
                        onClick={() => copyToClipboard(userId, `${rowIndex}-id`)}
                      >
                        {copiedItems.has(`${rowIndex}-id`) ? (
                          <Check className="h-3 w-3 text-green-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                    <div className="text-sm font-medium font-mono bg-muted/50 px-3 py-2 rounded-md">
                      {userId}
                    </div>
                  </div>
                )}

                {/* Password */}
                {password && password.trim() !== '' && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="text-xs font-semibold text-muted-foreground">
                        🔒 비밀번호
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2"
                        onClick={() => copyToClipboard(password, `${rowIndex}-pw`)}
                      >
                        {copiedItems.has(`${rowIndex}-pw`) ? (
                          <Check className="h-3 w-3 text-green-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                    <div className="text-sm font-medium font-mono bg-muted/50 px-3 py-2 rounded-md">
                      {isPasswordVisible ? password : '••••••••'}
                    </div>
                  </div>
                )}

                {/* Note */}
                {note && note.trim() !== '' && (
                  <div>
                    <div className="text-xs font-semibold text-muted-foreground mb-1.5">
                      📝 비고
                    </div>
                    <div className="text-sm text-muted-foreground bg-muted/30 px-3 py-2 rounded-md">
                      {note}
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
