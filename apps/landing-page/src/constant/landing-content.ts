export interface Tool {
  icon: string;
  title: string;
  description: string;
  action: string;
}

export interface Step {
  icon: string;
  title: string;
  description: string;
}

export interface Feature {
  badge: string;
  title: string;
  image: string;
  highlight: string;
  description: string;
  points: string[];
  cta: string;
  reverse: boolean;
}

export interface Reason {
  icon: string;
  title: string;
  description: string;
}

export interface Faq {
  q: string;
  a: string;
}

export const tools: Tool[] = [
  {
    icon: "/svgs/SVG-2.svg",
    title: "Edit PDF",
    description:
      "Add text, signatures, images, and annotations to your documents instantly.",
    action: "Get Started Free",
  },
  {
    icon: "/svgs/SVG-1.svg",
    title: "Merge PDF",
    description: "Combine multiple PDF files into one clean, unified document.",
    action: "Get Started Free",
  },
  {
    icon: "/svgs/SVG-3.svg",
    title: "Compress PDF",
    description:
      "Reduce file size significantly while keeping good visual quality.",
    action: "Get Started Free",
  },
];

export const steps: Step[] = [
  {
    icon: "/svgs/SVG-4.svg",
    title: "Upload Your File",
    description:
      "Drag and drop your PDF or click to browse. We support files up to 150MB.",
  },
  {
    icon: "/svgs/SVG-5.svg",
    title: "Choose Your Action",
    description:
      "Select the tool you need — edit, merge, or compress — and customize settings.",
  },
  {
    icon: "/svgs/SVG-6.svg",
    title: "Download Result",
    description:
      "Your processed file is ready in seconds. Download and use it right away.",
  },
];

export const features: Feature[] = [
  {
    badge: "Edit PDF",
    title: "Powerful Editing,",
    highlight: "Made Simple",
    image: "Background+Border.png",
    description:
      "Add text, insert images, draw shapes, and annotate your PDF documents directly in your browser.",
    points: [
      "Add and edit text anywhere",
      "Insert images and signatures",
      "Draw shapes and annotations",
      "Save and download instantly",
    ],
    cta: "Edit PDF Now",
    reverse: false,
  },
  {
    badge: "Merge PDF",
    title: "Combine Files",
    highlight: "Effortlessly",
    image: "Background+Border-1.png",
    description:
      "Merge multiple PDF documents into a single unified file and create the perfect final output.",
    points: [
      "Merge up to 20 files at once",
      "Drag to reorder documents",
      "Preserve original quality",
      "Fast parallel processing",
    ],
    cta: "Merge PDFs Now",
    reverse: true,
  },
  {
    badge: "Compress PDF",
    title: "Smaller Files,",
    highlight: "Same Quality",
    image: "Background+Border-2.png",
    description:
      "Reduce your PDF file size by up to 80% with selectable quality levels for the best balance.",
    points: [
      "Up to 80% file size reduction",
      "Three compression levels",
      "No visual quality loss",
      "Perfect for email attachments",
    ],
    cta: "Compress PDF Now",
    reverse: false,
  },
];

export const reasons: Reason[] = [
  {
    icon: "/svgs/SVG-10.svg",
    title: "Lightning Fast Processing",
    description:
      "Our engine processes your files in seconds, not minutes. Built with performance-first architecture.",
  },
  {
    icon: "/svgs/SVG-9.svg",
    title: "Bank-Level Security",
    description:
      "All files are encrypted in transit and deleted automatically after processing for complete privacy.",
  },
  {
    icon: "/svgs/SVG-8.svg",
    title: "100% Free Forever",
    description:
      "No hidden fees or credit card required. Use core PDF tools without limits.",
  },
  {
    icon: "/svgs/SVG-7.svg",
    title: "No Installation Needed",
    description:
      "Works directly in your browser on desktop or mobile. No plugins, no sign-up required.",
  },
];

export const faqs: Faq[] = [
  {
    q: "What is AcmePDF?",
    a: "AcmePDF is a free online PDF tool designed to make working with PDF documents simple and convenient. You can edit, merge, compress, and manage PDF files directly from your web browser without installing additional software.",
  },
  {
    q: "Is AcmePDF free to use?",
    a: "Yes. AcmePDF provides free access to its core PDF tools, including PDF editing, merging, and compression. No credit card is required to use these core features.",
  },
  {
    q: "Do I need to create an account or install any software?",
    a: "No. You can use AcmePDF's most popular PDF tools without creating an account or signing in. AcmePDF works directly in your web browser — there is no software, browser extension, or plugin to install.",
  },
  {
    q: "What can I add to or edit in a PDF?",
    a: "AcmePDF allows you to edit PDF documents directly from your browser. You can add text, images, signatures, shapes, drawings, and annotations to your PDF document. You can also sign a PDF without printing and scanning, insert images, and add visual annotations.",
  },
  {
    q: "Can I combine multiple PDF files into one document?",
    a: "Yes. The Merge PDF tool allows you to combine up to 20 PDF files at once into a single PDF file. You can arrange your uploaded PDF files in your preferred order before creating the final merged document, and AcmePDF is designed to preserve the original quality of your documents.",
  },
  {
    q: "Can AcmePDF reduce the size of a PDF?",
    a: "Yes. The Compress PDF tool is designed to reduce PDF file sizes while maintaining good document quality. AcmePDF provides multiple compression levels so you can choose an appropriate balance between file size and document quality. Compressing a PDF makes it easier to email, upload, store, or share.",
  },
  {
    q: "What is the maximum PDF file size I can upload?",
    a: "AcmePDF currently supports PDF files up to 150 MB per file for most tools. You can drag and drop your PDF into the upload area or select the file from your device. If a file won't upload, confirm it is within the size limit, refresh the page, and check your internet connection.",
  },
  {
    q: "Are my PDF files secure and private?",
    a: "AcmePDF uses encryption in transit to help protect files while they are being transferred. Uploaded files are automatically removed after processing and are not intended to be publicly accessible to other AcmePDF users. Users should always exercise appropriate care when uploading sensitive, confidential, or personally identifiable information to any online service.",
  },
  {
    q: "What devices and browsers can I use with AcmePDF?",
    a: "AcmePDF is designed to work through modern web browsers on desktop computers, laptops, tablets, and mobile devices — including Windows, Mac, and mobile. For the best experience, use a current version of a major modern browser. Keeping your browser updated can also improve security and compatibility.",
  },
  {
    q: "How do I get started?",
    a: "Using AcmePDF takes only a few steps: (1) Select the PDF tool you need, (2) Upload your PDF document, (3) Choose your desired options or make your edits, (4) Process the document, and (5) Download the completed PDF. AcmePDF can be used by individuals, students, educators, professionals, and businesses for everyday browser-based PDF tasks.",
  },
];
