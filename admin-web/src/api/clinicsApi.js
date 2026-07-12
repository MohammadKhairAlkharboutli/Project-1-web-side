import { clinics } from "@/pages/Admin/ClinicData";

export const clinicsApi = {
  async getClinics() {
    return clinics;
  },
};
