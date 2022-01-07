import { AverageTimeMeasurement } from "./average-time-measurement";

export interface MeasurementSet {
    readonly retrieve: Measurement,
    readonly parse: Measurement,
    readonly run: Measurement,
}

export interface Measurement {
    readonly average: AverageTimeMeasurement,
    readonly sheetColumnIndex: number,
}

export const measurements: { readonly source: MeasurementSet, readonly minified: MeasurementSet } = {
    source: {
        retrieve: {
            average: new AverageTimeMeasurement(),
            sheetColumnIndex: 0,
        },
        parse: {
            average: new AverageTimeMeasurement(),
            sheetColumnIndex: 1,
        },
        run: {
            average: new AverageTimeMeasurement(),
            sheetColumnIndex: 2,
        },
    },
    minified: {
        retrieve: {
            average: new AverageTimeMeasurement(),
            sheetColumnIndex: 3,
        },
        parse: {
            average: new AverageTimeMeasurement(),
            sheetColumnIndex: 4,
        },
        run: {
            average: new AverageTimeMeasurement(),
            sheetColumnIndex: 5,
        },
    },
}