import { useState } from 'react';
import {
  Mail,
  MessageSquare,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  Building2,
  ExternalLink,
  HelpCircle,
  Phone
} from 'lucide-react';

export const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: 'General Inquiry',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setSubmitted(true);
  };

  const handleReset = () => {
    setSubmitted(false);
    setFormData({
      name: '',
      email: '',
      category: 'General Inquiry',
      subject: '',
      message: ''
    });
  };

  return (
    <div className="space-y-12 py-4">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="inline-flex items-center gap-2 px-3.5 py-1 border-2 border-[var(--border)] bg-[var(--accent)] text-[var(--accent-foreground)] text-xs font-black shadow-[2px_2px_0px_0px_var(--shadow-color)] uppercase tracking-wider">
          <Mail className="w-3.5 h-3.5" />
          <span>Support & Inquiries</span>
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-[var(--foreground)] tracking-tight">
          Get in touch with the RTI Assist team.
        </h1>
        <p className="text-base sm:text-lg text-[var(--muted-foreground)] font-medium leading-relaxed">
          Have questions about using the platform, suggestions for directory mappings, or technical feedback? We're here to help.
        </p>
      </div>

      {/* Main Grid: Form + Direct Channels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Contact Form (7 cols) */}
        <div className="lg:col-span-7 border-2 border-[var(--border)] bg-[var(--card)] shadow-[6px_6px_0px_0px_var(--shadow-color)] p-6 sm:p-8 space-y-6">
          <div className="border-b-2 border-[var(--border)] pb-4 space-y-1">
            <h2 className="text-xl font-black text-[var(--foreground)]">Send Us a Message</h2>
            <p className="text-xs text-[var(--muted-foreground)] font-medium">
              Fill out the form below and our team will get back to you within 24–48 hours.
            </p>
          </div>

          {submitted ? (
            <div className="p-8 border-2 border-[var(--border)] bg-[var(--background)] text-center space-y-4 shadow-[3px_3px_0px_0px_var(--shadow-color)]">
              <CheckCircle2 className="w-12 h-12 text-[var(--secondary)] mx-auto" />
              <div className="space-y-1">
                <h3 className="text-lg font-black text-[var(--foreground)]">Message Received!</h3>
                <p className="text-xs text-[var(--muted-foreground)] font-medium max-w-md mx-auto">
                  Thank you for reaching out, <strong>{formData.name}</strong>. A confirmation has been noted and our team will respond to <strong>{formData.email}</strong> shortly.
                </p>
              </div>
              <button
                onClick={handleReset}
                className="px-5 py-2.5 border-2 border-[var(--border)] text-xs font-bold bg-[var(--primary)] text-[var(--primary-foreground)] shadow-[2px_2px_0px_0px_var(--shadow-color)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] transition cursor-pointer"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-[var(--foreground)] mb-1">
                    Your Name *
                  </label>
                  <input
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Ananya Sharma"
                    className="w-full p-2.5 border-2 border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-[var(--foreground)] mb-1">
                    Email Address *
                  </label>
                  <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. ananya@example.com"
                    className="w-full p-2.5 border-2 border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-[var(--foreground)] mb-1">
                    Inquiry Type
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2.5 border-2 border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)] focus:outline-none"
                  >
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Technical Support">Technical Support / Bug Report</option>
                    <option value="Public Authority Update">Add / Update Public Authority</option>
                    <option value="College or NGO Collaboration">College / NGO Collaboration</option>
                    <option value="Feedback">Feedback & Suggestions</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-[var(--foreground)] mb-1">
                    Subject
                  </label>
                  <input
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="e.g. Question regarding college fee RTI"
                    className="w-full p-2.5 border-2 border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-[var(--foreground)] mb-1">
                  Your Message *
                </label>
                <textarea
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Tell us how we can help you..."
                  className="w-full p-2.5 border-2 border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)] focus:outline-none leading-relaxed"
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 border-2 border-[var(--border)] text-xs font-black uppercase tracking-wider text-[var(--primary-foreground)] bg-[var(--primary)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] shadow-[3px_3px_0px_0px_var(--shadow-color)] transition active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
              >
                <span>Send Message</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>

        {/* Right: Direct Channels & Official Disclaimer (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Direct Contact Cards */}
          <div className="p-6 border-2 border-[var(--border)] bg-[var(--card)] shadow-[4px_4px_0px_0px_var(--shadow-color)] space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-[var(--foreground)] border-b-2 border-[var(--border)] pb-2">
              Direct Contact Channels
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 border-2 border-[var(--border)] bg-[var(--background)] shadow-[2px_2px_0px_0px_var(--shadow-color)]">
                <div className="w-8 h-8 border border-[var(--border)] bg-[var(--primary)] text-[var(--primary-foreground)] flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-[var(--muted-foreground)] block uppercase">Email Support</span>
                  <a href="mailto:darkpearl251103@gmail.com" className="text-xs font-bold text-[var(--foreground)] hover:text-[var(--primary)] underline">
                    darkpearl251103@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 border-2 border-[var(--border)] bg-[var(--background)] shadow-[2px_2px_0px_0px_var(--shadow-color)]">
                <div className="w-8 h-8 border border-[var(--border)] bg-[var(--secondary)] text-[var(--secondary-foreground)] flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-[var(--muted-foreground)] block uppercase">Turnaround Time</span>
                  <p className="text-xs font-bold text-[var(--foreground)]">24–48 Business Hours</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 border-2 border-[var(--border)] bg-[var(--background)] shadow-[2px_2px_0px_0px_var(--shadow-color)]">
                <div className="w-8 h-8 border border-[var(--border)] bg-[var(--accent)] text-[var(--accent-foreground)] flex items-center justify-center shrink-0">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-[var(--muted-foreground)] block uppercase">Civic & Campus Outreach</span>
                  <a href="mailto:darkpearl251103@gmail.com" className="text-xs font-bold text-[var(--foreground)] hover:text-[var(--primary)] underline">
                    darkpearl251103@gmail.com
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Official Government Disclaimer Box */}
          <div className="p-6 border-2 border-[var(--border)] bg-[var(--card)] shadow-[4px_4px_0px_0px_var(--shadow-color)] space-y-3">
            <div className="flex items-center gap-2 text-xs font-black text-[var(--chart-1)] uppercase">
              <AlertCircle className="w-4 h-4 text-[var(--chart-1)]" />
              <span>Looking to File Directly with the Government?</span>
            </div>
            <p className="text-xs text-[var(--muted-foreground)] font-medium leading-relaxed">
              RTI Assist is a drafting and organization platform. Once your application is prepared here, you submit it directly to the designated Public Information Officer (PIO) via speed post, in person, or through the official government web portals:
            </p>
            <div className="pt-2 space-y-2">
              <a
                href="https://rtionline.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2.5 border border-[var(--border)] bg-[var(--background)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] transition text-xs font-bold"
              >
                <span>Central Government RTI Online Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://cic.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2.5 border border-[var(--border)] bg-[var(--background)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] transition text-xs font-bold"
              >
                <span>Central Information Commission (CIC)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Contact;
