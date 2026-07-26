import { Input } from "@/components/ui/input";

export default function DoctorRatingFilter({ value, onChange }) {
  return (
    <Input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder="Doctor name, email, or ID"
      className="w-full sm:w-56"
      aria-label="Filter ratings by doctor"
    />
  );
}
