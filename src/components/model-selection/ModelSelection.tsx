import { MODEL_COPY } from "../../data/modelCopy";
import type { ModelKey } from "../../types/planner";

type ModelSelectionProps = {
  model: ModelKey | null;
  onSelect: (model: ModelKey) => void;
};

export default function ModelSelection({ model, onSelect }: ModelSelectionProps) {
  return (
    <div className="modelChoice">
      <div className="modelGrid modelGrid-builder">
        {(Object.keys(MODEL_COPY) as ModelKey[]).map((key) => {
          const copy = MODEL_COPY[key];
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
                Choose this
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
