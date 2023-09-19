import { Component, ElementRef, Input, SimpleChanges, ViewChild, ViewEncapsulation, EventEmitter, Output } from '@angular/core';
import { ColumnDefinition, Options, RowComponent, TabulatorFull as Tabulator } from 'tabulator-tables';

export type TabulatorEvent<T = any> = {
    event: any,
    row: RowComponent,
    data: T
}

@Component({
    selector: 'app-tabulator',
    templateUrl: './tabulator.component.html',
    styleUrls: [
        '../../../../../node_modules/tabulator-tables/dist/css/tabulator_simple.css',
        './tabulator.component.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    imports: [],
    standalone: true
})
export class TabulatorComponent<T = any> {
    @ViewChild("table") tableRef: ElementRef<any>;

    private _dataSource = [];
    @Input() set dataSource(data: Object[]) {
        this._dataSource = data;

        // TODO: this is performance hell for reasons I do not understand.
        if (this.table?.getDataCount() > 0) {
            (async () => {
                const container = this.table.element.querySelector(".tabulator-tableholder");
                const initialTop = container.scrollTop;
                const initialLeft = container.scrollLeft;

                await this.table.setData(data);
                // @ts-ignore
                container.scrollTo({ left: initialLeft, top: initialTop+1, behavior: "instant" });
                setTimeout(() => {
                    // @ts-ignore
                    container.scrollTo({ left: initialLeft, top: initialTop, behavior: "instant" });
                })
            })()
        }
        else
            this.table?.setData(this.dataSource);
    };
    get dataSource() { return this._dataSource };

    private _columns = [];
    @Input() set columns(data: ColumnDefinition[]) {
        this._columns = data;
        this.table?.setColumns(this.columns);
    };
    get columns() { return this._columns }

    @Input() key: string;

    @Input() options: Options = {};

    table: Tabulator;

    @Output() cellClick = new EventEmitter();
    @Output() cellDblClick = new EventEmitter();

    @Output() rowClick = new EventEmitter<TabulatorEvent<T>>();
    @Output() rowContext = new EventEmitter<TabulatorEvent<T>>();
    @Output() rowDblClick = new EventEmitter<TabulatorEvent<T>>();

    constructor() { }

    ngAfterViewInit() {

        const table = this.table = new Tabulator(this.tableRef.nativeElement, {
            index: this.key,
            data: this._dataSource,
            // reactiveData: true,
            columns: this._columns,
            layout: 'fitDataFill',
            height: "100%",
            maxHeight: window.innerHeight,
            ...this.options
        });

        table.on("rowClick", (e, row) => this.rowClick.next({ event: e, row, data: row.getData() }));
        table.on("rowContext", (e, row) => this.rowContext.next({ event: e, row, data: row.getData() }));
        table.on("rowDblClick", (e, row) => this.rowDblClick.next({ event: e, row, data: row.getData() }));

        table.on("renderComplete", () => {
            table.redraw()
        })
    }

    ngOnChanges(changes: SimpleChanges): void {

    }

}
