export default function CompareTable() {
  return (
    <table className="compareTable">
      <thead>
        <tr>
          <th>Model</th>
          <th>What comes first</th>
          <th>How fairness works</th>
          <th>Best for</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Shared-First</strong></td>
          <td>Shared life</td>
          <td>Cover shared essentials first</td>
          <td>Couples who want simplicity and stability</td>
        </tr>
        <tr>
          <td><strong>Personal-Space-First</strong></td>
          <td>Personal space</td>
          <td>Each person keeps room first</td>
          <td>Couples who value clearer personal boundaries</td>
        </tr>
        <tr>
          <td><strong>Proportional-Fairness</strong></td>
          <td>Ability-based contribution</td>
          <td>Shared costs reflect income or agreed ratio</td>
          <td>Couples with different income levels</td>
        </tr>
      </tbody>
    </table>
  );
}
