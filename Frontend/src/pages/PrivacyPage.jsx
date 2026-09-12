import React from 'react';
import { AlertTriangle, Lock, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import StitchLegalLayout from '../components/stitch/StitchLegalLayout';
import './TermsPolicy.css';

export default function PrivacyPage() {
  const { language, t } = useLanguage();
  const isKhmer = language === 'km';

  return (
    <StitchLegalLayout 
      icon={<ShieldCheck size={25} />} 
      title={t('privacyPolicy') || (isKhmer ? 'គោលការណ៍ឯកជនភាព' : 'Privacy Policy')} 
      updated={isKhmer ? 'ធ្វើបច្ចុប្បន្នភាពចុងក្រោយ៖ កញ្ញា ២០២៦' : 'Last Updated: September 2026'}
    >
      <section className="legal-intro-block">
        <p>
          {isKhmer
            ? 'KotChomnol គោរពភាពឯកជនរបស់អ្នក និងប្តេជ្ញាការពារព័ត៌មានដែលបានផ្តល់តាមរយៈវេទិកានេះ។ គោលការណ៍ឯកជនភាពនេះពន្យល់ពីព័ត៌មានដែល KotChomnol អាចប្រមូល របៀបដែលវាត្រូវបានប្រើប្រាស់ និងរបៀបដែលវាត្រូវបានការពារ។'
            : 'KotChomnol respects your privacy and is committed to protecting information provided through the platform. This Privacy Policy explains what information KotChomnol may collect, how it may be used, and how it may be protected.'}
        </p>
      </section>

      {/* 1. Information We Collect */}
      <section className="legal-section">
        <h2>{isKhmer ? '១. ព័ត៌មានដែលយើងប្រមូល' : '1. Information We Collect'}</h2>
        <p>
          {isKhmer 
            ? 'អាស្រ័យលើមុខងារដែលអ្នកប្រើ KotChomnol អាចប្រមូលព័ត៌មានដូចខាងក្រោម៖' 
            : 'Depending on the features you use, KotChomnol may collect the following information:'}
        </p>
        <ul>
          <li>
            <strong>{isKhmer ? 'ព័ត៌មានគណនី (Account Information):' : 'Account Information:'}</strong>{' '}
            {isKhmer 
              ? 'ឈ្មោះ, អាសយដ្ឋានអ៊ីមែល, ព័ត៌មានសម្ងាត់ចូលគណនី, ព័ត៌មានផ្ទៀងផ្ទាត់ និងការកំណត់ចំណូលចិត្តរបស់អ្នកប្រើប្រាស់។' 
              : 'Name, email address, account credentials, authentication information, and user preferences.'}
          </li>
          <li>
            <strong>{isKhmer ? 'ព័ត៌មានអាជីវកម្ម (Business Information):' : 'Business Information:'}</strong>{' '}
            {isKhmer 
              ? 'ឈ្មោះអាជីវកម្ម, ព័ត៌មានផលិតផល, កំណត់ត្រាការលក់, ចំនួន, តម្លៃ, ការចំណាយ និងផលបូកប្រតិបត្តិការសរុប។' 
              : 'Business name, product information, sales records, quantities, prices, expenses, and transaction totals.'}
          </li>
          <li>
            <strong>{isKhmer ? 'ការបញ្ចូលសំឡេង (Voice Input):' : 'Voice Input:'}</strong>{' '}
            {isKhmer 
              ? 'ប្រសិនបើអ្នកប្រើមុខងារប្រតិបត្តិការតាមសំឡេង KotChomnol អាចដំណើរការសំឡេងដើម្បីដកស្រង់ព័ត៌មានការលក់ និងជួយបង្កើតកំណត់ត្រាឱ្យកាន់តែមានប្រសិទ្ធភាព។' 
              : 'Audio or speech inputs processed during voice-to-sales features to extract transaction details efficiently.'}
          </li>
          <li>
            <strong>{isKhmer ? 'ព័ត៌មានបច្ចេកទេស (Technical Information):' : 'Technical Information:'}</strong>{' '}
            {isKhmer 
              ? 'ព័ត៌មានឧបករណ៍ ឬកម្មវិធីរុករក (Browser), អាសយដ្ឋាន IP, សកម្មភាពលើកម្មវិធី, កំណត់ត្រាកំហុស (Error logs) និងសុវត្ថិភាព។' 
              : 'Device/browser info, IP address, application activity, error logs, authentication, and security information.'}
          </li>
        </ul>
      </section>

      {/* 2. How We Use Information */}
      <section className="legal-section">
        <h2>{isKhmer ? '២. របៀបដែលយើងប្រើព័ត៌មាន' : '2. How We Use Information'}</h2>
        <p>
          {isKhmer 
            ? 'ព័ត៌មានដែលប្រមូលបានអាចត្រូវបានប្រើប្រាស់សម្រាប់៖' 
            : 'Information collected through KotChomnol may be used to:'}
        </p>
        <ul>
          <li>{isKhmer ? 'បង្កើត និងគ្រប់គ្រងគណនីអ្នកប្រើប្រាស់។' : 'Create and manage user accounts.'}</li>
          <li>{isKhmer ? 'ដំណើរការ និងរក្សាទុកប្រតិបត្តិការលក់។' : 'Process and store transactions and provide sales-management features.'}</li>
          <li>{isKhmer ? 'ដំណើរការការបញ្ចូលសំឡេង និងបង្កើតរបាយការណ៍សង្ខេបអាជីវកម្ម។' : 'Process voice input and generate business summaries.'}</li>
          <li>{isKhmer ? 'កែលម្អមុខងារកម្មវិធី រក្សាសុវត្ថិភាពវេទិកា និងដោះស្រាយបញ្ហាបច្ចេកទេស។' : 'Improve application functionality, maintain platform security, detect/prevent misuse, and troubleshoot technical problems.'}</li>
        </ul>
        <p className="legal-note">
          {isKhmer
            ? 'KotChomnol មិនប្រើប្រាស់ព័ត៌មានអាជីវកម្មសម្រាប់គោលបំណងដែលមិនទាក់ទងនឹងមុខងារកម្មវិធីដោយគ្មានការអនុញ្ញាតឡើយ។'
            : 'KotChomnol does not use business information for purposes unrelated to the application’s functionality without appropriate authorization.'}
        </p>
      </section>

      {/* 3. AI Processing */}
      <section className="legal-section">
        <h2>{isKhmer ? '៣. ការដំណើរការដោយបញ្ញាសិប្បនិម្មិត (AI Processing)' : '3. AI Processing'}</h2>
        <p>
          {isKhmer
            ? 'KotChomnol អាចប្រើប្រាស់សេវាកម្មបញ្ញាសិប្បនិម្មិត (AI) ឬ Machine Learning ដើម្បីដំណើរការសំឡេង និងកំណត់អត្តសញ្ញាណឈ្មោះទំនិញ ចំនួន តម្លៃ និងចំនួនទឹកប្រាក់សរុប។'
            : 'KotChomnol may use artificial intelligence or machine-learning services to process voice input to identify product names, quantities, prices, and total amounts.'}
        </p>
        <div className="legal-callout warning">
          <AlertTriangle size={18} />
          <span>
            {isKhmer
              ? 'ការដំណើរការដោយ AI អាចបង្កើតលទ្ធផលមិនត្រឹមត្រូវម្តងម្កាល។ អ្នកប្រើប្រាស់គួរតែពិនិត្យឡើងវិញនូវព័ត៌មានដែលបានដកស្រង់មុនពេលបញ្ជាក់ប្រតិបត្តិការ។'
              : 'AI processing may produce inaccurate results. Users should review the extracted information before confirming a transaction.'}
          </span>
        </div>
      </section>

      {/* 4. Payment Information */}
      <section className="legal-section">
        <h2>{isKhmer ? '៤. ព័ត៌មានការទូទាត់' : '4. Payment Information'}</h2>
        <p>
          {isKhmer
            ? 'នៅពេលដែល KotChomnol ផ្តល់មុខងារទូទាត់តាមរយៈដៃគូផ្តល់សេវាទូទាត់ភាគីទីបី ការទូទាត់នឹងត្រូវចាត់ចែងដោយអ្នកផ្តល់សេវានោះ។ KotChomnol មិនតម្រូវឱ្យអ្នកប្រើប្រាស់ផ្តល់ព័ត៌មានសម្ងាត់ទូទាត់ដោយផ្ទាល់ឡើយ។'
            : 'When KotChomnol provides payment functionality through a third-party payment provider, processing is handled by that provider. KotChomnol does not require users to provide sensitive payment credentials directly.'}
        </p>
      </section>

      {/* 5. How We Protect Information */}
      <section className="legal-section">
        <h2>{isKhmer ? '៥. របៀបដែលយើងការពារព័ត៌មាន' : '5. How We Protect Information'}</h2>
        <p>
          {isKhmer
            ? 'KotChomnol ប្រើប្រាស់វិធានការបច្ចេកទេស និងការរៀបចំសមស្រប ដើម្បីការពារព័ត៌មានពីការចូលប្រើប្រាស់ដោយគ្មានការអនុញ្ញាត ការបាត់បង់ ឬការប្រើប្រាស់ខុស។ ទោះជាយ៉ាងណា គ្មានប្រព័ន្ធលើអ៊ីនធឺណិតណាដែលអាចធានាសុវត្ថិភាពបាន ១០០% នោះទេ។'
            : 'KotChomnol uses reasonable technical and organizational measures to protect user information from unauthorized access, modification, loss, misuse, or disclosure. However, no online system can guarantee complete security.'}
        </p>
      </section>

      {/* 6. Information Sharing */}
      <section className="legal-section">
        <h2>{isKhmer ? '៦. ការចែករំលែកព័ត៌មាន' : '6. Information Sharing'}</h2>
        <p>
          {isKhmer
            ? 'យើងអាចចែករំលែកព័ត៌មានជាមួយអ្នកផ្តល់សេវាភាគីទីបី លុះត្រាតែចាំបាច់ដើម្បីផ្តល់មុខងារជាក់លាក់ (ដូចជា ការផ្ទៀងផ្ទាត់, ការដំណើរការ AI, ការទូទាត់, Hosting ឬការផ្ញើសារជូនដំណឹង)។'
            : 'We may share information with third-party service providers only when necessary to provide specific functionality, such as authentication, AI processing, payment processing, hosting, or notification services.'}
        </p>
        <div className="legal-callout success">
          <Lock size={18} />
          <span>
            {isKhmer
              ? 'KotChomnol មិនលក់ព័ត៌មានផ្ទាល់ខ្លួនរបស់អ្នកប្រើប្រាស់ជាដាច់ខាត។'
              : 'KotChomnol does not sell users’ personal information.'}
          </span>
        </div>
      </section>

      {/* 7. Data Retention */}
      <section className="legal-section">
        <h2>{isKhmer ? '៧. ការរក្សាទុកទិន្នន័យ' : '7. Data Retention'}</h2>
        <p>
          {isKhmer
            ? 'KotChomnol អាចរក្សាទុកព័ត៌មានគណនី និងប្រតិបត្តិការក្នុងរយៈពេលចាំបាច់ដើម្បីផ្តល់សេវាកម្ម និងរក្សាកំណត់ត្រាត្រឹមត្រូវ ផ្អែកលើតម្រូវការបច្ចេកទេសនៃប្រព័ន្ធ។'
            : 'KotChomnol may retain account and transaction information for as long as necessary to provide application services and maintain appropriate records.'}
        </p>
      </section>

      {/* 8. User Rights */}
      <section className="legal-section">
        <h2>{isKhmer ? '៨. សិទ្ធិរបស់អ្នកប្រើប្រាស់' : '8. User Rights'}</h2>
        <p>
          {isKhmer
            ? 'អ្នកប្រើប្រាស់អាចស្នើសុំចូលមើល កែប្រែព័ត៌មានដែលមិនត្រឹមត្រូវ ឬស្នើសុំលុបគណនី និងព័ត៌មានរបស់ពួកគេតាមរយៈការទាក់ទងមកកាន់ក្រុមការងារ។'
            : 'Users may request to access their personal information, correct inaccurate information, or request deletion of their account or records.'}
        </p>
      </section>

      {/* 9. Children's Privacy */}
      <section className="legal-section">
        <h2>{isKhmer ? '៩. ឯកជនភាពកុមារ' : '9. Children’s Privacy'}</h2>
        <p>
          {isKhmer
            ? 'KotChomnol ត្រូវបានរចនាឡើងសម្រាប់អ្នកប្រើប្រាស់អាជីវកម្ម និងមិនត្រូវបានរៀបចំឡើងជាពិសេសសម្រាប់កុមារឡើយ។ យើងមិនប្រមូលព័ត៌មានផ្ទាល់ខ្លួនពីកុមារដោយដឹងនោះទេ។'
            : 'KotChomnol is intended for business users and is not specifically designed for children. We do not knowingly collect personal information from children.'}
        </p>
      </section>

      {/* 10. Third-Party Services */}
      <section className="legal-section">
        <h2>{isKhmer ? '១០. សេវាកម្មភាគីទីបី' : '10. Third-Party Services'}</h2>
        <p>
          {isKhmer
            ? 'KotChomnol អាចមានការតភ្ជាប់ជាមួយសេវាភាគីទីបី។ សេវាកម្មទាំងនោះអាចប្រមូលទិន្នន័យស្របតាមគោលការណ៍ឯកជនភាពផ្ទាល់ខ្លួនរបស់ពួកគេ។'
            : 'KotChomnol may integrate with third-party services. Those services collect or process information according to their own privacy policies.'}
        </p>
      </section>

      {/* 11. Changes to This Privacy Policy */}
      <section className="legal-section">
        <h2>{isKhmer ? '១១. ការផ្លាស់ប្តូរគោលការណ៍ឯកជនភាព' : '11. Changes to This Privacy Policy'}</h2>
        <p>
          {isKhmer
            ? 'គោលការណ៍នេះអាចត្រូវបានធ្វើបច្ចុប្បន្នភាពនៅពេលមានមុខងារថ្មី ឬការកែប្រែប្រព័ន្ធ។ កំណែដែលបានកែប្រែនឹងបង្ហាញកាលបរិច្ឆេទ «ធ្វើបច្ចុប្បន្នភាពចុងក្រោយ»។'
            : 'This Privacy Policy may be updated when KotChomnol introduces new features or integrations. Updated versions will include a revised "Last Updated" date.'}
        </p>
      </section>

      {/* 12. Contact Us */}
      <section className="legal-section">
        <h2>{isKhmer ? '១២. ទំនាក់ទំនងយើងខ្ញុំ' : '12. Contact Us'}</h2>
        <p>
          {isKhmer
            ? 'ប្រសិនបើអ្នកមានសំណួរអំពីគោលការណ៍ឯកជនភាពនេះ សូមទាក់ទងមកកាន់ក្រុមការងារគម្រោង KotChomnol តាមរយៈព័ត៌មានទំនាក់ទំនងក្នុងកម្មវិធី ឬអ៊ីមែល៖ '
            : 'If you have questions about this Privacy Policy, please contact the KotChomnol project team through the application or via: '}
          <strong>support@kotchomnol.ai</strong>.
        </p>
      </section>
    </StitchLegalLayout>
  );
}