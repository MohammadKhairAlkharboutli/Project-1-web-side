import { Input } from "@/components/ui/input";

export default function DoctorRatingFilter({ value, onChange }) {
  return (
    <Input
      type="number"
      min="1"
      inputMode="numeric"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder="Doctor profile ID"
      className="w-full sm:w-56"
      aria-label="Filter ratings by doctor profile ID"
    />
  );
}
