import React from 'react';
import { AlertTriangle, FileText } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import StitchLegalLayout from '../components/stitch/StitchLegalLayout';
import './TermsPolicy.css';

const termsData = {
  en: [
    {
      title: '1. About KotChomnol',
      content:
        'KotChomnol provides digital tools for small-business owners, including sales and expense recording, voice transaction parsing, summary overviews, and transaction history. KotChomnol is intended to assist with business record-keeping and does not replace professional accounting, tax, legal, or financial advice.',
    },
    {
      title: '2. User Responsibilities',
      content:
        'Users are responsible for providing accurate information, reviewing transactions before confirming, keeping login credentials secure, and using the platform strictly for lawful business purposes.',
    },
    {
      title: '3. Voice and AI Features',
      content:
        'KotChomnol uses voice recognition and AI-assisted processing to extract product names, quantities, and prices. AI-generated or automatically extracted information may contain errors. Users are strictly responsible for reviewing and confirming information before saving it as an official record.',
      hasWarning: true,
    },
    {
      title: '4. Business and Financial Information',
      content:
        'All displayed revenue, expense, and profit summaries are derived strictly from data entered or confirmed by the user. KotChomnol should not be considered a replacement for certified accounting or professional financial services.',
    },
    {
      title: '5. Payments',
      content:
        'Where available, payment functionality may integrate with third-party payment providers. KotChomnol does not guarantee uninterrupted service of external payment processors. Sensitive credentials should only be provided through authorized providers.',
    },
    {
      title: '6. Prohibited Activities',
      content:
        'Users must not use the platform for illegal activities, submit intentionally fraudulent data, reverse engineer or interfere with platform integrity, or upload malicious software.',
    },
    {
      title: '7. Account Security',
      content:
        'Users must maintain the confidentiality of their credentials and notify the KotChomnol team immediately if unauthorized access is suspected. Accounts violating these terms may be suspended or restricted.',
    },
    {
      title: '8. Service Availability',
      content:
        'KotChomnol is provided on an availability basis and may experience scheduled maintenance, updates, or third-party service interruptions. Uninterrupted continuous availability cannot be guaranteed.',
    },
    {
      title: '9. Intellectual Property',
      content:
        'The KotChomnol name, interface, software, design, logos, and original materials belong to the KotChomnol project team. Users may not copy, modify, or commercially exploit these assets without written permission.',
    },
    {
      title: '10. Third-Party Services',
      content:
        'KotChomnol relies on third-party providers for hosting, authentication, AI parsing, and messaging. KotChomnol is not responsible for changes, failures, or policies of these external providers.',
    },
    {
      title: '11. Limitation of Responsibility',
      content:
        'To the extent permitted by law, the KotChomnol team is not liable for business losses resulting from inaccurate user-entered data, incorrect AI extractions, payment gateway disruptions, or compromised user credentials.',
    },
    {
      title: '12. Changes to These Terms',
      content:
        'These Terms of Use may be updated periodically to reflect new features or platform capabilities. Updated terms will be published with an updated "Last Updated" date.',
    },
    {
      title: '13. Contact',
      content:
        'If you have questions or concerns regarding these Terms of Use, please contact the KotChomnol team via the contact details provided in the application or at support@kotchomnol.ai.',
    },
  ],
  km: [
    {
      title: '១. អំពី KotChomnol',
      content:
        'KotChomnol ផ្តល់ឧបករណ៍ឌីជីថលសម្រាប់អាជីវកម្មខ្នាតតូច រួមមានការកត់ត្រាការលក់ ចំណាយ ដំណើរការសំឡេង និងទិដ្ឋភាពទូទៅនៃប្រាក់ចំណេញ។ KotChomnol មានគោលបំណងជួយសម្រួលការកត់ត្រា និងមិនជំនួសឱ្យការប្រឹក្សាផ្នែកគណនេយ្យ ពន្ធដារ ឬច្បាប់វិជ្ជាជីវៈឡើយ។',
    },
    {
      title: '២. ការទទួលខុសត្រូវរបស់អ្នកប្រើប្រាស់',
      content:
        'អ្នកប្រើប្រាស់ត្រូវទទួលខុសត្រូវក្នុងការផ្តល់ព័ត៌មានត្រឹមត្រូវ ពិនិត្យឡើងវិញមុនពេលរក្សាទុក ការពារគណនីឱ្យមានសុវត្ថិភាព និងប្រើប្រាស់វេទិកាស្របតាមច្បាប់។',
    },
    {
      title: '៣. មុខងារសំឡេង និង AI',
      content:
        'KotChomnol ប្រើប្រាស់បច្ចេកវិទ្យាសំឡេង និង AI ដើម្បីទាញយកទិន្នន័យទំនិញ និងតម្លៃ។ ព័ត៌មានដែលបង្កើតដោយ AI អាចមានកំហុសឆ្គង។ អ្នកប្រើប្រាស់មានកាតព្វកិច្ចពិនិត្យផ្ទៀងផ្ទាត់មុនពេលរក្សាទុកជាកំណត់ត្រាផ្លូវការ។',
      hasWarning: true,
    },
    {
      title: '៤. ព័ត៌មានអាជីវកម្ម និងហិរញ្ញវត្ថុ',
      content:
        'តួលេខចំណូល ចំណាយ និងប្រាក់ចំណេញទាំងអស់ គឺផ្អែកលើទិន្នន័យដែលអ្នកប្រើប្រាស់បានបញ្ចូល ឬបញ្ជាក់។ KotChomnol មិនមែនជាការជំនួសសេវាគណនេយ្យអាជីពឡើយ។',
    },
    {
      title: '៥. ការទូទាត់',
      content:
        'ករណីមានមុខងារទូទាត់ KotChomnol អាចភ្ជាប់ជាមួយដៃគូទូទាត់ភាគីទីបី។ យើងមិនធានាលើការរអាក់រអួលនៃប្រព័ន្ធទូទាត់ខាងក្រៅឡើយ ហើយព័ត៌មានកាតសម្ងាត់មិនត្រូវផ្តល់ដោយផ្ទាល់មក KotChomnol នោះទេ។',
    },
    {
      title: '៦. សកម្មភាពដែលត្រូវបានហាមឃាត់',
      content:
        'អ្នកប្រើប្រាស់មិនត្រូវប្រើប្រាស់កម្មវិធីសម្រាប់សកម្មភាពខុសច្បាប់ បញ្ចូលទិន្នន័យក្លែងបន្លំ ឬប៉ុនប៉ងជ្រៀតជ្រែកប្រព័ន្ធ និងកូដរបស់វេទិកាឡើយ។',
    },
    {
      title: '៧. សុវត្ថិភាពគណនី',
      content:
        'អ្នកប្រើប្រាស់ត្រូវរក្សាការសម្ងាត់នៃព័ត៌មានចូលគណនី។ ប្រសិនបើសង្ស័យថាមានការចូលប្រើដោយគ្មានការអនុញ្ញាត សូមជូនដំណឹងមកក្រុមការងារជាបន្ទាន់។',
    },
    {
      title: '៨. ភាពអាចរកបាននៃសេវាកម្ម',
      content:
        'KotChomnol ត្រូវបានផ្តល់ជូនផ្អែកលើភាពអាចប្រើប្រាស់ជាក់ស្តែង ហើយអាចជួបប្រទះការផ្អាកបណ្តោះអាសន្នសម្រាប់ការថែទាំ ឬបញ្ហាបច្ចេកទេស។',
    },
    {
      title: '៩. កម្មសិទ្ធិបញ្ញា',
      content:
        'ឈ្មោះ KotChomnol, ចំណុចប្រទាក់ (Interface), កូដកម្មវិធី, ការរចនា និងនិមិត្តសញ្ញា គឺជាកម្មសិទ្ធិផ្តាច់មុខរបស់ក្រុមការងារ KotChomnol។',
    },
    {
      title: '១០. សេវាកម្មភាគីទីបី',
      content:
        'KotChomnol ពឹងផ្អែកលើសេវាភាគីទីបីសម្រាប់ Hosting, AI និងការផ្ទៀងផ្ទាត់។ យើងមិនទទួលខុសត្រូវចំពោះការប្រែប្រួល ឬការបរាជ័យដែលបណ្តាលមកពីភាគីទីបីឡើយ។',
    },
    {
      title: '១១. ដែនកំណត់នៃការទទួលខុសត្រូវ',
      content:
        'ក្រុមការងារ KotChomnol មិនទទួលខុសត្រូវចំពោះការខាតបង់អាជីវកម្មដែលបណ្តាលមកពីទិន្នន័យបញ្ចូលមិនត្រឹមត្រូវ កំហុសរបស់ AI ឬការបាត់បង់លេខសម្ងាត់គណនីរបស់អ្នកប្រើប្រាស់ឡើយ។',
    },
    {
      title: '១២. ការផ្លាស់ប្តូរលក្ខខណ្ឌប្រើប្រាស់',
      content:
        'លក្ខខណ្ឌប្រើប្រាស់នេះអាចត្រូវបានកែប្រែពេលមានមុខងារថ្មី។ កំណែថ្មីនឹងត្រូវប្រកាសនៅលើវេទិកាជាមួយកាលបរិច្ឆេទ «ធ្វើបច្ចុប្បន្នភាពចុងក្រោយ»។',
    },
    {
      title: '១៣. ទំនាក់ទំនង',
      content:
        'ប្រសិនបើអ្នកមានសំណួរអំពីលក្ខខណ្ឌប្រើប្រាស់នេះ សូមទាក់ទងមកកាន់ក្រុមការងារ KotChomnol តាមរយៈ support@kotchomnol.ai។',
    },
  ],
};

