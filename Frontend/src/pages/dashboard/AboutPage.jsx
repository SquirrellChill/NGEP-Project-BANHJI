import React from 'react';
import { Info, Sparkles, Target, Users } from 'lucide-react';
import StitchLegalLayout from '../../components/stitch/StitchLegalLayout';
import { useLanguage } from '../../context/LanguageContext';
import '../TermsPolicy.css';

export default function AboutPage() {
  const { language } = useLanguage();
  const isKhmer = language === 'km';

  return (
    <StitchLegalLayout 
      icon={<Info size={25} />} 
      title={isKhmer ? 'អំពី KOTCHOMNOL' : 'About KotChomnol'} 
      updated={isKhmer ? 'ធ្វើបច្ចុប្បន្នភាពចុងក្រោយ៖ កញ្ញា ២០២៦' : 'Last Updated: September 2026'}
    >
      <section className="legal-intro-block">
        <p>
          {isKhmer
            ? 'KotChomnol (កត់ចំណូល) គឺជាវេទិកាកត់ត្រាការលក់ និងគ្រប់គ្រងអាជីវកម្មតាមបែបឌីជីថលឆ្លាតវៃ ដែលជួយដល់ម្ចាស់អាជីវកម្មខ្នាតតូច និងអាជីវករផ្សារកម្ពុជា ក្នុងការកត់ត្រាប្រតិបត្តិការហិរញ្ញវត្ថុយ៉ាងរហ័សតាមរយៈសំឡេង ដោយមិនចាំបាច់កត់ត្រាលើសៀវភៅដោយដៃ។'
            : 'KotChomnol is an intelligent digital sales and business-management platform built to help small-business owners and local vendors in Cambodia record sales instantly using AI voice recognition, eliminating traditional paper bookkeeping.'}
        </p>
      </section>

      <section className="legal-section">
        <h2>
          <Target size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }} />
          {isKhmer ? '១. បេសកកម្មរបស់យើង' : '1. Our Mission'}
        </h2>
        <p>
          {isKhmer
            ? 'បេសកកម្មរបស់យើង គឺធ្វើឱ្យការគ្រប់គ្រងហិរញ្ញវត្ថុកាន់តែមានភាពងាយស្រួល ឆាប់រហ័ស និងមានតម្លាភាពសម្រាប់អាជីវកម្មគ្រប់កម្រិត។ យើងជឿជាក់ថា បច្ចេកវិទ្យា AI គួរតែបម្រើដល់មនុស្សគ្រប់រូប រួមទាំងអាជីវករដែលមិនសូវមានជំនាញបច្ចេកវិទ្យាខ្ពស់។'
            : 'Our mission is to make daily financial tracking seamless, fast, and accessible for businesses of all sizes. We believe AI technology should empower everyday merchants, enabling anyone to maintain clean financial records effortlessly.'}
        </p>
      </section>

      <section className="legal-section">
        <h2>
          <Sparkles size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }} />
          {isKhmer ? '២. ដំណោះស្រាយដែលយើងផ្តល់ជូន' : '2. What We Solve'}
        </h2>
        <ul>
          <li>
            <strong>{isKhmer ? 'កត់ត្រាតាមសំឡេងទាន់ចិត្ត:' : 'Instant Voice Logging:'}</strong>{' '}
            {isKhmer ? 'គ្រាន់តែនិយាយជាភាសាខ្មែរ ឬអង់គ្លេស ប្រព័ន្ធនឹងបម្លែងទៅជាទិន្នន័យការលក់ស្វ័យប្រវត្តិ។' : 'Speak items, prices, and quantities naturally in Khmer or English to create draft invoices in seconds.'}
          </li>
          <li>
            <strong>{isKhmer ? 'គណនារូបិយប័ណ្ណពីរ (KHR & USD):' : 'Dual-Currency Tracking:'}</strong>{' '}
            {isKhmer ? 'គាំទ្រការទូទាត់ទាំងប្រាក់រៀល និងប្រាក់ដុល្លារ ស្របតាមទម្លាប់ទីផ្សារជាក់ស្តែងនៅកម្ពុជា។' : 'Full native support for both Khmer Riel and US Dollars with automatic rate conversion.'}
          </li>
          <li>
            <strong>{isKhmer ? 'ទិដ្ឋភាពទូទៅនៃប្រាក់ចំណេញ:' : 'Live Business Insights:'}</strong>{' '}
            {isKhmer ? 'តាមដានចំណូល ចំណាយ និងតុល្យភាពប្រចាំថ្ងៃយ៉ាងច្បាស់លាស់ គ្រប់ពេលវេលា។' : 'Real-time dashboard analytics highlighting daily revenue, transactions, and sales trends.'}
          </li>
        </ul>
      </section>

      <section className="legal-section">
        <h2>
          <Users size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }} />
          {isKhmer ? '៣. គម្រោង និងកិច្ចសហការ' : '3. Project & Collaboration'}
        </h2>
        <p>
          {isKhmer
            ? 'KotChomnol ត្រូវបានស្រាវជ្រាវ និងអភិវឌ្ឍឡើងក្រោមកម្មវិធីនវានុវត្តន៍ឌីជីថល Next-Gen Engagement Program Batch III (NGEP III) នៅបណ្ឌិត្យសភាបច្ចេកវិទ្យាឌីជីថលកម្ពុជា (CADT) ក្នុងគោលដៅជំរុញសេដ្ឋកិច្ចឌីជីថល និងបរិយាបន្នហិរញ្ញវត្ថុនៅកម្ពុជា។'
            : 'KotChomnol was designed and developed under the digital innovation initiative Next-Gen Engagement Program Batch III (NGEP III) at the Cambodia Academy of Digital Technology (CADT) with the shared vision of accelerating digital economy adoption and financial inclusion across Cambodia.'}
        </p>
      </section>
    </StitchLegalLayout>
  );
}