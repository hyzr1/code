import type { ReactNode } from "react";
import Icon, { type IconName } from "./Icon";

/**
 * Every list needs one of these. A bare "no results" line reads as a bug —
 * an empty state that says what happened and offers the next action reads as
 * a product that anticipated you being here.
 */
export default function EmptyState({
  icon = "search",
  title,
  detail,
  children,
}: {
  icon?: IconName;
  title: string;
  detail?: string;
  children?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <div className="mark">
        <Icon name={icon} size={20} />
      </div>
      <h3>{title}</h3>
      {detail ? <p>{detail}</p> : null}
      {children ? <div className="actions">{children}</div> : null}
    </div>
  );
}
