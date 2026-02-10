// Create by Marisol Morales 2/4/2026

"use client";
import { useState } from 'react';
import { MapPin, Send } from 'lucide-react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

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
    <div className="min-h-screen bg-white">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-16 lg:py-20">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold mb-3">
              <span className="bg-gradient-to-r from-[#FFA239] to-[#FF5656] bg-clip-text text-transparent">
                Get in Touch
              </span>
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Have questions or want to learn more about our mission? We'd love to hear from you.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Left side - Contact Information */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Reach out to us through any of the following channels. Our team is here to help and will respond to your inquiry as soon as possible.
              </p>

              {/* Contact Details - Only Address */}
              <div className="space-y-6 mb-10">
                <div className="flex items-start gap-4">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, rgba(140, 228, 255, 0.2) 0%, rgba(255, 162, 57, 0.2) 100%)' }}
                  >
                    <MapPin size={20} className="text-orange-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Address</h3>
                    <p className="text-gray-600">
                      1250 N Bellflower Blvd<br />
                      Long Beach, CA 90840<br />
                      United States
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Contact Form */}
            <div>
              <div 
                className="p-8 rounded-2xl border border-gray-200"
                style={{ background: 'linear-gradient(135deg, rgba(140, 228, 255, 0.05) 0%, rgba(255, 162, 57, 0.05) 100%)' }}
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>
                
                {isSubmitted ? (
                  <div 
                    className="p-6 rounded-xl text-center"
                    style={{ background: 'linear-gradient(135deg, rgba(140, 228, 255, 0.2) 0%, rgba(255, 162, 57, 0.2) 100%)' }}
                  >
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                      <Send size={28} className="text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Message Sent!</h3>
                    <p className="text-gray-600">
                      Thank you for reaching out. We'll get back to you soon.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name Field */}
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-900 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                        placeholder="John Doe"
                      />
                    </div>

                    {/* Email Field */}
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                        placeholder="john@example.com"
                      />
                    </div>

                    {/* Subject Field */}
                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-900 mb-2">
                        Subject *
                      </label>
                      <select
                        id="subject"
                        name="subject"
                        required
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
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
                      <label htmlFor="message" className="block text-sm font-medium text-gray-900 mb-2">
                        Message *
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        required
                        value={formData.message}
                        onChange={handleChange}
                        rows={5}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all resize-none"
                        placeholder="Tell us more about your inquiry..."
                      />
                    </div>

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