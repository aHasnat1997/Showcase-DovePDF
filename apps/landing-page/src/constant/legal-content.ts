export type LegalBlock =
  | { type: "paragraph"; text: string }
  | { type: "list"; intro?: string; items: string[] }
  | {
      type: "callout";
      variant: "info" | "warning";
      title?: string;
      text: string;
    }
  | {
      type: "contact";
      items: { label: string; value: string; href?: string }[];
    };

export interface LegalSection {
  id: string;
  title: string;
  tocLabel?: string;
  blocks: LegalBlock[];
}

export interface LegalDocumentData {
  badge: string;
  title: string;
  lastUpdated: string;
  intro: string;
  shortVersion?: string;
  sections: LegalSection[];
}

export const termsCondition: LegalDocumentData = {
  badge: "📋 Legal Document",
  title: "Terms of Service",
  lastUpdated: "August 3, 2026",
  intro: "Please read these terms carefully before using AcmePDF.",
  shortVersion:
    "Use AcmePDF only for lawful purposes. Don't upload files that contain malware or that you don't have permission to process. We provide the service \"as is\" with no guarantees. We may change or discontinue the service at any time.",
  sections: [
    {
      id: "acceptance",
      title: "Acceptance of Terms",
      blocks: [
        {
          type: "paragraph",
          text: 'By accessing or using AcmePDF at <strong class="text-slate-700">acmepdf.com</strong> (the "Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use the Service.',
        },
        {
          type: "paragraph",
          text: "These Terms apply to all visitors, users, and anyone else who accesses or uses the Service. By using AcmePDF, you represent that you are at least 13 years of age (or 16 years of age if you are located in the EU) and that you have the legal capacity to enter into these Terms.",
        },
      ],
    },
    {
      id: "description",
      title: "Description of Service",
      blocks: [
        {
          type: "paragraph",
          text: "AcmePDF provides a set of free, browser-based tools that allow you to edit, merge, compress, and convert PDF files and other document formats. The core tools are provided at no cost. We may introduce optional premium features in the future, which will be subject to separate terms and pricing.",
        },
        {
          type: "paragraph",
          text: "Our tools are designed to be used directly in your web browser without the need to download or install software. Processing may occur either entirely within your browser (client-side) or on our servers (server-side), depending on the specific operation.",
        },
      ],
    },
    {
      id: "acceptable-use",
      title: "Acceptable Use",
      blocks: [
        {
          type: "paragraph",
          text: "You agree to use AcmePDF only for lawful purposes and in a way that does not infringe the rights of others or restrict or inhibit anyone else's use and enjoyment of the Service.",
        },
        {
          type: "list",
          intro: "You must not use AcmePDF to:",
          items: [
            "Upload, process, or distribute files that contain malware, viruses, trojan horses, ransomware, or any other malicious or harmful code",
            "Process files that contain, display, or distribute illegal content, including but not limited to child sexual abuse material (CSAM)",
            "Process documents that you do not have the legal right or permission to access, edit, or redistribute",
            "Infringe any copyright, trademark, patent, trade secret, or other intellectual property rights of any person or entity",
            "Violate any applicable local, national, or international law or regulation",
            "Attempt to gain unauthorised access to our systems, servers, or networks",
            "Use automated scripts, bots, or scrapers to access or use the Service in a manner that places an excessive or disproportionate load on our infrastructure",
            "Misrepresent your identity or impersonate any person or entity",
            "Engage in any activity that disrupts, damages, or interferes with the proper working of the Service",
          ],
        },
        {
          type: "paragraph",
          text: "We reserve the right to suspend or terminate access to the Service for any user who violates these rules, without prior notice.",
        },
      ],
    },
    {
      id: "your-files",
      title: "Your Files and Content",
      blocks: [
        {
          type: "paragraph",
          text: "You retain all ownership rights to the files and documents you upload to AcmePDF. We do not claim any ownership over your content.",
        },
        {
          type: "list",
          intro:
            "By uploading a file to the Service, you represent and warrant that:",
          items: [
            "You own the file, or you have the express permission of the owner to process it using our tools",
            "Processing the file through AcmePDF does not violate any third-party rights, including copyright, privacy, or confidentiality obligations",
            "The file does not contain illegal content or malicious code",
          ],
        },
        {
          type: "callout",
          variant: "warning",
          title: "Confidential documents",
          text: "While we take reasonable technical measures to protect your files during processing and delete them immediately after, we strongly advise against uploading highly sensitive or confidential documents (such as legal contracts, financial statements, or medical records) unless you are comfortable with the associated risks of internet transmission.",
        },
        {
          type: "paragraph",
          text: "You grant AcmePDF a limited, temporary, non-exclusive licence to access, process, and transmit your files solely for the purpose of providing the requested tool operation. This licence terminates automatically when the file is deleted from our servers.",
        },
      ],
    },
    {
      id: "intellectual-property",
      title: "Intellectual Property",
      blocks: [
        {
          type: "paragraph",
          text: "The AcmePDF website, including its design, layout, logos, text, graphics, software, and all other content (excluding user-uploaded files), is the property of AcmePDF and is protected by copyright, trademark, and other intellectual property laws.",
        },
        {
          type: "list",
          intro:
            "You may not reproduce, distribute, modify, create derivative works of, publicly display, publicly perform, republish, download, store, or transmit any of the material on our website without our prior written consent, except as follows:",
          items: [
            "Your computer may temporarily store copies of such materials in RAM incidental to your accessing and viewing those materials",
            "You may store files that are automatically cached by your web browser for display enhancement purposes",
          ],
        },
        {
          type: "paragraph",
          text: "All third-party trademarks, service marks, logos, and trade names mentioned on AcmePDF are the property of their respective owners.",
        },
      ],
    },
    {
      id: "third-party",
      title: "Third-Party Services and Advertising",
      tocLabel: "Third-Party Services and Ads",
      blocks: [
        {
          type: "paragraph",
          text: "AcmePDF uses third-party services including Google Analytics, Google Tag Manager, Google AdSense, and Statcounter. Your use of AcmePDF is also subject to the terms and privacy policies of these third parties.",
        },
        {
          type: "paragraph",
          text: "We display advertisements served by Google AdSense. These ads help fund the free tools we provide. We do not control the content of these advertisements. Any interaction you have with an advertised product or service is between you and the advertiser — AcmePDF is not responsible for any goods, services, or content advertised on the site.",
        },
        {
          type: "paragraph",
          text: "AcmePDF may contain links to third-party websites. These links are provided for your convenience only. We have no control over the contents of those sites and accept no responsibility for them or for any loss or damage that may arise from your use of them.",
        },
      ],
    },
    {
      id: "disclaimer",
      title: "Disclaimer of Warranties",
      blocks: [
        {
          type: "callout",
          variant: "warning",
          text: 'AcmePDF is provided on an "as is" and "as available" basis, without any warranties of any kind, either express or implied.',
        },
        {
          type: "paragraph",
          text: "To the fullest extent permitted by applicable law, AcmePDF expressly disclaims all warranties, whether express, implied, statutory, or otherwise, including but not limited to:",
        },
        {
          type: "list",
          items: [
            "Implied warranties of merchantability, fitness for a particular purpose, and non-infringement",
            "Warranties that the Service will be uninterrupted, timely, secure, or error-free",
            "Warranties that the results obtained from using the Service will be accurate, reliable, or complete",
            "Warranties that any errors in the Service will be corrected",
          ],
        },
        {
          type: "paragraph",
          text: "No advice or information, whether oral or written, obtained from AcmePDF or through the Service will create any warranty not expressly stated in these Terms.",
        },
      ],
    },
    {
      id: "liability",
      title: "Limitation of Liability",
      blocks: [
        {
          type: "paragraph",
          text: "To the fullest extent permitted by applicable law, in no event shall AcmePDF, its operators, directors, employees, agents, or licensors be liable for any indirect, incidental, special, consequential, punitive, or exemplary damages, including but not limited to:",
        },
        {
          type: "list",
          items: [
            "Loss of profits, revenue, or data",
            "Loss or corruption of files or documents processed through the Service",
            "Business interruption",
            "Cost of procurement of substitute services",
            "Any damages arising from unauthorised access to or alteration of your files",
          ],
        },
        {
          type: "paragraph",
          text: "These limitations apply regardless of the legal theory under which such damages are sought (contract, tort, negligence, strict liability, or otherwise), even if AcmePDF has been advised of the possibility of such damages.",
        },
        {
          type: "paragraph",
          text: "In jurisdictions that do not allow the exclusion or limitation of incidental or consequential damages, our liability shall be limited to the maximum extent permitted by law.",
        },
      ],
    },
    {
      id: "availability",
      title: "Service Availability",
      blocks: [
        {
          type: "paragraph",
          text: "We aim to keep AcmePDF available and operational at all times, but we cannot guarantee uninterrupted access. The Service may be temporarily unavailable due to scheduled maintenance, unplanned outages, or factors outside our control such as network failures or force majeure events.",
        },
        {
          type: "paragraph",
          text: "We reserve the right to modify, suspend, or discontinue the Service (or any part of it) at any time and without prior notice. We will not be liable to you or to any third party for any modification, suspension, or discontinuance of the Service.",
        },
      ],
    },
    {
      id: "termination",
      title: "Termination",
      blocks: [
        {
          type: "paragraph",
          text: "We may, at our sole discretion, suspend or terminate your access to the Service at any time and for any reason, including if we believe you have violated these Terms. Upon termination, your right to use the Service will immediately cease.",
        },
        {
          type: "paragraph",
          text: "Since AcmePDF does not require account creation, termination in practice means restricting access from your IP address or device. All provisions of these Terms that by their nature should survive termination shall survive, including but not limited to the disclaimer of warranties, limitation of liability, and governing law sections.",
        },
      ],
    },
    {
      id: "governing-law",
      title: "Governing Law and Dispute Resolution",
      tocLabel: "Governing Law",
      blocks: [
        {
          type: "paragraph",
          text: "These Terms shall be governed by and construed in accordance with the laws applicable in the jurisdiction where AcmePDF is operated, without regard to its conflict of law principles.",
        },
        {
          type: "paragraph",
          text: "Any dispute, claim, or controversy arising out of or relating to these Terms or the use of the Service shall first be attempted to be resolved through good-faith negotiation. If that is not successful, disputes shall be submitted to binding arbitration or the courts of the applicable jurisdiction, as permitted by law.",
        },
        {
          type: "paragraph",
          text: "If you are a consumer resident in the European Union, you may also have the right to bring a claim in the courts of the EU member state in which you reside.",
        },
      ],
    },
    {
      id: "changes",
      title: "Changes to These Terms",
      blocks: [
        {
          type: "paragraph",
          text: 'We may revise these Terms from time to time. When we do, we will update the "Last updated" date at the top of this page. The revised Terms will take effect immediately upon being posted.',
        },
        {
          type: "paragraph",
          text: "Your continued use of AcmePDF after any changes are posted constitutes your acceptance of the new Terms. If you do not agree with the updated Terms, you should stop using the Service.",
        },
        {
          type: "paragraph",
          text: "We recommend checking this page periodically to stay informed of any updates.",
        },
      ],
    },
    {
      id: "contact",
      title: "Contact Us",
      blocks: [
        {
          type: "paragraph",
          text: "If you have any questions about these Terms of Service, or if you need to report a violation or have a legal enquiry, please contact us:",
        },
        {
          type: "contact",
          items: [
            {
              label: "Email",
              value: "legal@example.com",
              href: "mailto:legal@example.com",
            },
            {
              label: "Website",
              value: "acmepdf.com",
              href: "https://acmepdf.com",
            },
          ],
        },
        {
          type: "paragraph",
          text: "We aim to respond to all legal and terms-related enquiries within 5 business days.",
        },
      ],
    },
  ],
};

