import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Play, SkipForward, CheckCircle2, Clock, FileText } from 'lucide-react';

export default function DoctorLiveQueue({ clinicId }) {
  const navigate = useNavigate();
  
  // Mock data for testing the UI layout instantly
  const [queue, setQueue] = useState([
    {
      id: 1,
      position: 1,
      status: 'in_progress',
      estimatedWaitMinutes: 0,
      appointment: {
        id: 101,
        type: 'Main Checkup',
        patient: { id: 501, user: { fullName: 'Ahmad Ali' } }
      }
    },
    {
      id: 2,
      position: 2,
      status: 'calling',
      estimatedWaitMinutes: 5,
      appointment: {
        id: 102,
        type: 'Consultation',
        patient: { id: 502, user: { fullName: 'Sara Mohammed' } }
      }
    },
    {
      id: 3,
      position: 3,
      status: 'waiting',
      estimatedWaitMinutes: 15,
      appointment: {
        id: 103,
        type: 'Follow-up',
        patient: { id: 503, user: { fullName: 'Khaled Ibrahim' } }
      }
    },
    {
      id: 4,
      position: 4,
      status: 'waiting',
      estimatedWaitMinutes: 25,
      appointment: {
        id: 104,
        type: 'Regular Checkup',
        patient: { id: 504, user: { fullName: 'Fatima Omar' } }
      }
    }
  ]);

  const [actionLoading, setActionLoading] = useState(null);

  // Navigate to patient chart/profile
  const handleOpenPatientChart = (patientId) => {
    navigate(`/doctor/patients/${patientId}`);
  };

  // Navigate to Medical History using the correct appointmentId route matching App.js
  const handleOpenMedicalHistory = (appointmentId, e) => {
    e.stopPropagation();
    navigate(`/doctor/medical-history/${appointmentId}`);
  };

  // Simulate calling the next patient
  const handleCallNext = () => {
    setActionLoading('call');
    setTimeout(() => {
      setQueue(prev => prev.map(item => {
        if (item.status === 'waiting') {
          return { ...item, status: 'calling' };
        }
        return item;
      }));
      setActionLoading(null);
    }, 500);
  };

  // Start consultation, update status, and navigate to patient info
  const handleStartConsultation = (id, patientId, e) => {
    e.stopPropagation();
    setQueue(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, status: 'in_progress' };
      }
      return item;
    }));
    navigate(`/doctor/patients/${patientId}`);
  };

  // Complete consultation
  const handleCompleteConsultation = (id, e) => {
    e.stopPropagation();
    setQueue(prev => prev.filter(item => item.id !== id));
  };

  // Skip patient
  const handleSkip = (id, e) => {
    e.stopPropagation();
    setQueue(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="p-6 max-w-5xl mx-auto bg-[#F8FAFC] min-h-screen rounded-3xl" dir="ltr">
      
      {/* Page Title */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-black text-blue-600">Queue Management</h1>
      </div>

      {/* Top Horizontal Queue Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-100 mb-6 overflow-x-auto flex items-center gap-6">
        {queue.length === 0 ? (
          <p className="text-xs text-slate-400">No active queue items.</p>
        ) : (
          queue.map((item) => {
            const patientName = item.appointment?.patient?.user?.fullName || 'Patient';
            const patientId = item.appointment?.patient?.id;
            return (
              <div 
                key={item.id} 
                onClick={() => patientId && navigate(`/doctor/patients/${patientId}`)}
                className="flex flex-col items-center shrink-0 cursor-pointer group"
              >
                <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm shadow-xs transition group-hover:scale-105 ${
                  item.status === 'in_progress' ? 'bg-emerald-500 text-white' :
                  item.status === 'calling' ? 'bg-blue-500 text-white' :
                  'bg-amber-100 text-amber-700 border border-amber-200'
                }`}>
                  {item.position}
                </div>
                <span className="text-[11px] font-bold text-slate-600 mt-1 max-w-[70px] truncate group-hover:text-blue-600">
                  {patientName}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* Call Next Patient Button */}
      <div className="mb-6">
        <button
          onClick={handleCallNext}
          disabled={actionLoading === 'call'}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3.5 rounded-2xl font-bold text-sm shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        >
          <Bell size={18} />
          <span>{actionLoading === 'call' ? 'Calling...' : 'Call Next Patient'}</span>
        </button>
      </div>

      {/* Main Queue Cards List */}
      <div className="space-y-4">
        {queue.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl text-center text-slate-400 border border-slate-100">
            No patients in the queue for today.
          </div>
        ) : (
          queue.map((item) => {
            const patient = item.appointment?.patient;
            const patientName = patient?.user?.fullName || 'Unknown Patient';
            const appointmentType = item.appointment?.type || 'Regular Checkup';
            const patientId = patient?.id;
            const appointmentId = item.appointment?.id;
            
            let statusBadge = null;
            if (item.status === 'in_progress') {
              statusBadge = <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold">In Room</span>;
            } else if (item.status === 'calling') {
              statusBadge = <span className="bg-blue-50 text-blue-600 border border-blue-200 px-3 py-1 rounded-full text-xs font-bold">Calling</span>;
            } else {
              statusBadge = <span className="bg-amber-50 text-amber-600 border border-amber-200 px-3 py-1 rounded-full text-xs font-bold">Waiting</span>;
            }

            return (
              <div 
                key={item.id} 
                onClick={() => patientId && handleOpenPatientChart(patientId)}
                className="bg-white p-5 rounded-2xl shadow-xs border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all cursor-pointer flex flex-col gap-3"
              >
                
                {/* Card Header */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm">
                      {item.position}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 hover:text-blue-600 transition">{patientName}</h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">Appointment Type: {appointmentType} (ID: {appointmentId})</p>
                    </div>
                  </div>
                  <div>{statusBadge}</div>
                </div>

                <hr className="border-slate-100 my-1" />

                {/* Card Footer */}
                <div className="flex justify-between items-center text-xs">
                  <div className="text-slate-500 flex items-center gap-1.5 font-medium">
                    <Clock size={14} className="text-slate-400" />
                    <span>Estimated Wait: {item.estimatedWaitMinutes} mins</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* زر الهيستوري (يعمل باستخدام الـ appointmentId المتوافق مع App.js) */}
                    {appointmentId && (
                      <button
                        onClick={(e) => handleOpenMedicalHistory(appointmentId, e)}
                        className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                        title="View Medical History & Attachments"
                      >
                        <FileText size={16} />
                      </button>
                    )}

                    {/* زر بدء الجلسة */}
                    {item.status === 'calling' && (
                      <button
                        onClick={(e) => handleStartConsultation(item.id, patientId, e)}
                        className="p-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition"
                        title="Start Consultation & Open Patient Info"
                      >
                        <Play size={16} />
                      </button>
                    )}
                    {item.status === 'in_progress' && (
                      <button
                        onClick={(e) => handleCompleteConsultation(item.id, e)}
                        className="p-2 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition"
                        title="Complete Consultation"
                      >
                        <CheckCircle2 size={16} />
                      </button>
                    )}
                    {(item.status === 'waiting' || item.status === 'calling') && (
                      <button
                        onClick={(e) => handleSkip(item.id, e)}
                        className="p-2 rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-100 transition"
                        title="Skip"
                      >
                        <SkipForward size={16} />
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}