export default function TermsPage() {
  const { language, t } = useLanguage();
  const isKhmer = language === 'km';
  const sections = termsData[language] || termsData.en;

  return (
    <StitchLegalLayout 
      icon={<FileText size={25} />} 
      title={t('termsOfService') || (isKhmer ? 'លក្ខខណ្ឌប្រើប្រាស់' : 'Terms of Use')} 
      updated={isKhmer ? 'ធ្វើបច្ចុប្បន្នភាពចុងក្រោយ៖ កញ្ញា ២០២៦' : 'Last Updated: September 2026'}
    >
      <section className="legal-intro-block">
        <p>
          {isKhmer
            ? 'សូមស្វាគមន៍មកកាន់ KotChomnol។ KotChomnol គឺជាវេទិកាគ្រប់គ្រងការលក់ និងអាជីវកម្មឌីជីថលដែលត្រូវបានរចនាឡើងដើម្បីជួយម្ចាស់អាជីវកម្មខ្នាតតូចកត់ត្រាប្រតិបត្តិការ និងមើលសង្ខេបអាជីវកម្មកាន់តែងាយស្រួល។ ដោយការចូលប្រើប្រាស់ KotChomnol អ្នកយល់ព្រមគោរពតាមលក្ខខណ្ឌប្រើប្រាស់ទាំងនេះ។'
            : 'Welcome to KotChomnol. KotChomnol is a digital sales and business-management platform designed to help small-business owners record transactions, manage sales information, and view business summaries more easily. By accessing or using KotChomnol, you agree to comply with these Terms of Use.'}
        </p>
      </section>

      {sections.map((section, idx) => (
        <section className="legal-section" key={idx}>
          <h2>{section.title}</h2>
          <p>{section.content}</p>
          {section.hasWarning && (
            <div className="legal-callout warning">
              <AlertTriangle size={18} />
              <span>
                <strong>{isKhmer ? 'ការទទួលខុសត្រូវរបស់អ្នកប្រើប្រាស់៖' : 'User Responsibility:'}</strong>{' '}
                {isKhmer
                  ? 'អ្នកប្រើប្រាស់ត្រូវតែពិនិត្យផ្ទៀងផ្ទាត់ព័ត៌មានដែលដកស្រង់ដោយ AI ឱ្យបានហ្មត់ចត់ មុននឹងបញ្ជាក់រក្សាទុកជាកំណត់ត្រាការលក់ផ្លូវការ។'
                  : 'Users are responsible for reviewing and confirming automatically extracted information before saving it as an official transaction record.'}
              </span>
            </div>
          )}
        </section>
      ))}
    </StitchLegalLayout>
  );
}