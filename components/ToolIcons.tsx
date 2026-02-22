/* Inline SVG tool icons — no external deps needed */
import Image from "next/image";

export function FigmaIcon({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 38 57"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Figma"
    >
      <path d="M19 28.5C19 25.9804 20.0009 23.5641 21.7825 21.7825C23.5641 20.0009 25.9804 19 28.5 19C31.0196 19 33.4359 20.0009 35.2175 21.7825C36.9991 23.5641 38 25.9804 38 28.5C38 31.0196 36.9991 33.4359 35.2175 35.2175C33.4359 36.9991 31.0196 38 28.5 38C25.9804 38 23.5641 36.9991 21.7825 35.2175C20.0009 33.4359 19 31.0196 19 28.5Z" fill="#1ABCFE"/>
      <path d="M0 47.5C0 44.9804 1.00089 42.5641 2.78249 40.7825C4.56408 39.0009 6.98044 38 9.5 38H19V47.5C19 50.0196 17.9991 52.4359 16.2175 54.2175C14.4359 55.9991 12.0196 57 9.5 57C6.98044 57 4.56408 55.9991 2.78249 54.2175C1.00089 52.4359 0 50.0196 0 47.5Z" fill="#0ACF83"/>
      <path d="M19 0V19H28.5C31.0196 19 33.4359 17.9991 35.2175 16.2175C36.9991 14.4359 38 12.0196 38 9.5C38 6.98044 36.9991 4.56408 35.2175 2.78249C33.4359 1.00089 31.0196 0 28.5 0H19Z" fill="#FF7262"/>
      <path d="M0 9.5C0 12.0196 1.00089 14.4359 2.78249 16.2175C4.56408 17.9991 6.98044 19 9.5 19H19V0H9.5C6.98044 0 4.56408 1.00089 2.78249 2.78249C1.00089 4.56408 0 6.98044 0 9.5Z" fill="#F24E1E"/>
      <path d="M0 28.5C0 31.0196 1.00089 33.4359 2.78249 35.2175C4.56408 36.9991 6.98044 38 9.5 38H19V19H9.5C6.98044 19 4.56408 20.0009 2.78249 21.7825C1.00089 23.5641 0 25.9804 0 28.5Z" fill="#A259FF"/>
    </svg>
  );
}

export function NotionIcon({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Notion"
    >
      <path
        d="M6.017 4.313l55.333-4.087c6.797-.583 8.543-.19 12.817 2.917l17.663 12.443c2.913 2.14 3.883 2.723 3.883 5.053v68.243c0 4.277-1.553 6.807-6.99 7.193L24.467 99.967c-4.08.387-6.023-.193-8.16-2.913L3.113 79.813C.973 76.89 0 74.943 0 72.613V11.067c0-3.497 1.553-6.44 6.017-6.754z"
        fill="#fff"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M61.35.227l-55.333 4.086C1.553 4.627 0 7.57 0 11.067v61.546c0 2.33.973 4.277 3.113 7.2l13.194 17.24c2.137 2.72 4.08 3.3 8.16 2.913l64.257-3.923c5.44-.387 6.99-2.917 6.99-7.193V9.553c0-2.195-.778-2.848-3.23-4.54L74.167 3.143c-4.273-3.107-6.02-3.5-12.817-2.917zM25.92 19.523c-5.253.333-6.45.41-9.43-1.99L8.97 11.403c-.777-.78-.39-1.75 1.557-1.943l53.193-3.887c4.467-.39 6.793 1.167 8.54 2.527l9.123 6.61c.39.197 1.36 1.36.777 1.36l-54.84 3.303-.4.15zM19.447 88.653V30.327c0-2.523.777-3.693 3.107-3.89l59.104-3.5c2.13-.193 3.107 1.167 3.107 3.693v57.547c0 2.52-.973 4.273-3.887 4.46l-57.94 3.5c-2.91.193-3.49-1.167-3.49-3.484zm56.8-54.237c.389 1.75 0 3.5-1.75 3.7l-2.91.577v42.773c-2.527 1.36-4.853 2.137-6.797 2.137-3.107 0-3.883-1.007-6.21-3.887l-19.03-29.94v28.967l6.02 1.363s0 3.5-4.857 3.5l-13.39.777c-.39-.777 0-2.723 1.357-3.11l3.497-.97V36.553l-4.857-.387c-.39-1.75.586-4.277 3.3-4.473l14.367-.967 19.8 30.327V35.39l-5.047-.58c-.39-2.143 1.163-3.7 3.103-3.89l13.403-.703z"
        fill="#000"
      />
    </svg>
  );
}

export function AgileIcon({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" fill="currentColor"/>
    </svg>
  );
}

export function AsanaIcon({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <Image
      src="/asanalogo.svg"
      alt="Asana"
      width={size}
      height={size}
      className={className}
      style={{ display: "inline-block" }}
    />
  );
}

export function SlackIcon({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <Image
      src="/Slack_icon_2019.svg"
      alt="Slack"
      width={size}
      height={size}
      className={className}
      style={{ display: "inline-block" }}
    />
  );
}

export function GoogleAnalyticsIcon({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <Image
      src="/googleanalytics.svg"
      alt="Google Analytics"
      width={size}
      height={size}
      className={className}
      style={{ display: "inline-block" }}
    />
  );
}

export function GoogleLighthouseIcon({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <Image
      src="/Google_Lighthouse_logo.svg"
      alt="Google Lighthouse"
      width={size}
      height={size}
      className={className}
      style={{ display: "inline-block" }}
    />
  );
}

export function ReactIcon({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <Image
      src="/reactjs.svg"
      alt="React JS"
      width={size}
      height={size}
      className={className}
      style={{ display: "inline-block" }}
    />
  );
}

export function CursorIcon({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <Image
      src="/cursorlogo.svg"
      alt="Cursor"
      width={size}
      height={size}
      className={className}
      style={{ display: "inline-block" }}
    />
  );
}
