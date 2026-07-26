import { Input } from "@/components/ui/input";

export default function PatientRatingFilter({ value, onChange }) {
  return (
    <Input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder="Patient name, email, or ID"
      className="w-full sm:w-56"
      aria-label="Filter ratings by patient"
    />
  );
}
