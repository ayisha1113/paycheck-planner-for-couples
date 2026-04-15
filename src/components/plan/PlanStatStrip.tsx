import type { PlanSummary } from "../../types/planner";

type Props = {
  stats: PlanSummary["stats"];
};

export default function PlanStatStrip({ stats }: Props) {
  return (
    <div className="summaryStrip">
      <div className="statGrid">
        {stats.map((stat) => (
          <div className="statCell" key={stat.label}>
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
            {stat.sub ? (
              <div className="helperText" style={{ color: "rgba(255,255,255,0.5)", marginTop: 6 }}>
                {stat.sub}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
