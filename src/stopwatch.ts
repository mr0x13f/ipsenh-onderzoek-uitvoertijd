import { performance } from "perf_hooks";

export class Stopwatch {

    private startTime = 0;
    private isRunning = false;

    private static now(): number {
        return performance.now();
    }

    public start() {
        this.startTime = Stopwatch.now();
        this.isRunning = true;
    }

    public stop(): number {
        if (!this.isRunning)
            return NaN;
        
        this.isRunning = false;
        let endTime = Stopwatch.now();
        let duration = endTime - this.startTime;
        return duration;
    }

}