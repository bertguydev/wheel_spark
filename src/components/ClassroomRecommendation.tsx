import Link from "next/link";
import styles from "./ClassroomRecommendation.module.css";

type ClassroomRecommendationProps = {
  heading: string;
  title: string;
  description: string;
  action: string;
  href: "/drawing-ideas-wheel" | "/yes-or-no-wheel";
};

export function ClassroomRecommendation({ heading, title, description, action, href }: ClassroomRecommendationProps) {
  const id = `classroom-recommendation-${href.slice(1)}`;

  return (
    <section className={styles.recommendation} aria-labelledby={id}>
      <h3 id={id} className={styles.heading}>{heading}</h3>
      <Link
        href={href}
        className={`wheel-card ${styles.card}`}
        aria-labelledby={`${id}-action`}
        aria-describedby={`${id}-description`}
      >
        <svg aria-hidden="true" className={styles.illustration} viewBox="0 0 48 48">
          {href === "/drawing-ideas-wheel" ? (
            <g stroke="var(--wheel-ink)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="6" width="25" height="35" rx="3" fill="var(--surface)" />
              <path d="M14 29l5-6 4 4 6-7M14 35h12" fill="none" />
              <circle cx="17" cy="15" r="2.5" fill="var(--coral)" stroke="none" />
              <path d="M25 28l3-6L39 11a2 2 0 0 1 3 3L31 25z" fill="var(--butter)" />
            </g>
          ) : (
            <>
              {Array.from({ length: 8 }, (_, index) => (
                <path
                  key={index}
                  d="M24 25V8a17 17 0 0 1 12.02 4.98Z"
                  transform={`rotate(${index * 45} 24 25)`}
                  fill={index % 2 === 0 ? "var(--coral)" : "var(--butter)"}
                  stroke="var(--surface)"
                  strokeWidth=".8"
                />
              ))}
              <circle cx="24" cy="25" r="17" fill="none" stroke="var(--surface)" strokeWidth="1.4" />
              <circle cx="24" cy="25" r="3" fill="var(--surface)" />
              <path d="M20 4h8l-4 8z" fill="var(--coral)" stroke="var(--surface)" strokeLinejoin="round" />
            </>
          )}
        </svg>
        <span className={styles.copy}>
          <strong className={styles.title}>{title}</strong>
          <span id={`${id}-description`} className={styles.description}>{description}</span>
          <span id={`${id}-action`} className={styles.action}>{action}{"\u00a0"}<span aria-hidden="true">→</span></span>
        </span>
      </Link>
    </section>
  );
}
