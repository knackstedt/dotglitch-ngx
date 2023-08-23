import { Pipe, PipeTransform, SecurityContext } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

/**
 * Url Sanitizer pipe.
 *
 * This trusts URLs that exist in a safe list defined in our environments.ts file.
 * Any other URLs will NOT be trusted, thus will not be loaded.
 */
@Pipe({
    name: 'stylebypass',
    standalone: true
})
export class StyleBypass implements PipeTransform {

    constructor(private sanitizer: DomSanitizer) { }

    public transform(url: string): SafeUrl {
        return this.sanitizer.bypassSecurityTrustStyle(url);
    }
}
