import d3 from "d3";
import { isNil, extend, map, filter, groupBy, omit } from "lodash";

export default function prepareData(data, options) {
  const colorScale = d3.scale.category10();

  const { classify, geoJsonColName } = options;

  const geoJsonGroups = classify ? groupBy(data.rows, classify) : { All: data.rows };

  return filter(
    map(geoJsonGroups, (rows, name) => {
      const features = filter(
        map(rows, row => {
          const geoJsonData = row[geoJsonColName];
          if (isNil(geoJsonData)) {
            return null;
          }
          return { geoJsonData, row: omit(row, [geoJsonColName]) };
        })
      );
      if (features.length === 0) {
        return null;
      }

      const result = extend({}, options.groups[name], { name, rows });
      if (isNil(result.color)) {
        result.color = colorScale(name);
      }

      return result;
    })
  );
}