export const privacyPolicy: LegalDocumentData = {
  badge: "🔒 Legal Document",
  title: "Privacy Policy",
  lastUpdated: "August 3, 2026",
  intro: "How AcmePDF collects, uses, and protects your information.",
  shortVersion:
    "We don't require an account to use AcmePDF. Files you upload are processed only to perform the tool you requested and are deleted shortly after. We use a small number of third-party services for analytics and advertising, which may set cookies. We never sell your personal information.",
  sections: [
    {
      id: "overview",
      title: "Overview",
      blocks: [
        {
          type: "paragraph",
          text: 'This Privacy Policy explains how AcmePDF ("we", "us", "our") collects, uses, discloses, and safeguards information when you visit or use <strong class="text-slate-700">acmepdf.com</strong> (the "Service"). By using the Service, you agree to the collection and use of information as described in this policy.',
        },
        {
          type: "paragraph",
          text: "This policy should be read together with our Terms of Service. If you do not agree with this policy, please do not use the Service.",
        },
      ],
    },
    {
      id: "information-we-collect",
      title: "Information We Collect",
      blocks: [
        {
          type: "list",
          intro: "We collect the following categories of information:",
          items: [
            "Files you upload — the documents and images you choose to process using our tools",
            "Usage data — pages visited, tools used, session duration, referring pages, browser type and version, device type, and operating system, collected automatically via analytics",
            "Technical data — IP address, approximate location derived from IP, log data, and cookies necessary to operate, secure, and monitor the Service",
            "Communications — information you provide when you contact us, such as your email address and the content of your message",
          ],
        },
        {
          type: "paragraph",
          text: "AcmePDF does not require you to create an account, so we do not collect names, passwords, or profile information unless you voluntarily provide them by contacting us.",
        },
      ],
    },
    {
      id: "how-we-use-information",
      title: "How We Use Information",
      blocks: [
        {
          type: "list",
          intro: "We use the information we collect to:",
          items: [
            "Provide, operate, and maintain the tools available on AcmePDF",
            "Process the files you upload solely for the purpose of the operation you requested",
            "Monitor and analyse usage to understand how the Service is used and to improve it",
            "Detect, prevent, and address technical issues, abuse, or security incidents",
            "Display advertising that helps fund the free tools we provide",
            "Respond to your enquiries when you contact us",
            "Comply with applicable legal obligations",
          ],
        },
        {
          type: "paragraph",
          text: "We do not use the content of your uploaded files for advertising, profiling, or any purpose other than performing the tool operation you requested.",
        },
      ],
    },
    {
      id: "file-processing",
      title: "File Processing and Retention",
      blocks: [
        {
          type: "paragraph",
          text: "Depending on the tool, your files are processed either entirely in your browser (client-side), in which case they are never transmitted to our servers, or uploaded to our servers for processing (server-side).",
        },
        {
          type: "callout",
          variant: "info",
          title: "Retention",
          text: "Files processed on our servers are used only to perform the requested operation and are automatically deleted shortly after processing completes, or after a short period of inactivity, whichever is sooner. We do not review, share, back up, or use the content of your files for any other purpose.",
        },
        {
          type: "paragraph",
          text: "We strongly advise against uploading highly sensitive or confidential documents unless you are comfortable with the associated risks of internet transmission, as described in our Terms of Service.",
        },
      ],
    },
    {
      id: "cookies",
      title: "Cookies and Tracking Technologies",
      blocks: [
        {
          type: "paragraph",
          text: "We use cookies and similar tracking technologies (such as local storage and pixel tags) to operate the Service, remember your preferences, and understand how the Service is used.",
        },
        {
          type: "list",
          intro: "The main technologies we use are:",
          items: [
            "Google Analytics — to understand aggregate usage patterns, such as which tools are used most and how visitors navigate the site",
            "Google Tag Manager — to manage the tags used across the site, including the ones listed here",
            "Statcounter — for supplementary traffic analytics",
            "Google AdSense — to serve advertisements, which may use cookies to show ads based on your prior visits to this or other websites",
          ],
        },
        {
          type: "paragraph",
          text: "You can control or disable cookies through your browser settings, and you can opt out of personalised Google advertising through Google's Ads Settings. Disabling cookies may affect some functionality of the Service.",
        },
      ],
    },
    {
      id: "third-party-services",
      title: "Third-Party Services",
      tocLabel: "Third-Party Services",
      blocks: [
        {
          type: "paragraph",
          text: "The third-party services listed above are operated by companies independent of AcmePDF and may collect and process data according to their own privacy policies, not this one. We encourage you to review those policies to understand how they handle your information.",
        },
        {
          type: "paragraph",
          text: "We do not control, and are not responsible for, the privacy practices of these third parties.",
        },
      ],
    },
    {
      id: "data-sharing",
      title: "How We Share Information",
      blocks: [
        {
          type: "paragraph",
          text: "We do not sell your personal information to third parties.",
        },
        {
          type: "list",
          intro:
            "We may share limited information in the following circumstances:",
          items: [
            "With service providers who help us operate the Service, such as hosting and analytics providers, under obligations to protect your data",
            "With advertising partners, limited to data those partners collect directly via their own cookies and technologies",
            "If required to do so by law, regulation, legal process, or governmental request",
            "To protect the rights, property, or safety of AcmePDF, our users, or the public, including to prevent fraud or abuse",
            "In connection with a merger, acquisition, or sale of assets, subject to this policy continuing to apply to your information",
          ],
        },
      ],
    },
    {
      id: "your-rights",
      title: "Your Rights",
      blocks: [
        {
          type: "paragraph",
          text: "Depending on where you live, you may have rights under data protection laws such as the GDPR (EU/EEA/UK) or the CCPA (California) and similar US state laws.",
        },
        {
          type: "list",
          intro: "These rights may include the right to:",
          items: [
            "Access the personal data we hold about you",
            "Request correction of inaccurate data",
            "Request deletion of your data",
            "Object to or restrict certain processing",
            "Request a copy of your data in a portable format",
            "Withdraw consent where processing is based on consent",
          ],
        },
        {
          type: "paragraph",
          text: "Because we do not maintain user accounts or persistent profiles tied to an identity, most requests relate to browser-level data (such as cookies), which you can manage directly through your browser. For any other request, contact us using the details below and we will respond within a reasonable timeframe.",
        },
      ],
    },
    {
      id: "do-not-track",
      title: "Do Not Track Signals",
      blocks: [
        {
          type: "paragraph",
          text: 'Some browsers offer a "Do Not Track" (DNT) setting. There is currently no industry-standard way to respond to DNT signals, so our Service does not currently respond to them differently from how it treats users who have not enabled DNT.',
        },
      ],
    },
    {
      id: "childrens-privacy",
      title: "Children's Privacy",
      blocks: [
        {
          type: "paragraph",
          text: "The Service is not directed at children under 13 (or under 16 if you are located in the EU). We do not knowingly collect personal information from children below this age. If you believe a child has provided us with personal information, please contact us so we can investigate and remove it.",
        },
      ],
    },
    {
      id: "security",
      title: "Data Security",
      blocks: [
        {
          type: "paragraph",
          text: "We take reasonable technical and organisational measures to protect your data, including encrypted transmission (HTTPS) and prompt deletion of processed files.",
        },
        {
          type: "callout",
          variant: "warning",
          text: "No method of transmission over the internet or electronic storage is completely secure. While we strive to protect your information, we cannot guarantee its absolute security.",
        },
      ],
    },
    {
      id: "international-transfers",
      title: "International Data Transfers",
      blocks: [
        {
          type: "paragraph",
          text: "Your information may be transferred to, stored, and processed in countries other than your own, including countries where our servers or third-party providers operate, which may have different data protection laws than your country.",
        },
        {
          type: "paragraph",
          text: "Where required, we rely on appropriate safeguards — such as standard contractual clauses or equivalent mechanisms used by our third-party providers — to ensure such transfers comply with applicable data protection laws.",
        },
      ],
    },
    {
      id: "changes",
      title: "Changes to This Policy",
      blocks: [
        {
          type: "paragraph",
          text: 'We may update this Privacy Policy from time to time to reflect changes in our practices or for legal or operational reasons. When we do, we will update the "Last updated" date at the top of this page.',
        },
        {
          type: "paragraph",
          text: "Continued use of the Service after changes are posted constitutes your acceptance of the updated policy. We recommend checking this page periodically to stay informed of any updates.",
        },
      ],
    },
    {
      id: "contact",
      title: "Contact Us",
      blocks: [
        {
          type: "paragraph",
          text: "If you have questions about this Privacy Policy or how we handle your data, or if you would like to exercise any of the rights described above, please contact us:",
        },
        {
          type: "contact",
          items: [
            {
              label: "Email",
              value: "legal@example.com",
              href: "mailto:legal@example.com",
            },
            {
              label: "Website",
              value: "acmepdf.com",
              href: "https://acmepdf.com",
            },
          ],
        },
        {
          type: "paragraph",
          text: "We aim to respond to all privacy-related enquiries within 5 business days.",
        },
      ],
    },
  ],
};

