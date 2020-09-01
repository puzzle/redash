import { isNil, map, filter, difference } from "lodash";
import React, { useMemo } from "react";
import { Section, Select } from "@/components/visualizations/editor";
import { EditorPropTypes } from "@/visualizations/prop-types";

function getColumns(column, unusedColumns) {
  return filter([column, ...unusedColumns], v => !isNil(v));
}

export default function GeneralSettings({ options, data, onOptionsChange }) {
  const unusedColumns = useMemo(
    () =>
      difference(
        map(data.columns, c => c.name),
        [options.geoJsonColName, options.classify]
      ),
    [data, options.geoJsonColName, options.classify]
  );

  return (
    <React.Fragment>
      <Section>
        <Select
          label="GeoJson Column Name"
          data-test="Map.Editor.GeoJsonName"
          value={options.geoJsonColName}
          onChange={geoJsonColName => onOptionsChange({ geoJsonColName })}>
          {map(getColumns(options.geoJsonColName, unusedColumns), col => (
            <Select.Option key={col} data-test={"Map.Editor.GeoJsonName." + col}>
              {col}
            </Select.Option>
          ))}
        </Select>
      </Section>

      <Section>
        <Select
          label="Group By"
          data-test="Map.Editor.GroupBy"
          allowClear
          placeholder="none"
          value={options.classify || undefined}
          onChange={column => onOptionsChange({ classify: column || null })}>
          {map(getColumns(options.classify, unusedColumns), col => (
            <Select.Option key={col} data-test={"Map.Editor.GroupBy." + col}>
              {col}
            </Select.Option>
          ))}
        </Select>
      </Section>
    </React.Fragment>
  );
}

GeneralSettings.propTypes = EditorPropTypes;
