import { NgTemplateOutlet } from '@angular/common';
import { Component, ContentChild, ElementRef, EventEmitter, Input, Output, TemplateRef } from '@angular/core';

type CSSUnitString = 'px' | '%' | 'em' | 'in' | '';
type CSSUnit = `${number}${CSSUnitString}` | `var(--${string})`;
type CSSString = CSSUnit |
    `calc(${CSSUnit|''}${''|' '}${'+'|'-'|'/'|'*'}${''|' '}${CSSUnit|''})`

@Component({
    selector: 'ngx-parallax-card',
    templateUrl: './parallax-card.component.html',
    styleUrls: ['./parallax-card.component.scss'],
    imports: [
        NgTemplateOutlet
    ],
    host: {
        '[style.width]': 'width',
        '[style.height]': 'height',
        '[style.--card-bg-inset]': '-bgInset+"px"',
        '[style.--flip-animation-duration]': 'flipAnimationDuration+"ms"',
        '[class.flip]': 'showBackOfCard'
    },
    standalone: true
})
export class ParallaxCardComponent {

    // Front of card
    @ContentChild('content', { read: TemplateRef }) content: TemplateRef<ElementRef>;
    @ContentChild('background', { read: TemplateRef }) background: TemplateRef<ElementRef>;

    // Back of card
    @ContentChild('backContent', { read: TemplateRef }) backContent: TemplateRef<ElementRef>;
    @ContentChild('backBackground', { read: TemplateRef }) backBackground: TemplateRef<ElementRef>;

    /**
     *
     */
    @Output() loaded = new EventEmitter();

    /**
     * Width of the card
     * @default `240px`
     */
    @Input() width:  CSSString = '240px';
    /**
     * Height of the card
     * @default `320px`
     */
    @Input() height: CSSString = '320px';
    /**
     * Inset padding of the parallax
     * @default 80
     */
    @Input() bgInset:  number = 80;
    /**
     * Duration for the flip animation in ms
     * @default 80
     */
    @Input() flipAnimationDuration:  number = 1600;

    renderCardFront = true;
    renderCardBack = true;
    showBackOfCard = false;

    private get wrapper() { return this.element.nativeElement as HTMLElement; }
    private get cardFront() { return this.wrapper.querySelector('.card.front') as HTMLElement; }
    private get cardBack() { return this.wrapper.querySelector('.card.backface') as HTMLElement; }
    private get backgroundElement() { return this.cardFront.querySelector('.card-bg') as HTMLDivElement; }
    private get backfaceBackgroundElement() { return this.cardBack.querySelector('.card-bg') as HTMLDivElement; }

    private pointerX = 0;
    private pointerY = 0;
    private pointerLeave = 0;

    constructor(
        private readonly element: ElementRef
    ) { }

    ngAfterViewInit() {
        const el = this.wrapper;

        // Directly attach events to the wrapper
        el.onpointermove = (e) => this.onPointerMove(e);
        el.onpointerenter = () => this.onPointerEnter();
        el.onpointerleave = () => this.onPointerLeave();
        el.onclick = () => this.onClick();

        this.loaded.emit();
    }

    onPointerMove(e: PointerEvent) {
        const { width, height, left, top } = this.wrapper.getBoundingClientRect();
        this.pointerX = e.pageX - left - (width / 2);
        this.pointerY = e.pageY - top - (height / 2);

        this.render();
    }

    onPointerEnter() {
        clearTimeout(this.pointerLeave);
    }

    onPointerLeave() {
        this.pointerLeave = setTimeout(() => {
            this.pointerX = 0;
            this.pointerY = 0;
            this.render();
        }, 600) as any;
    }

    // TODO: This can get intercepted in some states
    onClick() {
        this.showBackOfCard = !this.showBackOfCard;
        this.render()
    }

    render = () => {
        const { width, height } = this.wrapper.getBoundingClientRect();
        const mousePX = this.pointerX / width;
        const mousePY = this.pointerY / height;

        // Rotation factors
        const rX = mousePX * this.bgInset / 1.75;
        const rY = mousePY * -this.bgInset / 1.75;

        // Translation factors
        const tX = mousePX * -this.bgInset * 2;
        const tY = mousePY * -this.bgInset * 2;

        if (this.renderCardFront) {
            this.backgroundElement.style.transform = `translateX(${tX}px) translateY(${tY}px)`;
        }
        if (this.renderCardBack) {
            this.backfaceBackgroundElement.style.transform = `translateX(${tX}px) translateY(${tY}px)`;
        }

        if (this.showBackOfCard) {
            this.cardFront.style.transform = `rotateY(180deg) rotateX(${-rY}deg)`;
            this.cardBack.style.transform = `rotateY(${-rX}deg) rotateX(${-rY}deg)`;
        }
        else {
            this.cardFront.style.transform = `rotateY(${rX}deg) rotateX(${rY}deg)`;
            this.cardBack.style.transform = `rotateY(180deg) rotateX(${-rY}deg)`;
        }
    }
}
