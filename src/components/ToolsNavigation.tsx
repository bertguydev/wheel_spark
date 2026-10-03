export function ToolsNavigation({ food = false, yesNo = false, drawing = false }: { food?: boolean; yesNo?: boolean; drawing?: boolean }) {
  return (
    <nav aria-label="Main" className="header-navigation">
      <details className="tools-navigation">
        <summary>Tools</summary>
        <div className="tools-links">
          <a href="/food-wheel" aria-current={food ? "page" : undefined}>Food Wheel</a>
          <a href="/yes-or-no-wheel" aria-current={yesNo ? "page" : undefined}>Yes or No Wheel</a>
          <a href="/drawing-ideas-wheel" aria-current={drawing ? "page" : undefined}>Drawing Ideas Wheel</a>
        </div>
      </details>
      <a href="#options" className="button button-secondary header-edit">Edit options</a>
    </nav>
  );
}
