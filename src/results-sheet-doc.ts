import { GoogleSpreadsheet, GoogleSpreadsheetWorksheet } from "google-spreadsheet";

export interface ResultsSheetDocConfig {
    docId: string,
    clientEmail: string,
    privateKey: string,
    sheetTitle: string,
    dateSheet: boolean,
}

export class ResultsSheetDoc {

    private static readonly columnsCount = 6;
    private static readonly columnsPixelWidth = 150;
    private static readonly columnHeaders = [ 'Source retrieve', 'Source parse', 'Source run', 'Minified retrieve', 'Minified parse', 'Minified run' ];

    private doc: GoogleSpreadsheet;
    private sheetOrNull: GoogleSpreadsheetWorksheet | null = null;
    private config: ResultsSheetDocConfig;
    private isResultCellsLoaded = false;
    private resultRowsCount = 0;

    private get sheet(): GoogleSpreadsheetWorksheet {
        if (this.sheetOrNull !== null)
            return this.sheetOrNull;
        else
            throw new Error('No Google Sheets sheet found! Be sure to call "await resultsSheetDoc.setup();"!');
    }

    public constructor(config: ResultsSheetDocConfig) {

        this.config = config;

        this.doc = new GoogleSpreadsheet(this.config.docId);

    }

    public async save(): Promise<void> {
        console.log(`Saving results sheet doc...`)
        await this.sheet.saveUpdatedCells();
        console.log(`Saved results to sheet "${this.sheet.title}" on doc "${this.doc.title}"`);
    }

    public async setup(resultRows: number): Promise<void> {
        this.resultRowsCount = resultRows;
        await this.connect();
        await this.loadSheet();
        await this.setupSheet();
    }

    private async setupSheet(): Promise<void> {
        await this.resizeSheet();
        await this.setColumnProperties();
        await this.setSheetHeaders();
        await this.loadResultCells();
    }

    private async resizeSheet(): Promise<void> {
        await this.sheet.resize({
            columnCount: ResultsSheetDoc.columnsCount,
            rowCount: this.resultRowsCount + 1,
        });
    }

    private async loadResultCells(): Promise<void> {
        await this.sheet.loadCells({
            startRowIndex: 1,
            endRowIndex: this.resultRowsCount + 2,
            startColumnIndex: 0,
            endColumnIndex: ResultsSheetDoc.columnsCount + 1,
        });
        this.isResultCellsLoaded = true;
    }

    public setResultCellValue(columnIndex: number, rowIndex: number, value: number) {
        if (!this.isResultCellsLoaded)
            throw new Error('Result cells not loaded! Be sure to call "await resultsSheetDoc.setup();"!');
            
        const cell = this.sheet.getCell(rowIndex, columnIndex);
        cell.value = value;
    }

    private async connect(): Promise<void> {

        await this.doc.useServiceAccountAuth({
            client_email: this.config.clientEmail,
            private_key: this.config.privateKey,
        });
        
        await this.doc.loadInfo();

        console.log(`Loaded Google Sheets document "${this.doc.title}"`);
    
    }

    private async setColumnProperties(): Promise<void> {

        await this.sheet.updateDimensionProperties('COLUMNS', {
            pixelSize: ResultsSheetDoc.columnsPixelWidth,
            hiddenByUser: false,
            hiddenByFilter: false,
            developerMetadata: [],
        }, {
            startIndex: 0,
            endIndex: ResultsSheetDoc.columnsCount + 1 ,
        });

    }

    private async setSheetHeaders(): Promise<void> {

        await this.sheet.loadCells({
            startRowIndex: 0,
            endRowIndex: 1,
            startColumnIndex: 0,
            endColumnIndex: ResultsSheetDoc.columnsCount + 1,
        });
    
        for (let headerIndex in ResultsSheetDoc.columnHeaders) {
            const cell = this.sheet.getCell(0, Number.parseInt(headerIndex));
            cell.textFormat = { bold: true };
            cell.value = ResultsSheetDoc.columnHeaders[headerIndex];
        }

    }

    private async loadSheet(): Promise<void> {

        if (this.config.dateSheet)
            await this.createDatedSheet();
        else
            await this.overrideSheet();

    }

    private async createDatedSheet(): Promise<void> {

        let dateString = this.getDateString();
        let sheetThisDay = 1;
    
        let getSheetTitle = () => `${this.config.sheetTitle} ${dateString} #${sheetThisDay}`;
    
        let sheetTitle: string;
        
        while (true) {
            sheetTitle = getSheetTitle();
            if (this.doc.sheetsByTitle[sheetTitle] == undefined)
                break;
            else
                sheetThisDay++;
        }
    
        this.sheetOrNull = await this.doc.addSheet({ title: sheetTitle });

        console.log(`Created sheet "${this.sheetOrNull.title}"`);

    }

    private async overrideSheet(): Promise<void> {

        let existingSheet = this.doc.sheetsByTitle[this.config.sheetTitle];

        if (existingSheet == undefined) {
            this.sheetOrNull = await this.doc.addSheet({ title: this.config.sheetTitle });
            console.log(`Created sheet "${this.sheetOrNull.title}"`);
            return;
        }

        this.sheetOrNull = existingSheet;
        await this.sheetOrNull.clear();

        console.log(`Overwrote sheet "${this.sheetOrNull.title}"`);

    }

    private getDateString(): string {

        let now = new Date();
        let day = String(now.getDate()).padStart(2, '0');
        let month = String(now.getMonth() + 1).padStart(2, '0'); //January is 0!
        let year = now.getFullYear();
    
        return `${day}/${month}/${year}`;
    
    }

}