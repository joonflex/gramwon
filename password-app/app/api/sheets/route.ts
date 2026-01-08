import { NextResponse } from 'next/server';
import { fetchSheetData } from '@/lib/googleSheets';

// 60초 캐싱 적용
export const revalidate = 60;

export async function GET() {
  try {
    const sheetId = process.env.GOOGLE_SHEET_ID;

    if (!sheetId) {
      return NextResponse.json(
        { success: false, message: 'Google Sheet ID가 설정되지 않았습니다' },
        { status: 500 }
      );
    }

    const data = await fetchSheetData(sheetId);

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Google Sheets API error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Google Sheets 데이터를 가져오는데 실패했습니다. 시트가 공개 상태인지 확인해주세요.',
      },
      { status: 500 }
    );
  }
}
