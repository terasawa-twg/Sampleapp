// app/_components/Calendar.tsx
'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CalendarProps {
  onDateSelect?: (date: Date) => void;
}

export function Calendar({ onDateSelect }: CalendarProps) {
  // 現在の年月を管理
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // 今日の日付
  const today = new Date();
  today.setHours(0, 0, 0, 0); // 時間部分をリセット
  
  // 表示中の年月を取得
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  // 月の最初の日と最後の日を取得
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  
  // 月の最初の日が何曜日かを取得（日曜日=0, 月曜日=1...）
  const firstDayOfWeek = firstDayOfMonth.getDay();
  
  // 月の日数を取得
  const daysInMonth = lastDayOfMonth.getDate();
  
  // 前月の最後の日を取得
  const lastDayOfPrevMonth = new Date(year, month, 0).getDate();
  
  // カレンダーに表示する日付の配列を生成
  const calendarDays = [];
  
  // 前月の日付（グレーアウト）
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    calendarDays.push({
      date: lastDayOfPrevMonth - i,
      isCurrentMonth: false,
      isPrevMonth: true,
      isNextMonth: false,
      fullDate: new Date(year, month - 1, lastDayOfPrevMonth - i)
    });
  }
  
  // 当月の日付
  for (let date = 1; date <= daysInMonth; date++) {
    calendarDays.push({
      date: date,
      isCurrentMonth: true,
      isPrevMonth: false,
      isNextMonth: false,
      fullDate: new Date(year, month, date)
    });
  }
  
  // 次月の日付（グレーアウト）
  const remainingCells = 42 - calendarDays.length; // 6週間 × 7日 = 42セル
  for (let date = 1; date <= remainingCells; date++) {
    calendarDays.push({
      date: date,
      isCurrentMonth: false,
      isPrevMonth: false,
      isNextMonth: true,
      fullDate: new Date(year, month + 1, date)
    });
  }
  
  // 前月に移動
  const goToPrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  
  // 次月に移動
  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };
  
  // 今日の日付かどうかを判定
  const isToday = (date: Date) => {
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate.getTime() === today.getTime();
  };
  
  // 日付がクリックされたときの処理
  const handleDateClick = (dayInfo: any) => {
    if (onDateSelect) {
      onDateSelect(dayInfo.fullDate);
    }
  };
  
  // 月名の配列
  const monthNames = [
    '1月', '2月', '3月', '4月', '5月', '6月',
    '7月', '8月', '9月', '10月', '11月', '12月'
  ];
  
  // 曜日の配列
  const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 w-80">
      {/* カレンダーヘッダー */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-gray-900">
          {year}年{monthNames[month]}
        </h2>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPrevMonth}
            className="h-6 w-6 p-0"
          >
            <ChevronLeft className="h-3 w-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={goToNextMonth}
            className="h-6 w-6 p-0"
          >
            <ChevronRight className="h-3 w-3" />
          </Button>
        </div>
      </div>
      
      {/* 曜日ヘッダー */}
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {dayNames.map((day, index) => (
          <div
            key={day}
            className={`text-center text-xs font-medium py-1 ${
              index === 0 ? 'text-red-600' : index === 6 ? 'text-blue-600' : 'text-gray-600'
            }`}
          >
            {day}
          </div>
        ))}
      </div>
      
      {/* カレンダーグリッド */}
      <div className="grid grid-cols-7 gap-0.5">
        {calendarDays.map((dayInfo, index) => {
          const isTodayDate = isToday(dayInfo.fullDate);
          const isSunday = index % 7 === 0; // 日曜日判定
          const isSaturday = index % 7 === 6; // 土曜日判定

          // テキスト色の決定
          let textColor = 'text-gray-900'; // デフォルト
          if (!dayInfo.isCurrentMonth) {
            textColor = 'text-gray-300'; // 他の月
          } else if (isTodayDate) {
            textColor = 'text-white'; // 今日（赤背景なので白文字）
          } else if (isSunday) {
            textColor = 'text-red-600'; // 日曜日
          } else if (isSaturday) {
            textColor = 'text-blue-600'; // 土曜日
          }
          
          return (
            <button
              key={index}
              onClick={() => handleDateClick(dayInfo)}
              className={`
                relative h-8 w-full text-xs font-medium rounded transition-colors
                ${textColor}
                ${!dayInfo.isCurrentMonth 
                  ? 'hover:bg-gray-50' 
                  : isTodayDate
                    ? 'bg-red-500 hover:bg-red-600' // 今日の日付は赤色背景
                    : 'hover:bg-gray-100'
                }
              `}
            >
              {dayInfo.date}
            </button>
          );
        })}
      </div>
      
      {/* 今日の日付表示 */}
      <div className="mt-3 pt-2 border-t border-gray-200">
        <div className="text-center">
          <span className="text-xs text-gray-600">
            今日: {today.getMonth() + 1}月{today.getDate()}日({dayNames[today.getDay()]})
          </span>
        </div>
      </div>
    </div>
  );
}