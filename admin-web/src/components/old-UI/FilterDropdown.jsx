import { SlidersHorizontal } from "lucide-react";
import Button from "./Button";
import Dropdown from "./Dropdown";

const FilterDropdown = ({
  children,
  label = "Filter",
  align = "right",
  width = "w-48",
}) => {
  return (
    <Dropdown
      align={align}
      width={width}
      trigger={
        <Button variant="secondary">
          <SlidersHorizontal className="h-4 w-4" />
          {label}
        </Button>
      }
    >
      {children}
    </Dropdown>
  );
};

export default FilterDropdown;