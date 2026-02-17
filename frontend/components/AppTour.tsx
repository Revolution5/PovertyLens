// Started by Marisol over winter break 2026 

// Fully completed by Marisol on 2/11/2026


// Did over winter Break start - Marisol Code
"use client"
import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface TourStep {
  target: string;
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

const tourSteps: TourStep[] = [
  {
    target: '[data-tour="welcome"]',
    title: 'Welcome to PovertyLens!',
    description: 'Your gateway to understanding and fighting poverty through real stories, live data, and interactive tools.',
    position: 'bottom'
  },
  {
    target: '[data-tour="mission"]',
    title: 'Our Mission',
    description: 'Learn how we bridge the gap in understanding global poverty by transforming complex data into meaningful insights.',
    position: 'right'
  },
  {
    target: '[data-tour="tour-button"]',
    title: 'Take the Tour Anytime',
    description: 'You can always restart this tour by clicking this button. After signing up, explore more features on your dashboard!',
    position: 'bottom'
  },
  {
    target: '[data-tour="daily-fact"]',
    title: 'Daily Facts',
    description: 'Discover new insights about poverty every day. Sign up to get personalized content and track your impact!',
    position: 'bottom'
  }
];
// End of Winter Break code - Marisol Code

// Any code from this point forward was created on the week of 2/8/2025 to 2/14/2026
// All is Marisol Morales Code
interface AppTourProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AppTour({ isOpen, onClose }: AppTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightPosition, setHighlightPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Dark mode detection - Added by Marisol for Dark Mode 2/8/2026
    setIsDark(document.documentElement.classList.contains('dark'));
    
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, []);
    // End of Marisol's Dark Mode code - 2/8/2026
  useEffect(() => {
    if (!isOpen) return;

    const updatePositions = () => {
      const step = tourSteps[currentStep];
      const element = document.querySelector(step.target);
      
      if (element) {
        const rect = element.getBoundingClientRect();
        const padding = 8;
        
        setHighlightPosition({
          top: rect.top - padding,
          left: rect.left - padding,
          width: rect.width + padding * 2,
          height: rect.height + padding * 2
        });

        // Calculate tooltip position based on step position
        let tooltipTop = 0;
        let tooltipLeft = 0;
        const tooltipWidth = 384; // max-w-sm = 384px
        const tooltipHeight = 250; // approximate height
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const margin = 20; // margin from viewport edge

        switch (step.position) {
          case 'bottom':
            tooltipTop = rect.bottom + 20;
            tooltipLeft = rect.left + rect.width / 2;
            break;
          case 'top':
            tooltipTop = rect.top - tooltipHeight - 20;
            tooltipLeft = rect.left + rect.width / 2;
            break;
          case 'right':
            tooltipTop = rect.top + rect.height / 2;
            tooltipLeft = rect.right + 20;
            break;
          case 'left':
            tooltipTop = rect.top + rect.height / 2;
            tooltipLeft = rect.left - tooltipWidth - 20;
            break;
        }

        // Adjust horizontal position to stay within viewport
        if (step.position === 'bottom' || step.position === 'top') {
          // Center-aligned tooltips
          const halfWidth = tooltipWidth / 2;
          if (tooltipLeft - halfWidth < margin) {
            tooltipLeft = halfWidth + margin;
          } else if (tooltipLeft + halfWidth > viewportWidth - margin) {
            tooltipLeft = viewportWidth - halfWidth - margin;
          }
        } else if (step.position === 'right') {
          // Right-aligned tooltips
          if (tooltipLeft + tooltipWidth > viewportWidth - margin) {
            tooltipLeft = rect.left - tooltipWidth - 20; // Flip to left side
          }
        }

        // Adjust vertical position to stay within viewport
        if (step.position === 'left' || step.position === 'right') {
          // Vertically centered tooltips
          const halfHeight = tooltipHeight / 2;
          if (tooltipTop - halfHeight < margin) {
            tooltipTop = halfHeight + margin;
          } else if (tooltipTop + halfHeight > viewportHeight - margin) {
            tooltipTop = viewportHeight - halfHeight - margin;
          }
        } else if (step.position === 'bottom') {
          // Bottom-aligned tooltips
          if (tooltipTop + tooltipHeight > viewportHeight - margin) {
            tooltipTop = rect.top - tooltipHeight - 20; // Flip to top
          }
        } else if (step.position === 'top') {
          // Top-aligned tooltips
          if (tooltipTop < margin) {
            tooltipTop = rect.bottom + 20; // Flip to bottom
          }
        }

        setTooltipPosition({ top: tooltipTop, left: tooltipLeft });

        // Scroll element into view with some padding
        const elementTop = element.getBoundingClientRect().top + window.scrollY;
        const offset = window.innerHeight / 2 - rect.height / 2;
        window.scrollTo({
          top: elementTop - offset,
          behavior: 'smooth'
        });
      }
    };

    updatePositions();
    // Small delay to ensure elements are rendered
    const timer = setTimeout(updatePositions, 100);
    
    window.addEventListener('resize', updatePositions);
    window.addEventListener('scroll', updatePositions);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updatePositions);
      window.removeEventListener('scroll', updatePositions);
    };
  }, [currentStep, isOpen]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const step = tourSteps[currentStep];

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 z-[9998]" 
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }} 
        onClick={onClose}
      />
      
      {/* Highlight cutout */}
      <div
        className="fixed z-[9999] pointer-events-none transition-all duration-300 ease-in-out"
        style={{
          top: `${highlightPosition.top}px`,
          left: `${highlightPosition.left}px`,
          width: `${highlightPosition.width}px`,
          height: `${highlightPosition.height}px`,
          boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5), 0 0 0 3px #FFA239',
          borderRadius: '8px'
        }}
      />

      {/* Tooltip */}
      <div
        className="fixed z-[10000] rounded-lg shadow-xl p-6 transition-all duration-300 ease-in-out pointer-events-auto"
        style={{
          top: `${tooltipPosition.top}px`,
          left: `${tooltipPosition.left}px`,
          maxWidth: '384px',
          width: '90vw',
          maxHeight: '80vh',
          overflowY: 'auto',
          backgroundColor: 'var(--background)',
          border: `2px solid ${isDark ? 'rgba(255, 162, 57, 0.5)' : '#FFA239'}`,
          transform: step.position === 'bottom' || step.position === 'top' 
            ? 'translateX(-50%)' 
            : step.position === 'right' 
            ? 'translateY(-50%)' 
            : 'translate(-100%, -50%)'
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 transition-colors hover:scale-110"
          style={{ color: 'var(--color-gray)' }}
        >
          <X className="w-5 h-5" />
        </button>

        <h3 
          className="text-lg font-semibold mb-2 pr-6"
          style={{ color: 'var(--foreground)' }}
        >
          {step.title}
        </h3>
        <p 
          className="text-sm mb-4"
          style={{ color: 'var(--color-gray-dark)' }}
        >
          {step.description}
        </p>

        <div className="flex items-center justify-between">
          <div 
            className="text-xs"
            style={{ color: 'var(--color-gray)' }}
          >
            Step {currentStep + 1} of {tourSteps.length}
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="px-3 py-2 text-sm rounded-lg font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"
              style={{
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                color: 'var(--foreground)',
                border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'}`
              }}
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
            <button
              onClick={handleNext}
              className="px-3 py-2 text-sm rounded-lg font-medium text-white transition-all hover:opacity-90 flex items-center gap-1"
              style={{
                background: 'linear-gradient(135deg, #FFA239 0%, #FF5656 100%)'
              }}
            >
              {currentStep === tourSteps.length - 1 ? 'Finish' : 'Next'}
              {currentStep < tourSteps.length - 1 && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}