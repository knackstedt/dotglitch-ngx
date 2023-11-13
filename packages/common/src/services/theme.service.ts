import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

type AppTheme = "light" | "dark";


@Injectable({
    providedIn: 'root'
})
export class ThemeService extends BehaviorSubject<AppTheme>{
    constructor() {
        super(document.body.classList.contains("light") ? "light" : "dark");

        this.subscribe(t => {
            if (!t || t as any == 'undefined') return;

            if (document.body.classList.contains("dark") && t == "light")
                document.body.classList.remove("dark");
            if (document.body.classList.contains("light") && t == "dark")
                document.body.classList.remove("light");

            document.body.classList.add(t);
        });
    }

    public setTheme(t: AppTheme) {
        this.next(t);
    }
}
