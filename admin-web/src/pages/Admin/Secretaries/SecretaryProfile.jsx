import { Outlet, useParams } from "react-router-dom";

import ProfileLayout from "@/components/shared/ProfileLayout";

import { secretaries } from "../SecrataryData";
import SecretaryProfileHeader from "./components/SecretaryProfileHeader";
import SecretaryProfileNav from "./components/SecretaryProfileNav";

export default function SecretaryProfile() {
  const { secretaryId } = useParams();
  const secretary = secretaries.find((item) => String(item.id) === secretaryId);

  if (!secretary) {
    return (
      <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Secretary not found
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          The secretary profile you requested does not exist.
        </p>
      </div>
    );
  }

  return (
    <ProfileLayout
      header={<SecretaryProfileHeader secretary={secretary} />}
      nav={<SecretaryProfileNav secretaryId={secretary.id} />}
    >
      <Outlet />
    </ProfileLayout>
  );
}
