/* Kumpulan ikon garis untuk dashboard pelajar.
   Semua memakai currentColor supaya warna mengikuti teks induknya. */

const line = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

function Svg({ size = 18, children, ...rest }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" {...line} {...rest}>
      {children}
    </svg>
  );
}

export const HomeIcon = (p) => (
  <Svg {...p}>
    <path d="M4 10.6 12 4l8 6.6V19a1.6 1.6 0 0 1-1.6 1.6h-3.6v-6.1H9.2v6.1H5.6A1.6 1.6 0 0 1 4 19Z" />
  </Svg>
);

export const BookIcon = (p) => (
  <Svg {...p}>
    <path d="M4 5.4A1.4 1.4 0 0 1 5.4 4H10a2 2 0 0 1 2 2v13a1.6 1.6 0 0 0-1.6-1.6H4Z" />
    <path d="M20 5.4A1.4 1.4 0 0 0 18.6 4H14a2 2 0 0 0-2 2v13a1.6 1.6 0 0 1 1.6-1.6H20Z" />
  </Svg>
);

export const PlusIcon = (p) => (
  <Svg {...p}>
    <path d="M12 5v14M5 12h14" />
  </Svg>
);

export const GearIcon = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 14.4a1.6 1.6 0 0 0 .3 1.8l.1.1a1.7 1.7 0 1 1-2.4 2.4l-.1-.1a1.6 1.6 0 0 0-2.7 1.1v.3a1.7 1.7 0 1 1-3.4 0v-.2a1.6 1.6 0 0 0-2.8-1.1l-.1.1a1.7 1.7 0 1 1-2.4-2.4l.1-.1a1.6 1.6 0 0 0-1.1-2.7H4.5a1.7 1.7 0 1 1 0-3.4h.2a1.6 1.6 0 0 0 1.1-2.8l-.1-.1a1.7 1.7 0 1 1 2.4-2.4l.1.1a1.6 1.6 0 0 0 2.7-1.1V4.5a1.7 1.7 0 1 1 3.4 0v.2a1.6 1.6 0 0 0 2.8 1.1l.1-.1a1.7 1.7 0 1 1 2.4 2.4l-.1.1a1.6 1.6 0 0 0 1.1 2.7h.3a1.7 1.7 0 1 1 0 3.4h-.2a1.6 1.6 0 0 0-1.3.9Z" />
  </Svg>
);

export const SearchIcon = (p) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="6.4" />
    <path d="m16 16 4 4" />
  </Svg>
);

export const ClockIcon = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.2" />
    <path d="M12 7.8V12l2.8 1.8" />
  </Svg>
);

export const BellIcon = (p) => (
  <Svg {...p}>
    <path d="M18 9a6 6 0 1 0-12 0c0 3.3-1.2 4.7-1.8 5.3a.9.9 0 0 0 .6 1.6h13.4a.9.9 0 0 0 .6-1.6C18.2 13.7 18 12.3 18 9Z" />
    <path d="M10 19.2a2.2 2.2 0 0 0 4 0" />
  </Svg>
);

export const ChevronDownIcon = (p) => (
  <Svg {...p}>
    <path d="m6 9.5 6 5.5 6-5.5" />
  </Svg>
);

export const ChevronLeftIcon = (p) => (
  <Svg {...p}>
    <path d="m14.5 5.5-6 6.5 6 6.5" />
  </Svg>
);

export const ChevronRightIcon = (p) => (
  <Svg {...p}>
    <path d="m9.5 5.5 6 6.5-6 6.5" />
  </Svg>
);

export const ArrowRightIcon = (p) => (
  <Svg {...p}>
    <path d="M4.5 12h14m0 0-5.4-5.4M18.5 12l-5.4 5.4" />
  </Svg>
);

export const CheckIcon = (p) => (
  <Svg {...p}>
    <path d="m5 12.8 4.4 4.2L19 6.6" />
  </Svg>
);

export const SparkleIcon = (p) => (
  <Svg {...p}>
    <path d="M12 3.5c.6 3.6 1.9 4.9 5.5 5.5-3.6.6-4.9 1.9-5.5 5.5-.6-3.6-1.9-4.9-5.5-5.5 3.6-.6 4.9-1.9 5.5-5.5Z" />
    <path d="M17.6 15.2c.3 1.7.9 2.3 2.6 2.6-1.7.3-2.3.9-2.6 2.6-.3-1.7-.9-2.3-2.6-2.6 1.7-.3 2.3-.9 2.6-2.6Z" />
  </Svg>
);

export const LogOutIcon = (p) => (
  <Svg {...p}>
    <path d="M14.5 4.5h3A1.5 1.5 0 0 1 19 6v12a1.5 1.5 0 0 1-1.5 1.5h-3" />
    <path d="M10 8.5 6.5 12 10 15.5M6.5 12h9" />
  </Svg>
);

export const LayersIcon = (p) => (
  <Svg {...p}>
    <path d="m12 3.5 8 4.3-8 4.3-8-4.3Z" />
    <path d="m4 12.2 8 4.3 8-4.3" />
    <path d="m4 16.4 8 4.3 8-4.3" />
  </Svg>
);

export const ClipboardIcon = (p) => (
  <Svg {...p}>
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    <path d="M9 12h6M9 16h4" />
  </Svg>
);

export const LinkIcon = (p) => (
  <Svg {...p}>
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </Svg>
);

export const UploadIcon = (p) => (
  <Svg {...p}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </Svg>
);

export const XIcon = (p) => (
  <Svg {...p}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </Svg>
);
