import React, { useState } from 'react';
import {
  X,
  Mail,
  Send,
  CheckCircle2,
  Bug,
  Copy,
  Check
} from 'lucide-react';

interface ReportIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReportIssueModal: React.FC<ReportIssueModalProps> = ({ isOpen, onClose }) => {
  const [issueType, setIssueType] = useState<string>('bug');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  const SUPPORT_EMAILS = [
    { label: 'البريد الرئيسي للدعم الفني', email: 'vip@roohpro.com' },
    { label: 'البريد الاحتياطي والمتابعة', email: 'roohpro1@gmail.com' }
  ];

  if (!isOpen) return null;

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    const mailtoSubject = encodeURIComponent(`[بلاغ من منصة Rooh] ${subject || 'إبلاغ عن مشكلة'}`);
    const mailtoBody = encodeURIComponent(
      `نوع البلاغ: ${issueType}\nالبريد الإلكتروني للتواصل: ${userEmail || 'غير محدد'}\n\nتفاصيل المشكلة:\n${description}\n\nنظام التشغيل والمتصفح: ${navigator.userAgent}`
    );
    const mailtoLink = `mailto:vip@roohpro.com,roohpro1@gmail.com?subject=${mailtoSubject}&body=${mailtoBody}`;

    try {
      const existingReports = JSON.parse(localStorage.getItem('rooh_user_issue_reports') || '[]');
      existingReports.push({
        id: `report_${Date.now()}`,
        issueType,
        subject,
        description,
        userEmail,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('rooh_user_issue_reports', JSON.stringify(existingReports));
    } catch (err) {
      console.log('Telemetry save notice', err);
    }

    setIsSubmitted(true);
    window.open(mailtoLink, '_blank');
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setSubject('');
    setDescription('');
    setUserEmail('');
    onClose();
  };

  return (
    <div
      id="report-issue-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200"
      dir="rtl"
    >
      <div className="relative w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden rounded-3xl border-2 border-red-500/60 bg-slate-950 text-white shadow-[0_25px_70px_rgba(0,0,0,0.9),0_0_35px_rgba(239,68,68,0.3)] animate-in zoom-in-95 duration-200">
        
        {/* Dynamic Red Accent Bar */}
        <div className="h-2 w-full bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 shrink-0" />

        {/* Header with Red Theme */}
        <div className="flex items-center justify-between border-b border-red-900/60 p-5 sm:p-6 shrink-0 bg-red-950/60">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-500/25 text-red-300 border border-red-400/40 shadow-inner">
              <Bug className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-red-50">
                مركز الدعم الفني والإبلاغ عن مشكلة
              </h3>
              <p className="text-xs text-red-300/80">
                فريق الدعم الفني متاح لمعالجة كافة الاستفسارات والملاحظات التقنية فوراً
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-900/50 border border-red-700/50 text-red-200 hover:bg-red-800 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Content */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-4">
          
          {/* Direct Support Email Cards in Red Tone */}
          <div className="rounded-2xl border border-red-900/50 bg-red-950/40 p-4 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-red-200">
              <Mail className="w-4 h-4 text-red-400" />
              <span>عناوين البريد المباشر للدعم الفني السريع:</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SUPPORT_EMAILS.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-xl bg-slate-900/90 border border-red-900/40 p-2.5 px-3"
                >
                  <div className="truncate">
                    <span className="block text-[10px] text-slate-400">{item.label}:</span>
                    <a
                      href={`mailto:${item.email}`}
                      className="text-xs font-bold font-mono text-red-300 hover:underline"
                    >
                      {item.email}
                    </a>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyEmail(item.email)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                    title="نسخ البريد"
                  >
                    {copiedEmail === item.email ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {!isSubmitted ? (
            /* Interactive Report Form */
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Issue Type Select */}
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1.5">
                  نوع البلاغ أو الملاحظة:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'bug', label: 'خطأ برمجي (Bug)', icon: '🐞' },
                    { id: 'content', label: 'محتوى البوابات', icon: '🖼️' },
                    { id: 'suggestion', label: 'اقتراح وتطوير', icon: '💡' }
                  ].map((tab) => (
                    <button
                      type="button"
                      key={tab.id}
                      onClick={() => setIssueType(tab.id)}
                      className={`flex items-center justify-center gap-1.5 rounded-xl py-2 px-3 text-xs font-bold transition-all cursor-pointer ${
                        issueType === tab.id
                          ? 'bg-red-600 text-white shadow-md shadow-red-600/30 border border-red-400'
                          : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800'
                      }`}
                    >
                      <span>{tab.icon}</span>
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">
                  عنوان المشكلة (اختياري):
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="مثال: مشكلة في تحميل الصورة بالبوابة 2"
                  className="w-full rounded-xl border border-red-900/40 bg-slate-900 px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:border-red-500 focus:outline-hidden"
                />
              </div>

              {/* User Email */}
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">
                  بريدك الإلكتروني (لتلقي الرد والمتابعة):
                </label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full rounded-xl border border-red-900/40 bg-slate-900 px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:border-red-500 focus:outline-hidden"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">
                  تفاصيل المشكلة والخطوات: <span className="text-red-400">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="يرجى وصف المشكلة بالتفصيل لمساعدتنا في فحصها وإصلاحها في أسرع وقت..."
                  className="w-full rounded-xl border border-red-900/40 bg-slate-900 p-3.5 text-xs text-white placeholder:text-slate-500 focus:border-red-500 focus:outline-hidden resize-none leading-relaxed"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 py-3 text-xs font-bold text-white shadow-lg shadow-red-600/30 transition-all active:scale-98 border border-white/20 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>إرسال البلاغ فوراً إلى فريق الدعم الفني</span>
              </button>
            </form>
          ) : (
            /* Success State */
            <div className="rounded-2xl border border-red-500/40 bg-red-950/40 p-6 text-center space-y-3 animate-in zoom-in-95">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/20 text-red-400 mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">تم استلام بلاغك بنجاح!</h4>
                <p className="text-xs text-slate-300 mt-1">
                  شكراً لمساعدتنا في تحسين المنصة. تم توجيه البلاغ مباشرة إلى فريق الدعم الفني على:
                </p>
                <div className="mt-2 text-xs font-mono font-bold text-red-300">
                  vip@roohpro.com • roohpro1@gmail.com
                </div>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="rounded-xl bg-red-600 hover:bg-red-500 px-6 py-2 text-xs font-bold text-white transition-colors cursor-pointer"
              >
                إغلاق النافذة
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
