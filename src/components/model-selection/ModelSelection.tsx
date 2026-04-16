import { getModelCopy } from "../../data/modelCopy";
import type { Language } from "../../lib/i18n";
import type { ModelKey } from "../../types/planner";

type ModelSelectionProps = {
  language: Language;
  model: ModelKey | null;
  onSelect: (model: ModelKey) => void;
};

export default function ModelSelection({ language, model, onSelect }: ModelSelectionProps) {
  const modelCopy = getModelCopy(language);
  const isZh = language === "zh";

  return (
    <div className="modelChoice">
      <div className="modelGrid modelGrid-builder">
        {(Object.keys(modelCopy) as ModelKey[]).map((key) => {
          const copy = modelCopy[key];
          const isSelected = model === key;

          return (
            <button
              key={key}
              className={`modelCard modelChoiceCard ${isSelected ? "active" : ""}`}
              onClick={() => onSelect(key)}
            >
              <span className="modelTag">{copy.tag}</span>
              <span className="modelSystemName">{copy.systemName}</span>
              <span className="modelTitle">{copy.title}</span>
              <span className={isSelected ? "btn-model-selected" : "btn-model-select"}>
                {isZh ? "选择这个方案" : "Choose this"}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
