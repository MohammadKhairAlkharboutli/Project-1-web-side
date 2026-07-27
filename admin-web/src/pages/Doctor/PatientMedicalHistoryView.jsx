// File: PatientMedicalHistoryView.jsx

import { useState, useEffect } from "react";
import { FileText, Calendar, Pill, Paperclip, Loader2, Stethoscope, Download, ShieldCheck, Activity, Clock } from "lucide-react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function PatientMedicalHistoryView() {
  const { appointmentId } = useParams();
  const [medicalHistories, setMedicalHistories] = useState([]);
  const [profileAttachments, setProfileAttachments] = useState([]);
  const [historyAttachments, setHistoryAttachments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMedicalData = async () => {
      try {
        setLoading(true);
        
        const attachmentsRes = await axios.get(`/api/medical-attachments/appointment/${appointmentId}`, {
          withCredentials: true,
        });
        
        setProfileAttachments(Array.isArray(attachmentsRes.data?.profileAttachments) ? attachmentsRes.data.profileAttachments : []);
        setHistoryAttachments(Array.isArray(attachmentsRes.data?.historyAttachments) ? attachmentsRes.data.historyAttachments : []);

        const historyRes = await axios.get(`/api/medical-histories/appointment/${appointmentId}`, {
          withCredentials: true,
        }).catch(() => ({ data: [] }));

        const historyData = historyRes.data;
        if (Array.isArray(historyData)) {
          setMedicalHistories(historyData);
        } else if (historyData && typeof historyData === 'object') {
          setMedicalHistories([historyData]);
        } else {
          setMedicalHistories([]);
        }

      } catch (error) {
        console.error("خطأ في جلب بيانات السجلات والمرفقات الطبية:", error);
        setMedicalHistories([]);
      } finally {
        setLoading(false);
      }
    };

    if (appointmentId) {
      fetchMedicalData();
    }
  }, [appointmentId]);

  const handleDownloadAttachment = (attachmentId) => {
    window.open(`/api/medical-attachments/appointment/${appointmentId}/attachment/${attachmentId}`, '_blank');
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center bg-slate-50 min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-slate-50/50 p-4 sm:p-8 min-h-screen text-right" dir="rtl">
      {/* Page Header */}
      <div className="bg-white p-6 rounded-2xl border border-blue-100/60 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-blue-600"></div>
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center bg-blue-50 text-blue-600 rounded-2xl border border-blue-100 shadow-2xs">
            <Activity size={24} />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-900 tracking-tight">السجلات الطبية والمرفقات</h1>
            <p className="text-xs font-medium text-slate-500 mt-0.5 flex items-center gap-1.5">
              <span>تفاصيل التشخيص، خطة العلاج، والأدوية</span>
            </p>
          </div>
        </div>
        <div className="text-xs font-bold text-blue-700 bg-blue-50 px-4 py-2.5 rounded-xl border border-blue-100 flex items-center gap-2 shadow-2xs">
          <Clock size={14} className="text-blue-500" />
          <span>موعد رقم: {appointmentId}</span>
        </div>
      </div>

      {/* Medical Histories List */}
      <div className="space-y-4">
        {medicalHistories.length > 0 ? (
          medicalHistories.map((history, idx) => (
            <div
              key={history.id || idx}
              className="bg-white p-6 rounded-2xl border border-blue-100/50 shadow-xs space-y-5 relative overflow-hidden"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center bg-blue-600 text-white rounded-xl shadow-sm">
                    <Stethoscope size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      الدكتور: {history.doctorProfile?.user?.firstName || "غير محدد"} {history.doctorProfile?.user?.lastName || ""}
                    </h3>
                    <span className="text-[11px] text-blue-600 font-semibold flex items-center gap-1 mt-0.5">
                      <Calendar size={12} /> تاريخ الإنشاء: {new Date(history.created_at || Date.now()).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <span className="bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1">
                  <ShieldCheck size={14} className="text-blue-600" /> معتمد
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50/30 p-4 rounded-xl border border-blue-100/60">
                  <h4 className="text-xs font-bold text-blue-900 mb-2 flex items-center gap-2">
                    <div className="p-1.5 bg-blue-600 text-white rounded-lg">
                      <FileText size={14} />
                    </div>
                    <span>التشخيص (Diagnosis)</span>
                  </h4>
                  <p className="text-xs text-slate-700 leading-relaxed pr-8">{history.diagnosis || "لا يوجد تشخيص مسجل"}</p>
                </div>

                <div className="bg-blue-50/30 p-4 rounded-xl border border-blue-100/60">
                  <h4 className="text-xs font-bold text-blue-900 mb-2 flex items-center gap-2">
                    <div className="p-1.5 bg-blue-600 text-white rounded-lg">
                      <Calendar size={14} />
                    </div>
                    <span>خطة العلاج (Treatment Plan)</span>
                  </h4>
                  <p className="text-xs text-slate-700 leading-relaxed pr-8">{history.treatmentPlan || "لا توجد خطة علاج مسجلة"}</p>
                </div>
              </div>

              {history.doctorNotes && (
                <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-200/60 flex items-start gap-3">
                  <div className="p-1.5 bg-blue-600 text-white rounded-lg mt-0.5">
                    <FileText size={14} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-blue-900 mb-1">ملاحظات الطبيب</h4>
                    <p className="text-xs text-blue-950/80 leading-relaxed">{history.doctorNotes}</p>
                  </div>
                </div>
              )}

              {Array.isArray(history.medicines) && history.medicines.length > 0 && (
                <div className="pt-3 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <div className="p-1.5 bg-blue-600 text-white rounded-lg">
                      <Pill size={14} />
                    </div>
                    <span>الأدوية الموصوفة</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {history.medicines.map((med, index) => (
                      <div key={index} className="bg-blue-50/30 p-3 rounded-xl border border-blue-100 text-xs flex justify-between items-center">
                        <span className="font-bold text-blue-950 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                          {med.name}
                        </span>
                        <span className="bg-blue-600 text-white px-2.5 py-1 rounded-lg font-bold text-[11px] shadow-2xs">
                          {med.dosage}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="bg-white p-8 rounded-2xl border border-blue-100/60 text-center shadow-xs">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-blue-100">
              <FileText size={22} />
            </div>
            <p className="text-xs font-bold text-slate-700">لا توجد سجلات تشخيصية مكتوبة لهذا الموعد بعد.</p>
          </div>
        )}
      </div>

      {/* Attachments Section */}
      <div className="bg-white p-6 rounded-2xl border border-blue-100/60 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <div className="p-1.5 bg-blue-600 text-white rounded-lg">
            <Paperclip size={16} />
          </div>
          <span>المرفقات والملفات الطبية المرتبطة</span>
        </h3>

        {profileAttachments.length > 0 && (
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-blue-900">مرفقات الملف الشخصي:</span>
            <div className="flex flex-wrap gap-2">
              {profileAttachments.map((att) => (
                <button
                  key={att.id}
                  onClick={() => handleDownloadAttachment(att.id)}
                  className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 border border-blue-200/60 shadow-2xs"
                >
                  <Paperclip size={14} className="text-blue-600" />
                  <span>{att.originalName}</span>
                  <Download size={13} className="text-blue-500 mr-1" />
                </button>
              ))}
            </div>
          </div>
        )}

        {historyAttachments.length > 0 && (
          <div className="space-y-2 pt-2">
            <span className="text-[11px] font-bold text-blue-900">مرفقات السجلات والتقارير:</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {historyAttachments.map((att) => (
                <div key={att.id} className="bg-blue-50/30 p-3.5 rounded-xl border border-blue-100 flex justify-between items-center">
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className="p-2 bg-blue-600 text-white rounded-lg shrink-0">
                      <Paperclip size={14} />
                    </div>
                    <span className="font-bold text-xs text-slate-800 truncate">{att.originalName}</span>
                  </div>
                  <button
                    onClick={() => handleDownloadAttachment(att.id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 shrink-0 shadow-2xs"
                    title="تحميل / عرض"
                  >
                    <Download size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {profileAttachments.length === 0 && historyAttachments.length === 0 && (
          <div className="text-center py-6">
            <p className="text-xs text-slate-400 font-medium">لا توجد ملفات أو مرفقات مرفوعة لهذا الموعد.</p>
          </div>
        )}
      </div>
    </div>
  );
}