import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { Fetch } from '../../../public-api';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-checksum',
    templateUrl: './checksum.component.html',
    styleUrls: ['./checksum.component.scss'],
    imports: [
        MatInputModule,
        MatIconModule,
        MatButtonModule
    ],
    standalone: true
})
export class ChecksumComponent implements OnInit {

    @Input() path: string;
    @Input() digest: "md5" | "sha1" | "sha256";

    public ngxShowDistractor$ = new BehaviorSubject(true);

    constructor(
        private fetch: Fetch
    ) { }


    sum: string;
    length: number;
    name: string;
    async ngOnInit() {
        let result: any = await this.fetch.post(`/api/filesystem/checksum/${this.digest}`, { path: this.path });
        this.ngxShowDistractor$.next(false);

        this.sum = result.sum;
        this.length = result.length;
        this.name = this.path.split('/').pop();
    }

}
