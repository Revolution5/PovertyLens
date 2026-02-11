// Create by Marisol Morales 2/4/2026

"use client";
import { useState, useEffect } from 'react';
import { MapPin, Send } from 'lucide-react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isDark, setIsDark] = useState(false);

  // ============== Dark Mode Detection - Listen for theme changes 2/10/2026 ============== //
  useEffect(() => {
    // Check initial theme
    setIsDark(document.documentElement.classList.contains('dark'));

    // Listen for theme changes
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);
  // ============== End Dark Mode Detection ============== //

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the form data to your backend
    console.log('Form submitted:', formData);
    setIsSubmitted(true);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setFormData({ name: '', email: '', subject: '', message: '' });
      setIsSubmitted(false);
    }, 3000);
  };

  return (
    // ============== Marisol Dark Mode: Updated background 2/10/2026 ============== //
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
    {/* ============== Marisol End Dark Mode Background 2/10/2026 ============== */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-16 lg:py-20">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold mb-3">
              <span className="bg-gradient-to-r from-[#FFA239] to-[#FF5656] bg-clip-text text-transparent">
                Get in Touch
              </span>
            </h1>
            {/* ============== Marisol Dark Mode: Updated text color 2/10/2026 ============== */}
            <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--color-gray)' }}>
              Have questions or want to learn more about our mission? We'd love to hear from you.
            </p>
            {/* ============== Marisol End Dark Mode Text 2/10/2026 ============== */}
          </div>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Left side - Contact Information */}
            <div>
              {/* ============== Marisol Dark Mode: Updated heading color 2/10/2026 ============== */}
              <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--foreground)' }}>
                Contact Information
              </h2>
              <p className="mb-8 leading-relaxed" style={{ color: 'var(--color-gray)' }}>
                Reach out to us through any of the following channels. Our team is here to help and will respond to your inquiry as soon as possible.
              </p>
              {/* ============== Marisol End Dark Mode Heading 2/10/2026 ============== */}

              {/* Contact Details - Only Address */}
              <div className="space-y-6 mb-10">
                <div className="flex items-start gap-4">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, rgba(140, 228, 255, 0.2) 0%, rgba(255, 162, 57, 0.2) 100%)' }}
                  >
                    <MapPin size={20} className="text-orange-500" />
                  </div>
                  {/* ============== Marisol Dark Mode: Updated address text colors 2/10/2026 ============== */}
                  <div>
                    <h3 className="font-semibold mb-1" style={{ color: 'var(--foreground)' }}>
                      Address
                    </h3>
                    <p style={{ color: 'var(--color-gray)' }}>
                      1250 N Bellflower Blvd<br />
                      Long Beach, CA 90840<br />
                      United States
                    </p>
                  </div>
                  {/* ============== End Dark Mode Address ============== */}
                </div>
              </div>
            </div>

            {/* Right side - Contact Form */}
            <div>
              {/* ============== Marisol Dark Mode: Updated form container background 2/10/2026 ============== */}
              <div 
                className="p-8 rounded-2xl"
                style={{ 
                  background: isDark 
                    ? 'linear-gradient(135deg, rgba(140, 228, 255, 0.03) 0%, rgba(255, 162, 57, 0.03) 100%)'
                    : 'linear-gradient(135deg, rgba(140, 228, 255, 0.05) 0%, rgba(255, 162, 57, 0.05) 100%)',
                  border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`
                }}
              >
              {/* ============== End Dark Mode Form Container ============== */}
                <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--foreground)' }}>
                  Send us a Message
                </h2>
                
                {isSubmitted ? (
                  <div 
                    className="p-6 rounded-xl text-center"
                    style={{ background: 'linear-gradient(135deg, rgba(140, 228, 255, 0.2) 0%, rgba(255, 162, 57, 0.2) 100%)' }}
                  >
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                      <Send size={28} className="text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
                      Message Sent!
                    </h3>
                    <p style={{ color: 'var(--color-gray)' }}>
                      Thank you for reaching out. We'll get back to you soon.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name Field */}
                    {/* ============== Marisol Dark Mode: Updated form field styles 2/10/2026 ============== */}
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                        style={{
                          backgroundColor: 'var(--background)',
                          borderColor: 'var(--color-gray-light)',
                          color: 'var(--foreground)'
                        }}
                        placeholder="John Doe"
                      />
                    </div>

                    {/* Email Field */}
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                        style={{
                          backgroundColor: 'var(--background)',
                          borderColor: 'var(--color-gray-light)',
                          color: 'var(--foreground)'
                        }}
                        placeholder="john@example.com"
                      />
                    </div>

                    {/* Subject Field */}
                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                        Subject *
                      </label>
                      <select
                        id="subject"
                        name="subject"
                        required
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                        style={{
                          backgroundColor: 'var(--background)',
                          borderColor: 'var(--color-gray-light)',
                          color: 'var(--foreground)'
                        }}
                      >
                        <option value="">Select a subject</option>
                        <option value="general">General Inquiry</option>
                        <option value="donation">Donation Information</option>
                        <option value="volunteer">Volunteer Opportunities</option>
                        <option value="partnership">Partnership</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    {/* Message Field */}
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                        Message *
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        required
                        value={formData.message}
                        onChange={handleChange}
                        rows={5}
                        className="w-full px-4 py-3 rounded-lg border focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all resize-none"
                        style={{
                          backgroundColor: 'var(--background)',
                          borderColor: 'var(--color-gray-light)',
                          color: 'var(--foreground)'
                        }}
                        placeholder="Tell us more about your inquiry..."
                      />
                    </div>
                    {/* ============== End Dark Mode Form Fields ============== */}

                    {/* Submit Button */}
                    <button
                      type="submit"
                      className="w-full py-3 px-6 rounded-lg font-semibold text-white transition-all hover:shadow-lg hover:scale-[1.02] flex items-center justify-center gap-2"
                      style={{ background: 'linear-gradient(135deg, #8CE4FF 0%, #FFA239 100%)' }}
                    >
                      <Send size={18} />
                      Send Message
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}