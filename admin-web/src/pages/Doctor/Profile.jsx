// import {
//   formatCurrency,
//   formatDoctorStatus,
//   formatEnumLabel,
//   formatLanguagesSpoken,
// } from "../Admin/Doctors/doctorUtils";
// import { getCurrentDoctor } from "./doctorPortalData";

// export default function DoctorProfile() {
//   const doctor = getCurrentDoctor();
//   const fullName = doctor?.user?.full_name || "Doctor Name";

//   return (
//     <div className="w-full min-h-screen bg-[#f4f7fb] text-slate-900 font-sans antialiased p-6 sm:p-10 lg:p-12" dir="ltr">
//       <div className="max-w-[1400px] mx-auto space-y-8">

//         {/* Executive Header Bar */}
//         <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white border border-slate-200/70 rounded-[28px] p-8 shadow-xs relative overflow-hidden">
          
//           {/* Subtle Medical Blue Accent Line - تم التعديل إلى التدرج اللوني الجديد */}
//           <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-br from-[#1e61dc] to-[#3b9df5]" />

//           {/* Left: Avatar & Identity */}
//           <div className="flex flex-col sm:flex-row items-center sm:items-center gap-6 text-center sm:text-left">
//             <div className="relative group shrink-0">
//               {/* تم تحديث تدرج خلفية الصورة */}
//               <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-br from-[#1e61dc] to-[#3b9df5] p-1 shadow-md overflow-hidden">
//                 <img
//                   src={doctor?.user?.avatar || doctor?.photo || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300"}
//                   alt={fullName}
//                   className="w-full h-full object-cover rounded-xl"
//                 />
//               </div>
//               <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-xs" />
//             </div>

//             <div className="space-y-2">
//               <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-blue-50 border border-blue-100 text-[#1e61dc] text-xs font-bold tracking-wide">
//                 <span className="w-1.5 h-1.5 rounded-full bg-[#1e61dc]" />
//                 {doctor?.specialization || "Specialist Practitioner"}
//               </div>

//               <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
//                 {fullName}
//               </h1>

//               <p className="text-sm text-slate-500 font-medium">
//                 {doctor?.subSpecialization ? doctor.subSpecialization : "Clinical Operations & Patient Services"}
//               </p>
//             </div>
//           </div>

//           {/* Right: Key Performance Indicators (KPIs) in Blue Theme */}
//           <div className="flex flex-wrap items-center justify-center gap-3 border-t lg:border-t-0 lg:border-l border-slate-100 pt-6 lg:pt-0 lg:pl-8">
//             <div className="bg-blue-50/50 border border-blue-100 px-5 py-3 rounded-xl text-center min-w-[100px]">
//               <span className="text-[11px] font-bold text-blue-500 uppercase tracking-wider block">Rating</span>
//               <span className="text-sm font-black text-[#1e61dc] mt-0.5 block">★ {doctor?.averageRating?.toFixed(1) || "0.0"}</span>
//             </div>

//             <div className="bg-blue-50/50 border border-blue-100 px-5 py-3 rounded-xl text-center min-w-[100px]">
//               <span className="text-[11px] font-bold text-blue-500 uppercase tracking-wider block">Clinics</span>
//               <span className="text-sm font-black text-[#1e61dc] mt-0.5 block">{doctor?.clinics_count || 0} Units</span>
//             </div>

//             <div className="bg-emerald-50 border border-emerald-200/60 px-5 py-3 rounded-xl text-center min-w-[110px]">
//               <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">Status</span>
//               <span className="text-sm font-black text-emerald-700 mt-0.5 block">{formatDoctorStatus(doctor?.status)}</span>
//             </div>
//           </div>

//         </div>

//         {/* Structured Grid Layout */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

//           {/* Main Column (Bio & Data) */}
//           <div className="lg:col-span-2 space-y-6">
            
//             {/* Biography Section */}
//             <div className="bg-white border border-slate-200/70 rounded-[28px] p-8 shadow-xs space-y-4">
//               <div className="flex items-center justify-between pb-3 border-b border-slate-100">
//                 <h3 className="text-xs font-black text-[#1e61dc] uppercase tracking-wider">
//                   Professional Biography
//                 </h3>
//                 <span className="text-xs font-mono text-slate-400">Overview</span>
//               </div>
//               <p className="text-sm text-slate-600 leading-relaxed font-normal bg-blue-50/30 p-5 rounded-2xl border border-blue-50">
//                 {doctor?.bio || "No professional biography registered in the system database."}
//               </p>
//             </div>

