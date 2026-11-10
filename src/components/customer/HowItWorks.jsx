import React from 'react';
import { 
  Search, 
  UserCheck, 
  FileCheck, 
  ShieldCheck
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function HowItWorks() {
  const { t } = useLanguage();

  const steps = [
    {
      num: t('home.step1Num', '01'),
      icon: Search,
      title: t('home.step1TitleFull', 'Select Service or Symptom'),
      desc: t('home.step1DescFull', 'Choose from our transparent rate card or describe the symptom. No hidden initial callout fees.')
    },
    {
      num: t('home.step2Num', '02'),
      icon: UserCheck,
      title: t('home.step2TitleFull', 'Certified Partner Dispatched'),
      desc: t('home.step2DescFull', 'A background-checked, skill-certified local technician arrives equipped with diagnostic tools.')
    },
    {
      num: t('home.step3Num', '03'),
      icon: FileCheck,
      title: t('home.step3TitleFull', 'Digital Quotation Approval'),
      desc: t('home.step3DescFull', 'If additional replacement parts are required, approve the itemized quote on your screen before work starts.')
    },
    {
      num: t('home.step4Num', '04'),
      icon: ShieldCheck,
      title: t('home.step4TitleFull', 'Verify & Activate Warranty'),
      desc: t('home.step4DescFull', 'Inspect completed work, confirm completion via OTP, and receive your 30-day FixNear warranty certificate.')
    }
  ];

  return (
    <section className="section-spacing" style={{ backgroundColor: '#FFFFFF', borderTop: '1px solid var(--border-light)' }}>
      <div className="container">
        
        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 48px auto' }}>
          <div style={{ display: 'inline-flex', marginBottom: '12px' }}>
            <span className="badge badge-forest">
              {t('home.simple4Step', 'Simple 4-Step Process')}
            </span>
          </div>
          <h2 style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '12px' }}>
            {t('home.howItWorks', 'How FixNear Works')}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15.5px' }}>
            {t('home.howItWorksSubtitle', 'Engineered to eliminate surprise doorstep estimates, low-quality repairs, and unverified service partners.')}
          </p>
        </div>

        {/* Steps Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '24px',
          position: 'relative'
        }}>
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div 
                key={idx}
                style={{
                  padding: '24px',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'var(--bg-warm)',
                  border: '1px solid var(--border-light)',
                  position: 'relative'
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '20px'
                }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    backgroundColor: 'var(--forest-700)',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Icon size={22} />
                  </div>
                  <span style={{
                    fontSize: '28px',
                    fontWeight: 800,
                    color: 'var(--forest-100)',
                    fontFamily: 'var(--font-heading)'
                  }}>
                    {step.num}
                  </span>
                </div>

                <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '8px' }}>
                  {step.title}
                </h3>
                <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
