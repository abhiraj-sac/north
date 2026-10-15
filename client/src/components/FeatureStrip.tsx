import {
  Combine,
  GitCompareArrows,
  MoveUpRight,
  Target,
  type LucideIcon,
} from "lucide-react";

const features: { title: string; description: string; Icon: LucideIcon }[] = [
  {
    title: "Multi-Resume Synthesis",
    description: "One profile. Every possibility.",
    Icon: Combine,
  },
  {
    title: "Grounded Resonance",
    description: "Signal grounded in your story.",
    Icon: Target,
  },
  {
    title: "Tailored Diff Studio",
    description: "Every change, fully transparent.",
    Icon: GitCompareArrows,
  },
  {
    title: "Direct Founder Routing",
    description: "A shorter path to the people.",
    Icon: MoveUpRight,
  },
];

export default function FeatureStrip() {
  return (
    <section className="feature-strip" aria-label="NORTH capabilities">
      {features.map(({ title, description, Icon }, index) => (
        <div className="feature-item" key={title}>
          <span className="feature-icon">
            <Icon size={14} strokeWidth={1.7} />
          </span>
          <span className="feature-copy">
            <span className="feature-title">{title}</span>
            <span className="feature-description">{description}</span>
          </span>
          {index < features.length - 1 && (
            <span className="feature-divider" aria-hidden="true" />
          )}
        </div>
      ))}
    </section>
  );
}
