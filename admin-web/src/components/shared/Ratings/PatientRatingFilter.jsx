import { Input } from "@/components/ui/input";

export default function PatientRatingFilter({ value, onChange }) {
  return (
    <Input
      type="number"
      min="1"
      inputMode="numeric"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder="Patient profile ID"
      className="w-full sm:w-56"
      aria-label="Filter ratings by patient profile ID"
    />
  );
}
