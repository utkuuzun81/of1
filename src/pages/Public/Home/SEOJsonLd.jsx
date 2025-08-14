import React from 'react';

export default function SEOJsonLd(){
  const org = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Odyostore',
    url: 'https://odyostore.com',
    sameAs: ['https://www.linkedin.com'],
  };
  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      { '@type': 'Question', name: 'Odyostore nedir?', acceptedAnswer: { '@type':'Answer', text: 'İşitme merkezleri için B2B tedarik platformu.' } },
      { '@type': 'Question', name: 'Kayıt nasıl çalışır?', acceptedAnswer: { '@type':'Answer', text: 'İki adımda kayıt ve onay sonrası giriş.' } },
    ]
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(org) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }} />
    </>
  );
}
