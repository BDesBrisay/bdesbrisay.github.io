import { renderToString } from "katex";
import type { FormulaCard } from "../core/types";
import type { AppStoreApi, AppStoreState } from "../state/store";

function createEl<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  if (className !== undefined) {
    el.className = className;
  }
  return el;
}

export class FormulaCardsPanel {
  public readonly root: HTMLDivElement;

  private readonly store: AppStoreApi;
  private readonly list: HTMLDivElement;
  private unsubscribe: (() => void) | null = null;

  public constructor(container: HTMLElement, store: AppStoreApi) {
    this.store = store;
    this.root = createEl("div", "panel formulas-panel");

    const title = createEl("h2", "panel-title");
    title.textContent = "Math Surface";

    this.list = createEl("div", "formula-list");

    this.root.append(title, this.list);
    container.appendChild(this.root);

    this.unsubscribe = this.store.subscribe((state: AppStoreState, prevState: AppStoreState) => {
      if (state.formulas === prevState.formulas && state.highlightKey === prevState.highlightKey) {
        return;
      }
      this.render(state.formulas, state.highlightKey);
    });

    const current = this.store.getState();
    this.render(current.formulas, current.highlightKey);
  }

  private render(cards: FormulaCard[], highlightKey: string | null): void {
    this.list.innerHTML = "";

    for (const card of cards) {
      const item = createEl("article", "formula-card");
      item.dataset.highlightKey = card.highlightKey;
      item.classList.toggle("highlight", highlightKey === card.highlightKey);

      item.addEventListener("mouseenter", () => {
        this.store.getState().setHighlightKey(card.highlightKey);
      });
      item.addEventListener("mouseleave", () => {
        this.store.getState().setHighlightKey(null);
      });

      const heading = createEl("header", "formula-header");
      const title = createEl("h3", "formula-title");
      title.textContent = card.title;
      const source = createEl("span", "source-badge");
      source.textContent = card.source;
      heading.append(title, source);

      const latexBlock = createEl("div", "latex-block");
      latexBlock.innerHTML = renderToString(card.latex, {
        throwOnError: false,
        displayMode: true,
      });

      const substitutionList = createEl("ul", "substitution-list");
      for (const substitution of card.substitutions) {
        const li = createEl("li");
        li.innerHTML = `${renderToString(substitution.label, { throwOnError: false })}: ${substitution.value}`;
        substitutionList.appendChild(li);
      }

      const result = createEl("div", "formula-result");
      result.textContent = card.result;

      const explanation = createEl("p", "formula-english");
      explanation.textContent = card.plainEnglish;

      item.append(heading, latexBlock, substitutionList, result, explanation);
      this.list.appendChild(item);
    }
  }

  public dispose(): void {
    if (this.unsubscribe !== null) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    this.root.remove();
  }
}
