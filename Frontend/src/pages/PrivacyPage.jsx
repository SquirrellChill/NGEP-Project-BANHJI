import React from 'react';
import { Lock, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import StitchLegalLayout from '../components/stitch/StitchLegalLayout';
import './TermsPolicy.css';

export default function PrivacyPage() {
  const { language, t } = useLanguage();
  const isKhmer = language === 'km';

  return (
    <StitchLegalLayout icon={<ShieldCheck size={25} />} title={t('privacyPolicy')} updated={t('lastUpdated')}>
      <section className="legal-section">
        <h2>{isKhmer ? '១. ព័ត៌មានដែលយើងប្រមូល' : '1. Information We Collect'}</h2>
        <p>
          {isKhmer
            ? 'ដើម្បីផ្តល់ការកត់ត្រាចំណូលឱ្យបានត្រឹមត្រូវ KOTCHOMNOL ប្រមូលព័ត៌មានដូចខាងក្រោម៖'
            : 'To provide accurate bookkeeping, KOTCHOMNOL collects the following information:'}
        </p>
        <ul>
          <li><strong>{isKhmer ? 'ព័ត៌មានគណនី:' : 'Account Information:'}</strong> {isKhmer ? 'ឈ្មោះ អ៊ីមែល និងព័ត៌មានចុះឈ្មោះ។' : 'Name, email address, and account details upon registration.'}</li>
          <li><strong>{isKhmer ? 'ទិន្នន័យសំឡេង:' : 'Voice Data:'}</strong> {isKhmer ? 'សំឡេងដែលថតសម្រាប់ដំណើរការបម្លែងទៅជាការលក់។' : 'Audio inputs recorded during voice-to-sales processing to parse transaction details.'}</li>
          <li><strong>{isKhmer ? 'បញ្ជីហិរញ្ញវត្ថុ:' : 'Financial Ledgers:'}</strong> {isKhmer ? 'ចំនួនប្រាក់ ឈ្មោះទំនិញ ចំនួន និងកាលបរិច្ឆេទក្នុងគណនីរបស់អ្នក។' : 'Transaction amounts, product names, quantities, and dates recorded in your account.'}</li>
        </ul>
      </section>
      <section className="legal-section">
        <h2>{isKhmer ? '២. របៀបដែលយើងប្រើទិន្នន័យ' : '2. How We Use Your Data'}</h2>
        <p>{isKhmer ? 'យើងប្រើទិន្នន័យរបស់អ្នកសម្រាប់ផ្តល់ និងកែលម្អវេទិកា។' : 'We use your data strictly to operationally provide and improve the platform.'}</p>
        <ul>
          <li>{isKhmer ? 'បម្លែងសំឡេងទៅជាទិន្នន័យការលក់។' : 'Transcribing audio clips into structured sales data.'}</li>
          <li>{isKhmer ? 'បង្កើតរបាយការណ៍ចំណូល និងវិភាគអាជីវកម្ម។' : 'Generating business analytics and income reports for your dashboard.'}</li>
          <li>{isKhmer ? 'កែលម្អភាពត្រឹមត្រូវនៃភាសាខ្មែរ និងអង់គ្លេស។' : 'Improving natural language accuracy for Khmer and English terminology.'}</li>
        </ul>
      </section>
      <section className="legal-section">
        <h2>{isKhmer ? '៣. ការគ្រប់គ្រងទិន្នន័យសំឡេង' : '3. Voice Data Handling'}</h2>
        <div className="legal-callout success">
          <Lock size={18} />
          <span>
            {isKhmer
              ? 'ការដំណើរការសំឡេងត្រូវបានការពារ។ សំឡេងត្រូវបានប្រើសម្រាប់ដកស្រង់ការលក់ និងមិនត្រូវបានលក់ទៅឱ្យអ្នកផ្សាយពាណិជ្ជកម្មទេ។'
              : 'Audio processing is protected. Voice recordings are parsed for sales details and are never sold to third-party advertisers.'}
          </span>
        </div>
      </section>
      <section className="legal-section">
        <h2>{isKhmer ? '៤. ការរក្សាទុក និងការពារ' : '4. Data Storage and Protection'}</h2>
        <p>{isKhmer ? 'យើងប្រើការពារទិន្នន័យពេលបញ្ជូន និងរក្សាទុកកំណត់ត្រានៅមូលដ្ឋានទិន្នន័យ។' : 'We use protective controls for data in transit and stored ledger entries.'}</p>
      </section>
      <section className="legal-section">
        <h2>{isKhmer ? '៥. សិទ្ធិរបស់អ្នក' : '5. Your Rights'}</h2>
        <p>{isKhmer ? 'អ្នកអាចចូលមើល កែប្រែ ឬលុបទិន្នន័យគណនី និងប្រតិបត្តិការរបស់អ្នកតាមផ្ទាំងគ្រប់គ្រង។' : 'You can access, edit, or delete your account and transaction data through dashboard settings.'}</p>
      </section>
      <section className="legal-section">
        <h2>{isKhmer ? '៦. ទាក់ទងយើង' : '6. Contact Us'}</h2>
        <p>{isKhmer ? 'សម្រាប់សំណួរអំពីគោលការណ៍ឯកជនភាព សូមទាក់ទង ' : 'For questions about this Privacy Policy, contact '}<strong>support@kotchomnol.ai</strong>.</p>
      </section>
    </StitchLegalLayout>
  );
}
