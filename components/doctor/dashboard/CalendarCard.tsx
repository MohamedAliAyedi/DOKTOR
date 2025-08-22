"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function CalendarCard() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    // Adjust so Monday is first day of week (0 = Sunday, 1 = Monday, etc.)
    return (firstDay.getDay() + 6) % 7;
  };

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDayIndex = getFirstDayOfMonth(currentDate);
    const calendarDays = [];

    // Previous month's days
    const prevMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - 1,
      1
    );
    const daysInPrevMonth = getDaysInMonth(prevMonth);

    let day = 1;
    let nextMonthDay = 1;

    for (let i = 0; i < 6; i++) {
      const week = [];
      for (let j = 0; j < 7; j++) {
        if (i === 0 && j < firstDayIndex) {
          // Days from previous month
          week.push({
            day: daysInPrevMonth - (firstDayIndex - j - 1),
            isCurrentMonth: false,
            isToday: false,
          });
        } else if (day > daysInMonth) {
          // Days from next month
          week.push({
            day: nextMonthDay++,
            isCurrentMonth: false,
            isToday: false,
          });
        } else {
          // Current month days
          const today = new Date();
          week.push({
            day: day,
            isCurrentMonth: true,
            isToday:
              today.getDate() === day &&
              today.getMonth() === currentDate.getMonth() &&
              today.getFullYear() === currentDate.getFullYear(),
          });
          day++;
        }
      }
      calendarDays.push(week);
      if (day > daysInMonth && nextMonthDay > 7) break;
    }

    return calendarDays;
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const calendarDays = generateCalendarDays();

  return (
    <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-6 shadow-lg flex-1 border-2 border-gray-50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            className="hover:bg-gray-100 rounded-lg"
            onClick={() => navigateMonth("prev")}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="hover:bg-gray-100 rounded-lg"
            onClick={() => navigateMonth("next")}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-gray-500 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {calendarDays.flat().map(({ day, isCurrentMonth, isToday }, index) => (
          <button
            key={index}
            className={`
              w-8 h-8 text-sm rounded-lg flex items-center justify-center
              ${
                isToday
                  ? "bg-blue-600 text-white shadow-md"
                  : !isCurrentMonth
                  ? "text-gray-400"
                  : "text-gray-700 hover:bg-gray-100"
              }
            `}
          >
            {day}
          </button>
        ))}
      </div>
    </div>
  );
}
