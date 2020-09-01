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
        [options.latColName, options.lonColName, options.classify]
      ),
    [data, options.latColName, options.lonColName, options.classify]
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
    </React.Fragment>
  );
}

GeneralSettings.propTypes = EditorPropTypes;
