import { ClientConfig } from "pg";
import { ResultsSheetDocConfig } from "./results-sheet-doc";

export interface Config {

    functionName: string,

    iterations: number,

    logAverageTimes: boolean,

    writeResultsToSheet: boolean,

    postgres: ClientConfig,

    googleSheets: undefined | ResultsSheetDocConfig,

}