export const disclaimer: LegalDocumentData = {
  badge: "⚠️ Legal Document",
  title: "Disclaimer",
  lastUpdated: "August 3, 2026",
  intro:
    "Important information about the limits of AcmePDF's tools and content.",
  shortVersion:
    'AcmePDF is provided "as is" with no guarantees of accuracy or availability. It is not professional advice. Always review processed files before relying on them, and keep a copy of the original.',
  sections: [
    {
      id: "general",
      title: "General Disclaimer",
      blocks: [
        {
          type: "callout",
          variant: "warning",
          text: 'The information and tools on AcmePDF are provided in good faith, on an "as is" and "as available" basis, for general use. We make no representation or warranty of any kind, express or implied, regarding the accuracy, adequacy, validity, reliability, availability, or completeness of the Service.',
        },
        {
          type: "paragraph",
          text: "Under no circumstance shall AcmePDF have any liability to you for any loss or damage of any kind incurred as a result of the use of the Service or reliance on any information provided. Your use of the Service and your reliance on any information is solely at your own risk.",
        },
      ],
    },
    {
      id: "no-professional-advice",
      title: "No Professional Advice",
      blocks: [
        {
          type: "paragraph",
          text: "AcmePDF is a document-processing tool, not a source of legal, financial, medical, tax, or other professional advice. Nothing on this site should be relied upon as a substitute for advice from a qualified professional, particularly when processing sensitive documents such as contracts, financial statements, or medical records.",
        },
        {
          type: "paragraph",
          text: "If you require professional advice regarding the content of a document you are processing, please consult an appropriately qualified professional before acting on it.",
        },
      ],
    },
    {
      id: "accuracy-of-results",
      title: "Accuracy of Results",
      blocks: [
        {
          type: "paragraph",
          text: "While we aim for our conversion, editing, compression, and merging tools to produce accurate results, document processing can occasionally alter formatting, layout, embedded fonts, images, or content in unexpected ways, particularly with complex or non-standard files.",
        },
        {
          type: "list",
          intro: "We recommend that you:",
          items: [
            "Always review the output file before relying on it or sharing it further",
            "Keep a copy of your original file until you have verified the processed result",
            "Avoid using AcmePDF as the sole step in any workflow where document accuracy is critical, such as legal filings or financial reporting",
            "Test important or high-stakes documents with a small sample before processing in bulk",
          ],
        },
      ],
    },
    {
      id: "availability-disclaimer",
      title: "Availability and Errors",
      blocks: [
        {
          type: "paragraph",
          text: "AcmePDF may from time to time contain technical inaccuracies, typographical errors, or be temporarily unavailable due to maintenance, updates, or factors outside our control. We do not warrant that the Service will be uninterrupted, timely, secure, or error-free.",
        },
        {
          type: "paragraph",
          text: "We reserve the right to correct any errors, inaccuracies, or omissions and to change or update information on the Service at any time without prior notice.",
        },
      ],
    },
    {
      id: "third-party-content",
      title: "Third-Party Links and Advertising",
      blocks: [
        {
          type: "paragraph",
          text: "AcmePDF may display advertisements or links to third-party websites, products, or services. We do not endorse, and are not responsible for, the content, accuracy, opinions, or practices of these third parties.",
        },
        {
          type: "paragraph",
          text: "Visiting a linked site, or interacting with an advertised product or service, is at your own risk and subject to the terms and policies of that third party. Inclusion of a link or advertisement does not imply our approval or affiliation.",
        },
      ],
    },
    {
      id: "no-liability",
      title: "Limitation of Liability",
      blocks: [
        {
          type: "paragraph",
          text: "To the fullest extent permitted by applicable law, AcmePDF, its operators, directors, employees, and agents will not be liable for any loss or damage of any kind arising from:",
        },
        {
          type: "list",
          items: [
            "Reliance on information or results provided through the Service",
            "Errors, interruptions, or inaccuracies in processed files",
            "Loss, corruption, or unauthorised access to files during processing",
            "Any decision made or action taken based on the Service",
          ],
        },
        {
          type: "paragraph",
          text: "This Disclaimer should be read together with our Terms of Service, which contain the full limitation of liability applicable to your use of AcmePDF.",
        },
      ],
    },
    {
      id: "severability",
      title: "Severability",
      blocks: [
        {
          type: "paragraph",
          text: "If any provision of this Disclaimer is found to be unenforceable or invalid under applicable law, that provision will be limited or eliminated to the minimum extent necessary, and the remaining provisions will continue in full force and effect.",
        },
      ],
    },
    {
      id: "changes",
      title: "Changes to This Disclaimer",
      blocks: [
        {
          type: "paragraph",
          text: 'We may update this Disclaimer from time to time. When we do, we will update the "Last updated" date at the top of this page. Continued use of the Service after changes are posted constitutes your acceptance of the updated Disclaimer.',
        },
      ],
    },
    {
      id: "contact",
      title: "Contact Us",
      blocks: [
        {
          type: "paragraph",
          text: "If you have questions about this Disclaimer, please contact us:",
        },
        {
          type: "contact",
          items: [
            {
              label: "Email",
              value: "legal@example.com",
              href: "mailto:legal@example.com",
            },
            {
              label: "Website",
              value: "acmepdf.com",
              href: "https://acmepdf.com",
            },
          ],
        },
        {
          type: "paragraph",
          text: "We aim to respond to all enquiries within 5 business days.",
        },
      ],
    },
  ],
};
