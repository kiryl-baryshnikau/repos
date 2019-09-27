import { timer, interval, from, fromEvent } from 'rxjs';
import { Injectable } from '@angular/core';
import { Observable, Subject, ReplaySubject, Subscription } from 'rxjs';
import { switchMap, merge, take, takeWhile, debounceTime, delay } from 'rxjs/operators';

@Injectable()
export class DomActivityService {

    // private fields
    private idleStart$ = new ReplaySubject<any>(1);
    private idleCountdown$ = new Subject<number>();
    private idleEnd$ = new Subject<any>();
    private activity$ = new Subject<any>();
    private reset$ = new Subject<any>();
    private idleModeEntered = false;
    private globalClick$: Observable<MouseEvent>;

    init(inactivityWarningTime: number, inactivityTimeout: number, interrupts: string[] = ['click', 'mousemove', 'scroll', 'keydown']) {
        var interruptsByDomEvents$ = from([]);
        interrupts.forEach(eventName => interruptsByDomEvents$ = interruptsByDomEvents$.pipe(merge(fromEvent(document, eventName))));

        var interruptedByUser$ = this.reset$.asObservable().pipe(merge(interruptsByDomEvents$));

        var inactivityWarning$ = interval(inactivityWarningTime * 1000).pipe(takeWhile(r => !this.idleModeEntered));

        interruptsByDomEvents$
            .pipe(debounceTime(500))
            .subscribe(o => {
                if (!this.idleModeEntered) {
                    this.activity$.next();
                }
            });

        var countdownSubscription: Subscription = null;

        // subscription
        interruptedByUser$.pipe(
            switchMap(reset => inactivityWarning$)
        ).subscribe(o => {
            this.idleStart$.next(1);

            // Countdown
            if (countdownSubscription) {
                countdownSubscription.unsubscribe();
            }

            this.idleModeEntered = true;
            countdownSubscription = timer(0, 1000).pipe(
                take(inactivityTimeout)
            )
                .subscribe(iteration => {
                    var countdown = inactivityTimeout - iteration;
                    this.idleCountdown$.next(countdown);
                    if (countdown == 1) {
                        this.idleEnd$.next();
                        this.idleModeEntered = false;
                    }
                });
        });

        // start for triggering event subscriptions
        this.reset$.next();
        this.reset$.subscribe(r => { if (countdownSubscription) { countdownSubscription.unsubscribe(); } });
    }

    idleStart(): Observable<any> {
        return this.idleStart$.asObservable();
    }

    idleCountdown(): Observable<number> {
        return this.idleCountdown$.asObservable();
    }

    idleEnd(): Observable<any> {
        return this.idleEnd$.asObservable();
    }

    interrupts(): Observable<any> {
        return this.activity$.asObservable();
    }

    reset() {
        this.idleModeEntered = false;
        this.reset$.next();
    }


    // methods for click-outside directive
    globalClick(): Observable<MouseEvent> {
        if (!this.globalClick$) {
            this.globalClick$ = fromEvent<MouseEvent>(document, 'click').pipe(
                delay(1)
            );
        }

        return this.globalClick$;
    }
}
