import React from 'react';
import { AlertTriangle, FileText } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import StitchLegalLayout from '../components/stitch/StitchLegalLayout';
import './TermsPolicy.css';

const termsContent = {
  en: [
    ['1. Acceptance of Terms', 'By accessing or using KOTCHOMNOL, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform.'],
    ['2. Description of Service', 'KOTCHOMNOL provides an AI-powered voice bookkeeping assistant that transcribes spoken store transactions into financial ledgers.'],
    ['3. AI Processing & Accuracy Disclaimer', 'While our AI strives for high accuracy in processing natural language and currency values, audio clarity and accent variations can impact results.'],
    ['4. Account Security', 'You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account.'],
    ['5. Service Modifications & Termination', 'We reserve the right to modify or discontinue any part of the Service at any time with prior notice when possible.'],
    ['6. Limitation of Liability', 'KOTCHOMNOL shall not be liable for financial discrepancies, unconfirmed manual entries, or indirect business losses arising from the use of the platform.'],
  ],
  km: [
    ['១. ការយល់ព្រមលក្ខខណ្ឌ', 'ដោយចូលប្រើ ឬប្រើប្រាស់ KOTCHOMNOL អ្នកយល់ព្រមគោរពតាមលក្ខខណ្ឌសេវាកម្មនេះ។ ប្រសិនបើអ្នកមិនយល់ព្រម សូមកុំប្រើវេទិកានេះ។'],
    ['២. ការពិពណ៌នាសេវាកម្ម', 'KOTCHOMNOL ផ្តល់ជំនួយការកត់ត្រាចំណូលដោយ AI ដែលបម្លែងប្រតិបត្តិការហាងពីសំឡេងទៅជាបញ្ជីហិរញ្ញវត្ថុ។'],
    ['៣. ការដំណើរការ AI និងភាពត្រឹមត្រូវ', 'AI របស់យើងខិតខំឱ្យត្រឹមត្រូវខ្ពស់ ប៉ុន្តែគុណភាពសំឡេង និងការបញ្ចេញសំឡេងអាចប៉ះពាល់ដល់លទ្ធផល។'],
    ['៤. សុវត្ថិភាពគណនី', 'អ្នកទទួលខុសត្រូវក្នុងការរក្សាព័ត៌មានចូលគណនី និងសកម្មភាពទាំងអស់ក្រោមគណនីរបស់អ្នក។'],
    ['៥. ការកែប្រែ និងបញ្ចប់សេវាកម្ម', 'យើងអាចកែប្រែ ឬបញ្ឈប់ផ្នែកណាមួយនៃសេវាកម្ម នៅពេលណាក៏បាន ដោយជូនដំណឹងមុននៅពេលអាចធ្វើបាន។'],
    ['៦. ដែនកំណត់ការទទួលខុសត្រូវ', 'KOTCHOMNOL មិនទទួលខុសត្រូវចំពោះភាពខុសគ្នាផ្នែកហិរញ្ញវត្ថុ ការបញ្ចូលដោយដៃដែលមិនបានបញ្ជាក់ ឬការខាតបង់អាជីវកម្មដោយប្រយោលពីការប្រើវេទិកានេះទេ។'],
  ],
};

export default function TermsPage() {
  const { language, t } = useLanguage();
  const sections = termsContent[language] || termsContent.en;

  return (
    <StitchLegalLayout icon={<FileText size={25} />} title={t('termsOfService')} updated={t('lastUpdated')}>
      {sections.map(([title, body], index) => (
        <section className="legal-section" key={title}>
          <h2>{title}</h2>
          <p>{body}</p>
          {index === 2 && (
            <div className="legal-callout warning">
              <AlertTriangle size={18} />
              <span>
                <strong>{language === 'km' ? 'ការទទួលខុសត្រូវរបស់អ្នកប្រើ:' : 'User Responsibility:'}</strong>{' '}
                {language === 'km'
                  ? 'អ្នកប្រើត្រូវពិនិត្យ និងបញ្ជាក់ចំនួនប្រាក់ដែលបានដកស្រង់ មុនរក្សាទុកជាកំណត់ត្រាផ្លូវការ។'
                  : 'Users are responsible for reviewing and confirming extracted amounts before saving transactions to their official records.'}
              </span>
            </div>
          )}
        </section>
      ))}
    </StitchLegalLayout>
  );
}
