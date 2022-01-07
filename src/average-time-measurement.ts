export class AverageTimeMeasurement {

    private totalTime = 0;
    private amount = 0;

    public constructor() {
        this.clear();
    }

    public addTime(time: number, amount: number = 1) {
        this.totalTime += time;
        this.amount += amount;
    }

    public getAverageTime(): number {
        return this.totalTime / this.amount;
    }

    public clear() {
        this.totalTime = 0;
        this.amount = 0;
    }
    
}