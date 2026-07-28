import {
  Children,
  isValidElement,
  useId,
  type ReactElement,
  type ReactNode
} from "react";

type TabProps = {
  children: ReactNode;
  label: string;
};

export function Tab({ children }: TabProps) {
  return <>{children}</>;
}

export function Tabs({ children, defaultValue = 0 }: { children: ReactNode; defaultValue?: number }) {
  const tabs = Children.toArray(children).filter(
    (child): child is ReactElement<TabProps> => isValidElement<TabProps>(child)
  );
  const activeIndex = Math.min(Math.max(defaultValue, 0), Math.max(tabs.length - 1, 0));
  const id = useId();

  if (!tabs.length) return null;

  return (
    <div className="mdx-tabs" data-tabs="">
      <div className="mdx-tab-list" role="tablist" aria-label="内容选项">
        {tabs.map((tab, index) => (
          <button
            aria-controls={`${id}-panel-${index}`}
            aria-selected={activeIndex === index}
            data-tab-index={index}
            id={`${id}-tab-${index}`}
            key={tab.props.label}
            role="tab"
            tabIndex={activeIndex === index ? 0 : -1}
            type="button"
          >
            {tab.props.label}
          </button>
        ))}
      </div>
      {tabs.map((tab, index) => (
        <div
          aria-labelledby={`${id}-tab-${index}`}
          className="mdx-tab-panel"
          hidden={activeIndex !== index}
          id={`${id}-panel-${index}`}
          key={tab.props.label}
          role="tabpanel"
        >
          {tab.props.children}
        </div>
      ))}
    </div>
  );
}