//             {/* Credentials & Personal Details */}
//             <div className="bg-white border border-slate-200/70 rounded-[28px] p-8 shadow-xs space-y-6">
//               <div className="flex items-center justify-between pb-3 border-b border-slate-100">
//                 <h3 className="text-xs font-black text-[#1e61dc] uppercase tracking-wider">
//                   Identity & Credentials
//                 </h3>
//                 <span className="text-xs font-mono text-slate-400">Metadata</span>
//               </div>

//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
//                 <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
//                   <span className="text-slate-400 font-bold">Email Address</span>
//                   <span className="text-slate-800 font-bold truncate max-w-[160px]">{doctor?.user?.email || "N/A"}</span>
//                 </div>
//                 <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
//                   <span className="text-slate-400 font-bold">Phone Number</span>
//                   <span className="text-slate-800 font-bold">{doctor?.user?.phone || "N/A"}</span>
//                 </div>
//                 <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
//                   <span className="text-slate-400 font-bold">License ID</span>
//                   <span className="text-slate-800 font-bold">{doctor?.licenseNumber || "N/A"}</span>
//                 </div>
//                 <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
//                   <span className="text-slate-400 font-bold">Gender</span>
//                   <span className="text-slate-800 font-bold">{formatEnumLabel(doctor?.user?.gender) || "N/A"}</span>
//                 </div>
//                 <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
//                   <span className="text-slate-400 font-bold">Age</span>
//                   <span className="text-slate-800 font-bold">{doctor?.user?.age ? `${doctor.user.age} Years` : "N/A"}</span>
//                 </div>
//                 <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
//                   <span className="text-slate-400 font-bold">Languages</span>
//                   <span className="text-slate-800 font-bold">{formatLanguagesSpoken(doctor?.languagesSpoken) || "N/A"}</span>
//                 </div>
//               </div>
//             </div>

//           </div>

//           {/* Sidebar Column (Financials & Location) */}
//           <div className="space-y-6">
            
//             {/* Financial Structure / Fees */}
//             <div className="bg-white border border-slate-200/70 rounded-[28px] p-8 shadow-xs space-y-6">
//               <div className="flex items-center justify-between pb-3 border-b border-slate-100">
//                 <h3 className="text-xs font-black text-[#1e61dc] uppercase tracking-wider">
//                   Consultation Tariffs
//                 </h3>
//                 <span className="text-xs font-mono text-slate-400">Pricing</span>
//               </div>

//               <div className="space-y-3">
//                 <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 flex items-center justify-between">
//                   <div>
//                     <span className="text-[11px] font-bold text-blue-500 uppercase tracking-wide block">Initial Visit</span>
//                     <span className="text-base font-black text-[#1e61dc] mt-0.5 block">{formatCurrency(doctor?.initialVisitFee)}</span>
//                   </div>
//                   <span className="text-lg">💳</span>
//                 </div>

//                 <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
//                   <div>
//                     <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block">Return Visit</span>
//                     <span className="text-base font-black text-slate-800 mt-0.5 block">{formatCurrency(doctor?.returnVisitFee)}</span>
//                   </div>
//                   <span className="text-lg">🔄</span>
//                 </div>
//               </div>
//             </div>

//             {/* Office Location Module */}
//             <div className="bg-white border border-slate-200/70 rounded-[28px] p-8 shadow-xs space-y-4">
//               <div className="flex items-center justify-between pb-3 border-b border-slate-100">
//                 <h3 className="text-xs font-black text-[#1e61dc] uppercase tracking-wider">
//                   Facility Location
//                 </h3>
//                 <span className="text-xs font-mono text-slate-400">Address</span>
//               </div>

//               <div className="p-4 rounded-xl bg-blue-50/30 border border-blue-50 flex items-start gap-3">
//                 <span className="text-base mt-0.5">📍</span>
//                 <div className="space-y-1">
//                   <span className="text-xs font-bold text-slate-800 block">Primary Office</span>
//                   <p className="text-xs text-slate-500 leading-relaxed font-medium">{doctor?.user?.address || "No facility location address registered."}</p>
//                 </div>
//               </div>
//             </div>

//           </div>

//         </div>

//       </div>
//     </div>
//   );
// }