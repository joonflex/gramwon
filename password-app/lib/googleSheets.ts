export interface SheetData {
  headers: string[];
  rows: string[][];
}

/**
 * Google Sheets를 CSV 형식으로 public fetch
 * API Key 없이 공개된 시트를 읽어옵니다
 */
export async function fetchSheetData(sheetId: string): Promise<SheetData> {
  try {
    // Google Sheets CSV export URL
    const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=0`;

    const response = await fetch(csvUrl, {
      next: { revalidate: 60 }, // 60초마다 갱신 (캐싱 적용)
    });

    if (!response.ok) {
      throw new Error(`Google Sheets fetch failed: ${response.status}`);
    }

    const csvText = await response.text();

    // CSV 파싱
    const lines = csvText.split('\n').filter(line => line.trim());

    if (lines.length === 0) {
      return { headers: [], rows: [] };
    }

    // 첫 번째 줄은 헤더
    const headers = parseCSVLine(lines[0]);

    // 나머지는 데이터 행
    const rows = lines.slice(1).map(line => parseCSVLine(line));

    return { headers, rows };
  } catch (error) {
    console.error('Error fetching Google Sheets data:', error);
    throw error;
  }
}

/**
 * CSV 한 줄을 파싱 (쉼표로 구분, 큰따옴표 처리)
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // 이스케이프된 따옴표 ""
        current += '"';
        i++; // 다음 따옴표 건너뛰기
      } else {
        // 따옴표 토글
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // 쉼표이고 따옴표 밖이면 필드 구분
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  // 마지막 필드 추가
  result.push(current.trim());

  return result;
}
