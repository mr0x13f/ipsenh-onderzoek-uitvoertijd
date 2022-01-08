import fs from 'fs';
import { Config } from './config';
import { VM } from 'vm2';
import { CodeDatabase } from './code-database';
import { Stopwatch } from './stopwatch';
import { parse } from 'jsonc-parser';
import { measurements, MeasurementSet } from './measurements';
import { ResultsSheetDoc } from './results-sheet-doc';

const configPath = 'assets/config.jsonc';
const exampleConfigPath = 'assets/example-config.jsonc';
const sourceCodePath = 'assets/source_code.js';
const minifiedCodePath = 'assets/minified_code.js';
const databaseScriptPath = 'assets/database.sql';

let codeDatabase: CodeDatabase;
let config: Config;
let stopwatch: Stopwatch;
let resultsSheetDoc: ResultsSheetDoc;

async function main(): Promise<void> {

    if (!fs.existsSync(configPath)) {
        console.log(`No config file found! Be sure to make a copy of "${exampleConfigPath}" called "${configPath}" and edit it!`);
        return;
    }

    config = parse(fs.readFileSync(configPath, 'utf8')) as Config;

    const sourceCode = fs.readFileSync(sourceCodePath, 'utf8');
    const minifiedCode = fs.readFileSync(minifiedCodePath, 'utf8');

    codeDatabase = await CodeDatabase.create(config, databaseScriptPath);
    const codeId = await codeDatabase.insertCode(sourceCode, minifiedCode);

    stopwatch = new Stopwatch();

    if (config.writeResultsToSheet)
        if (config.googleSheets !== undefined) {
            resultsSheetDoc = new ResultsSheetDoc(config.googleSheets);
            await resultsSheetDoc.setup(config.iterations);
        } else
            throw new Error('"writeResultsToSheet" enabled but no Google Sheets connection specified in config');

    console.log('Benchmarking source code...');
    await runMeasurements(config.iterations, measurements.source, () => codeDatabase.getSourceCode(codeId));
    console.log('Benchmarking minified code...');
    await runMeasurements(config.iterations, measurements.minified, () => codeDatabase.getMinifiedCode(codeId));

    if (config.logAverageTimes) {
        console.log(`Average times after ${config.iterations} iterations:`);
        console.log(`\tSource:`);
        console.log(`\t\tRetrieve: ${measurements.source.retrieve.average.getAverageTime()}ms`);
        console.log(`\t\tParse: ${measurements.source.parse.average.getAverageTime()}ms`);
        console.log(`\t\tRun: ${measurements.source.run.average.getAverageTime()}ms`);
        console.log(`\tMinified:`);
        console.log(`\t\tRetrieve: ${measurements.minified.retrieve.average.getAverageTime()}ms`);
        console.log(`\t\tParse: ${measurements.minified.parse.average.getAverageTime()}ms`);
        console.log(`\t\tRun: ${measurements.minified.run.average.getAverageTime()}ms`);
    }

    if (config.writeResultsToSheet)
        await resultsSheetDoc.save();

    process.exit();

}

async function runMeasurements(iterationsPerStep: number, measurementSet: MeasurementSet, retrieveFunction: () => Promise<string>): Promise<void> {

    const vm = new VM();
    let code = '';
    
    console.log(`Retrieving code ${iterationsPerStep} times...`);
    for (let i = 0; i < iterationsPerStep; i++ ) {

        stopwatch.start();
        code = await retrieveFunction();
        const time = stopwatch.stop();

        if (config.logAverageTimes)
            measurementSet.retrieve.average.addTime(time);

        if (config.writeResultsToSheet)
            resultsSheetDoc.setResultCellValue(measurementSet.retrieve.sheetColumnIndex, i + 1, time);

    }

    console.log(`Parsing code ${iterationsPerStep} times...`);
    for (let i = 0; i < iterationsPerStep; i++ ) {

        stopwatch.start();
        vm.run(code);
        const time = stopwatch.stop();

        if (config.logAverageTimes)
            measurementSet.parse.average.addTime(time);

        if (config.writeResultsToSheet)
            resultsSheetDoc.setResultCellValue(measurementSet.parse.sheetColumnIndex, i + 1, time);
    }

    console.log(`Running code ${iterationsPerStep} times...`);
    for (let i = 0; i < iterationsPerStep; i++ ) {

        stopwatch.start();
        const result = vm.getGlobal(config.functionName).call();
        const time = stopwatch.stop();

        if (config.logAverageTimes)
            measurementSet.run.average.addTime(time);

        if (config.writeResultsToSheet)
            resultsSheetDoc.setResultCellValue(measurementSet.run.sheetColumnIndex, i + 1, time);
    }

}

main();