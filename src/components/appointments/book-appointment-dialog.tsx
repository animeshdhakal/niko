"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar"; // Assuming shadcn Calendar exists
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, Loader2, Check, ChevronsUpDown, Plus } from "lucide-react";
import { toast } from "sonner";
import { bookAppointment, getDepartments, getDoctorsByDepartment, getAllHospitalsForBooking } from "@/app/(dashboard)/appointments/actions";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

interface BookAppointmentDialogProps {
  hospitalId?: string;
  hospitalName?: string;
}

export function BookAppointmentDialog({
  hospitalId,
  hospitalName,
}: BookAppointmentDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hospitals, setHospitals] = useState<{ id: string; name: string; city: string | null; district: string | null }[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<string>(hospitalId || "");
  const [hospitalOpen, setHospitalOpen] = useState(false);

  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  const [doctors, setDoctors] = useState<{ id: string; name: string; dailyCapacity: number }[]>([]);

  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [selectedDoctor, setSelectedDoctor] = useState<string>("");
  const [date, setDate] = useState<Date>();

  // Fetch all hospitals when dialog opens if not pre-selected
  useEffect(() => {
    if (open && !hospitalId) {
      setLoading(true);
      getAllHospitalsForBooking()
        .then(setHospitals)
        .catch(() => toast.error("Failed to load hospitals"))
        .finally(() => setLoading(false));
    }
  }, [open, hospitalId]);

  useEffect(() => {
    // If hospital provided via props, use it. Otherwise use selectedHospital from dropdown.
    const activeHospitalId = hospitalId || selectedHospital;

    if (activeHospitalId) {
      setLoading(true);
      getDepartments(activeHospitalId)
        .then((data) => setDepartments(data))
        .catch(() => toast.error("Failed to load departments"))
        .finally(() => setLoading(false));
    }
  }, [hospitalId, selectedHospital]);

  useEffect(() => {
    if (selectedDepartment) {
      setLoading(true);
      setDoctors([]);
      setSelectedDoctor("");
      getDoctorsByDepartment(selectedDepartment)
        .then((data) => setDoctors(data))
        .catch(() => toast.error("Failed to load doctors"))
        .finally(() => setLoading(false));
    }
  }, [selectedDepartment]);

  const handleBook = async () => {
    if (!selectedDoctor || !date) {
      toast.error("Please select a doctor and date");
      return;
    }

    setLoading(true);
    try {
      await bookAppointment({
        doctorId: selectedDoctor,
        date: date,
      });
      toast.success("Appointment booked successfully!");
      setOpen(false);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || "Failed to book appointment");
      } else {
        toast.error("Failed to book appointment");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size={hospitalId ? "sm" : "default"}>
          {!hospitalId && <Plus className="mr-2 h-4 w-4" />}
          {hospitalId ? "Book Appointment" : "Book New Appointment"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Book Appointment</DialogTitle>
          <DialogDescription>
            {hospitalName
              ? `Book an appointment at ${hospitalName}.`
              : "Search and select a hospital to book an appointment."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto px-1">

          {/* Hospital Selection (Only if not pre-selected) */}
          {!hospitalId && (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Hospital</label>
              <Popover open={hospitalOpen} onOpenChange={setHospitalOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={hospitalOpen}
                    className="w-full justify-between"
                  >
                    {selectedHospital
                      ? hospitals.find((h) => h.id === selectedHospital)?.name
                      : "Select hospital..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                  <Command>
                    <CommandInput placeholder="Search hospital..." />
                    <CommandList>
                      <CommandEmpty>No hospital found.</CommandEmpty>
                      <CommandGroup>
                        {hospitals.map((hospital) => (
                          <CommandItem
                            key={hospital.id}
                            value={`${hospital.name} ${hospital.city} ${hospital.district}`}
                            onSelect={() => {
                              setSelectedHospital(hospital.id === selectedHospital ? "" : hospital.id);
                              setHospitalOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedHospital === hospital.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <div className="flex flex-col">
                                <span>{hospital.name}</span>
                                <span className="text-xs text-muted-foreground">{hospital.city}, {hospital.district}</span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          )}

          {/* Department, Doctor, Date Selection */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Department</label>
            <Select
              value={selectedDepartment}
              onValueChange={setSelectedDepartment}
              disabled={!hospitalId && !selectedHospital}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Doctor</label>
            <Select
              value={selectedDoctor}
              onValueChange={setSelectedDoctor}
              disabled={!selectedDepartment}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Doctor" />
              </SelectTrigger>
              <SelectContent>
                {doctors.map((doctor) => (
                  <SelectItem key={doctor.id} value={doctor.id}>
                    {doctor.name} (Capacity: {doctor.dailyCapacity}/day)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  disabled={(date) => date < new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleBook} disabled={loading || !selectedDoctor || !date}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm Booking
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
