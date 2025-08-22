"use client";

import { useState, useRef, useEffect } from "react";
import { appointmentsAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  GripVertical,
  CalendarDays,
  Calendar,
  List,
} from "lucide-react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
  DraggableLocation,
} from "@hello-pangea/dnd";
import { BookAppointmentModal } from "./BookAppointmentModal";

// Types
type Appointment = {
  id: string;
  type: string;
  time: string;
  color: string;
  patient?: string;
  duration?: number; // in minutes
};

type CalendarDay = {
  date: Date;
  dateKey: string;
  appointments: Appointment[];
  isCurrentMonth: boolean;
  isToday: boolean;
};

// Sample appointment data
const generateAppointmentData = () => ({
  "2025-10-01": [
    {
      id: "1",
      type: "FINAL EXAMINATION",
      time: "9:00",
      color: "bg-yellow-400",
      patient: "JC",
      duration: 60,
    },
  ],
  "2025-10-02": [
    {
      id: "2",
      type: "FINAL EXAMINATION",
      time: "9:00",
      color: "bg-yellow-400",
      patient: "JC",
      duration: 60,
    },
  ],
  "2025-10-03": [
    {
      id: "3",
      type: "FINAL EXAMINATION",
      time: "9:00",
      color: "bg-yellow-400",
      patient: "JC",
      duration: 60,
    },
  ],
  "2025-10-04": [
    {
      id: "4",
      type: "RADIO INJECTION",
      time: "12:00",
      color: "bg-blue-500",
      patient: "",
      duration: 30,
    },
  ],
  "2025-10-05": [
    {
      id: "5",
      type: "ROUTINE CHECKUP",
      time: "4:00",
      color: "bg-pink-500",
      patient: "",
      duration: 45,
    },
  ],
  "2025-10-06": [
    {
      id: "6",
      type: "LIVER STENT",
      time: "2:00",
      color: "bg-purple-500",
      patient: "",
      duration: 90,
    },
  ],
  "2025-10-15": [
    {
      id: "7",
      type: "WALK-IN FEVER",
      time: "5:00",
      color: "bg-blue-400",
      patient: "S+",
      duration: 30,
    },
  ],
  "2025-10-16": [
    {
      id: "8",
      type: "LIVER ATC & ROUTINE CHECKUP",
      time: "4:00",
      color: "bg-pink-500",
      patient: "",
      duration: 60,
    },
  ],
  "2025-10-18": [
    {
      id: "9",
      type: "HAND INFECTION",
      time: "1:00",
      color: "bg-yellow-500",
      patient: "",
      duration: 45,
    },
  ],
  "2025-10-21": [
    {
      id: "10",
      type: "URINE BOOST",
      time: "5:30",
      color: "bg-purple-400",
      patient: "",
      duration: 30,
    },
  ],
  "2025-10-25": [
    {
      id: "11",
      type: "URINE VISIT & ROUTINE CHECKUP",
      time: "8:00",
      color: "bg-pink-500",
      patient: "",
      duration: 60,
    },
  ],
});

const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
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
const hours = Array.from({ length: 14 }, (_, i) => i + 7); // 7AM to 8PM

