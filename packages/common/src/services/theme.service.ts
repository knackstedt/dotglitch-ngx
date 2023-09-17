import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

type AppTheme = "light" | "dark";

@Injectable({
    providedIn: 'root'
})
export class ThemeService extends BehaviorSubject<AppTheme>{
    constructor() {
        super("dark");

        this.subscribe(t => {
            document.body.classList.remove("dark");
            document.body.classList.remove("light");
            document.body.classList.add(t);
        })
    }

    public setTheme(t: AppTheme) {
        this.next(t);
    }
}