export function AppointmentsContent() {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 9, 1)); // October 2025
  const [selectedMonth, setSelectedMonth] = useState("This month, October");
  const [viewMode, setViewMode] = useState<"DAY" | "WEEK" | "MONTH">("MONTH");
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [appointmentData, setAppointmentData] = useState<Record<string, Appointment[]>>({});
  const [selectedDay, setSelectedDay] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchAppointments();
  }, [currentDate, viewMode]);

  const fetchAppointments = async () => {
    try {
      const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const response = await appointmentsAPI.getAppointments({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });
      
      const appointments = response.data.data.appointments;
      const groupedAppointments: Record<string, Appointment[]> = {};
      
      appointments.forEach((apt: any) => {
        const dateKey = new Date(apt.scheduledDate).toISOString().split('T')[0];
        if (!groupedAppointments[dateKey]) {
          groupedAppointments[dateKey] = [];
        }
        
        groupedAppointments[dateKey].push({
          id: apt._id,
          type: apt.appointmentType.toUpperCase(),
          time: apt.scheduledTime.start,
          color: getAppointmentColor(apt.appointmentType),
          patient: apt.doctor?.user?.firstName?.[0] + apt.doctor?.user?.lastName?.[0] || 'DR',
          duration: apt.duration
        });
      });
      
      setAppointmentData(groupedAppointments);
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
    }
  };

  const getAppointmentColor = (type: string) => {
    const colors: Record<string, string> = {
      'consultation': 'bg-blue-500',
      'follow-up': 'bg-green-500',
      'routine-checkup': 'bg-pink-500',
      'urgent-care': 'bg-red-500',
      'virtual': 'bg-purple-500',
      'examination': 'bg-yellow-400'
    };
    return colors[type] || 'bg-gray-500';
  };

  // Generate calendar days for month view
  const generateCalendarDays = (): CalendarDay[][] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay()); // Start from Sunday

    const days = [];
    const currentDateObj = new Date(startDate);

    // Generate 6 weeks of days
    for (let week = 0; week < 6; week++) {
      const weekDays = [];
      for (let day = 0; day < 7; day++) {
        const dateKey = `${currentDateObj.getFullYear()}-${String(
          currentDateObj.getMonth() + 1
        ).padStart(2, "0")}-${String(currentDateObj.getDate()).padStart(
          2,
          "0"
        )}`;
        const appointments = appointmentData[dateKey] || [];

        weekDays.push({
          date: new Date(currentDateObj),
          dateKey,
          appointments,
          isCurrentMonth: currentDateObj.getMonth() === month,
          isToday: currentDateObj.toDateString() === new Date().toDateString(),
        });

        currentDateObj.setDate(currentDateObj.getDate() + 1);
      }
      days.push(weekDays);
    }

    return days;
  };

  // Generate days for week view
  const generateWeekDays = (): CalendarDay[] => {
    const startDate = new Date(currentDate);
    startDate.setDate(startDate.getDate() - startDate.getDay()); // Start from Sunday

    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateKey = date.toISOString().split("T")[0];

      days.push({
        date,
        dateKey,
        appointments: appointmentData[dateKey] || [],
        isCurrentMonth: true,
        isToday: date.toDateString() === new Date().toDateString(),
      });
    }
    return days;
  };

  // Generate time slots for day view
  const generateDayTimeSlots = () => {
    const dateKey = selectedDay;
    const appointments = appointmentData[dateKey] || [];

    return hours.map((hour) => {
      const time = `${hour}:00`;
      const hourAppointments = appointments.filter((app) => {
        const appHour = parseInt(app.time.split(":")[0]);
        return appHour === hour;
      });

      return {
        time,
        appointments: hourAppointments,
      };
    });
  };

  const calendarDays = generateCalendarDays();
  const weekDays = generateWeekDays();
  const dayTimeSlots = generateDayTimeSlots();

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    if (direction === "prev") {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
    setSelectedMonth(`This month, ${monthNames[newDate.getMonth()]}`);
  };

  const navigateWeek = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (direction === "prev" ? -7 : 7));
    setCurrentDate(newDate);
  };

  const navigateDay = (direction: "prev" | "next") => {
    const newDate = new Date(selectedDay);
    newDate.setDate(newDate.getDate() + (direction === "prev" ? -1 : 1));
    setSelectedDay(newDate.toISOString().split("T")[0]);
  };

  const handleDayClick = (dateKey: string) => {
    setSelectedDay(dateKey);
    setViewMode("DAY");
  };

  // Drag and drop handlers
  const onDragEnd = async (result: DropResult) => {
    setIsDragging(false);

    if (!result.destination) return;

    const { source, destination } = result;

    // If dropped in the same place
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    // Reorder appointments
    if (source.droppableId === destination.droppableId) {
      // Same day reordering
      const dateKey = source.droppableId;
      const newAppointments = [...(appointmentData[dateKey] || [])];
      const [removed] = newAppointments.splice(source.index, 1);
      newAppointments.splice(destination.index, 0, removed);

      setAppointmentData({
        ...appointmentData,
        [dateKey]: newAppointments,
      });
    } else {
      // Move between days
      const sourceDateKey = source.droppableId;
      const destDateKey = destination.droppableId;

      const sourceAppointments = [...(appointmentData[sourceDateKey] || [])];
      const destAppointments = [...(appointmentData[destDateKey] || [])];

      const [movedAppointment] = sourceAppointments.splice(source.index, 1);

      // Update the time to maintain consistency (you might want to adjust this)
      movedAppointment.time = "9:00"; // Default time when moved

      destAppointments.splice(destination.index, 0, movedAppointment);

      try {
        // Update appointment in backend
        await appointmentsAPI.updateAppointment(movedAppointment.id, {
          scheduledDate: destDateKey,
          scheduledTime: { start: movedAppointment.time, end: "10:00" }
        });
        
        setAppointmentData({
          ...appointmentData,
          [sourceDateKey]: sourceAppointments,
          [destDateKey]: destAppointments,
        });
        
        toast({
          title: "Success",
          description: "Appointment moved successfully",
        });
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Failed to move appointment",
          variant: "destructive",
        });
        
        // Revert the change
        fetchAppointments();
      }
    }
  };

  const onDragStart = () => {
    setIsDragging(true);
  };

  // Scroll to current time in day view
  useEffect(() => {
    if (viewMode === "DAY" && calendarRef.current) {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const scrollPosition =
        (currentHour - 7) * 80 + (currentMinute / 60) * 80 - 100;

      calendarRef.current.scrollTo({
        top: scrollPosition,
        behavior: "smooth",
      });
    }
  }, [viewMode, selectedDay]);

  // Render the appropriate view based on viewMode
  const renderView = () => {
    switch (viewMode) {
      case "MONTH":
        return (
          <div className="p-6">
            {/* Days of Week Header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {daysOfWeek.map((day) => (
                <div
                  key={day}
                  className="text-center text-sm font-medium text-gray-500 py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.flat().map((dayData, index) => (
                <Droppable key={dayData.dateKey} droppableId={dayData.dateKey}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      onClick={() => handleDayClick(dayData.dateKey)}
                      className={`min-h-[120px] p-2 border border-gray-100 rounded-lg relative ${
                        !dayData.isCurrentMonth ? "bg-gray-50" : "bg-white"
                      } hover:bg-gray-50 transition-colors cursor-pointer ${
                        dayData.dateKey === selectedDay
                          ? "ring-2 ring-pink-500"
                          : ""
                      }`}
                    >
                      {/* Date Number */}
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`text-sm font-medium ${
                            dayData.isCurrentMonth
                              ? "text-gray-900"
                              : "text-gray-400"
                          } ${
                            dayData.isToday
                              ? "bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center"
                              : ""
                          }`}
                        >
                          {dayData.date.getDate()}
                        </span>
                        {dayData.isCurrentMonth && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-4 h-4 p-0 text-gray-400 hover:text-gray-600"
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        )}
                      </div>

                      {/* Appointments */}
                      <div className="space-y-1">
                        {dayData.appointments.map((appointment, idx) => (
                          <Draggable
                            key={appointment.id}
                            draggableId={appointment.id}
                            index={idx}
                          >
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`${
                                  appointment.color
                                } text-white text-xs px-2 py-1 rounded-md relative ${
                                  isDragging ? "shadow-lg" : ""
                                }`}
                              >
                                <div className="flex items-start">
                                  <GripVertical className="w-3 h-3 mr-1 opacity-70" />
                                  <div>
                                    <div className="font-medium truncate">
                                      {appointment.type}
                                    </div>
                                    <div className="text-xs opacity-90">
                                      {appointment.time}
                                    </div>
                                  </div>
                                </div>
                                {appointment.patient && (
                                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-gray-800 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                    {appointment.patient}
                                  </div>
                                )}
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    </div>
                  )}
                </Droppable>
              ))}
            </div>
          </div>
        );

      case "WEEK":
        return (
          <div className="p-4">
            <div className="grid grid-cols-8 gap-1">
              {/* Time column */}
              <div className="border-r border-gray-200 pr-2">
                <div className="h-12 border-b border-gray-200"></div>
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className="h-16 border-b border-gray-200 flex items-start justify-end pr-2"
                  >
                    <span className="text-xs text-gray-500 mt-1">{`${hour}:00`}</span>
                  </div>
                ))}
              </div>

              {/* Days columns */}
              {weekDays.map((day, dayIdx) => (
                <div key={dayIdx} className="flex-1">
                  <div className="h-12 border-b border-gray-200 flex flex-col items-center justify-center">
                    <div className="text-sm font-medium text-gray-700">
                      {daysOfWeek[dayIdx]}
                    </div>
                    <div
                      className={`text-xs ${
                        day.isToday
                          ? "bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                          : "text-gray-500"
                      }`}
                    >
                      {day.date.getDate()}
                    </div>
                  </div>

                  <Droppable droppableId={day.dateKey}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="relative"
                      >
                        {hours.map((hour) => (
                          <div
                            key={hour}
                            className="h-16 border-b border-gray-200 relative"
                          >
                            {/* Time slot background */}
                          </div>
                        ))}

                        {/* Appointments */}
                        {day.appointments.map((appointment, idx) => {
                          const startHour = parseInt(
                            appointment.time.split(":")[0]
                          );
                          const startMinute =
                            parseInt(appointment.time.split(":")[1]) || 0;
                          const duration = appointment.duration || 30;
                          const top =
                            (startHour - 7) * 64 + (startMinute / 60) * 64;
                          const height = (duration / 60) * 64;

                          return (
                            <Draggable
                              key={appointment.id}
                              draggableId={appointment.id}
                              index={idx}
                            >
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`absolute left-1 right-1 ${
                                    appointment.color
                                  } text-white text-xs p-1 rounded-md shadow-sm ${
                                    isDragging ? "shadow-lg z-10" : ""
                                  }`}
                                  style={{
                                    top: `${top}px`,
                                    height: `${height}px`,
                                  }}
                                >
                                  <div className="font-medium truncate">
                                    {appointment.type}
                                  </div>
                                  <div className="text-xs opacity-90">
                                    {appointment.time}
                                  </div>
                                  {appointment.patient && (
                                    <div className="absolute top-0 right-0 w-4 h-4 bg-gray-800 text-white rounded-full flex items-center justify-center text-xs font-bold transform translate-x-1/2 -translate-y-1/2">
                                      {appointment.patient}
                                    </div>
                                  )}
                                </div>
                              )}
                            </Draggable>
                          );
                        })}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              ))}
            </div>
          </div>
        );

      case "DAY":
        return (
          <div className="p-4">
            <div className="grid grid-cols-1 gap-1">
              {/* Time column */}
              {dayTimeSlots.map((slot, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-1 h-20">
                  <div className="col-span-1 border-r border-gray-200 flex items-start justify-end pr-2">
                    <span className="text-xs text-gray-500 mt-1">
                      {slot.time}
                    </span>
                  </div>

                  <Droppable droppableId={selectedDay}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="col-span-11 relative border-b border-gray-200"
                      >
                        {/* Time slot background */}
                        <div className="absolute inset-0">
                          <div className="h-full w-full border-l-2 border-transparent hover:border-gray-200"></div>
                        </div>

                        {/* Appointments */}
                        {slot.appointments.map((appointment, appIdx) => {
                          const duration = appointment.duration || 30;
                          const height = `${(duration / 60) * 80}px`;

                          return (
                            <Draggable
                              key={appointment.id}
                              draggableId={appointment.id}
                              index={appIdx}
                            >
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`absolute left-1 right-1 ${
                                    appointment.color
                                  } text-white text-xs p-1 rounded-md shadow-sm ${
                                    isDragging ? "shadow-lg z-10" : ""
                                  }`}
                                  style={{ height }}
                                >
                                  <div className="flex items-start">
                                    <GripVertical className="w-3 h-3 mr-1 opacity-70" />
                                    <div>
                                      <div className="font-medium truncate">
                                        {appointment.type}
                                      </div>
                                      <div className="text-xs opacity-90">
                                        {appointment.time}
                                      </div>
                                    </div>
                                  </div>
                                  {appointment.patient && (
                                    <div className="absolute top-0 right-0 w-4 h-4 bg-gray-800 text-white rounded-full flex items-center justify-center text-xs font-bold transform translate-x-1/2 -translate-y-1/2">
                                      {appointment.patient}
                                    </div>
                                  )}
                                </div>
                              )}
                            </Draggable>
                          );
                        })}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd} onDragStart={onDragStart}>
      <div className="flex h-[calc(100vh-120px)] bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border-2 border-gray-50 overflow-hidden">
        {/* Main Calendar Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-pink-500">Appointments</h1>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      viewMode === "MONTH"
                        ? navigateMonth("prev")
                        : viewMode === "WEEK"
                        ? navigateWeek("prev")
                        : navigateDay("prev")
                    }
                    className="w-8 h-8 p-0 hover:bg-gray-100"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>

                  <div className="text-sm font-medium text-gray-700 w-48 text-center">
                    {viewMode === "MONTH" &&
                      monthNames[currentDate.getMonth()] +
                        " " +
                        currentDate.getFullYear()}
                    {viewMode === "WEEK" &&
                      `Week of ${weekDays[0].date.getDate()} ${
                        monthNames[weekDays[0].date.getMonth()]
                      }`}
                    {viewMode === "DAY" &&
                      new Date(selectedDay).toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      viewMode === "MONTH"
                        ? navigateMonth("next")
                        : viewMode === "WEEK"
                        ? navigateWeek("next")
                        : navigateDay("next")
                    }
                    className="w-8 h-8 p-0 hover:bg-gray-100"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>

                <Button
                  className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                  onClick={() => setIsBookModalOpen(true)}
                >
                  <Plus className="w-4 h-4" />
                  <span>Book an Appointment</span>
                </Button>
              </div>
            </div>

            {/* View Mode Tabs */}
            <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1 w-fit">
              <Button
                variant={viewMode === "DAY" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("DAY")}
                className={`px-4 py-2 rounded-md text-sm flex items-center gap-2 ${
                  viewMode === "DAY"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <CalendarDays className="w-4 h-4" />
                DAY
              </Button>
              <Button
                variant={viewMode === "WEEK" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("WEEK")}
                className={`px-4 py-2 rounded-md text-sm flex items-center gap-2 ${
                  viewMode === "WEEK"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <List className="w-4 h-4" />
                WEEK
              </Button>
              <Button
                variant={viewMode === "MONTH" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("MONTH")}
                className={`px-4 py-2 rounded-md text-sm flex items-center gap-2 ${
                  viewMode === "MONTH"
                    ? "bg-pink-500 text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Calendar className="w-4 h-4" />
                MONTH
              </Button>
            </div>
          </div>

          {/* Calendar Content */}
          <div className="flex-1 overflow-auto" ref={calendarRef}>
            {renderView()}
          </div>

          {/* Legend */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-8 overflow-x-auto pb-2">
              <div className="flex items-center space-x-2 shrink-0">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">EARPIECE NOV</span>
              </div>
              <div className="flex items-center space-x-2 shrink-0">
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                <span className="text-sm text-gray-600">EXAMINATION</span>
              </div>
              <div className="flex items-center space-x-2 shrink-0">
                <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                <span className="text-sm text-gray-600">CONSULTATION</span>
              </div>
              <div className="flex items-center space-x-2 shrink-0">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-sm text-gray-600">ROUTINE CHECKUP</span>
              </div>
              <div className="flex items-center space-x-2 shrink-0">
                <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                <span className="text-sm text-gray-600">SICK VISIT</span>
              </div>
              <div className="flex items-center space-x-2 shrink-0">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">FOLLOW UP</span>
              </div>
              <div className="flex items-center space-x-2 shrink-0">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm text-gray-600">URGENT</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Preview of the Day */}
        <div className="w-80 border-l border-gray-200 bg-white/80 p-6 overflow-auto">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {viewMode === "DAY" ? "Appointment Details" : "Preview of the Day"}
          </h3>

          {viewMode === "DAY" ? (
            <div className="space-y-4">
              <div className="bg-gray-100 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Selected Day</h4>
                <p className="text-sm text-gray-700">
                  {new Date(selectedDay).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Appointments</h4>
                <div className="space-y-2">
                  {appointmentData[selectedDay]?.length > 0 ? (
                    appointmentData[selectedDay].map((appointment) => (
                      <div
                        key={appointment.id}
                        className={`${appointment.color} text-white p-3 rounded-lg`}
                      >
                        <div className="font-medium">{appointment.type}</div>
                        <div className="text-sm opacity-90">
                          {appointment.time}
                        </div>
                        {appointment.patient && (
                          <div className="mt-2 text-sm">
                            <span className="font-medium">Patient:</span>{" "}
                            {appointment.patient}
                          </div>
                        )}
                        {appointment.duration && (
                          <div className="text-sm">
                            <span className="font-medium">Duration:</span>{" "}
                            {appointment.duration} mins
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">
                      No appointments scheduled for this day
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {hours.map((hour) => {
                const time = `${hour}:00`;
                const appointments =
                  appointmentData[selectedDay]?.filter((app) => {
                    const appHour = parseInt(app.time.split(":")[0]);
                    return appHour === hour;
                  }) || [];

                return (
                  <div key={hour} className="space-y-2">
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{time}</span>
                    </div>
                    <div className="space-y-2 ml-4">
                      {appointments.map((appointment) => (
                        <div
                          key={appointment.id}
                          className={`${appointment.color} text-white text-xs px-3 py-2 rounded-lg`}
                        >
                          <div className="font-medium">{appointment.type}</div>
                          <div className="text-xs opacity-90">
                            {appointment.time}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      
      {/* Book Appointment Modal */}
      <BookAppointmentModal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
      />
    </DragDropContext>
  );
}