function extend(base, props = {}) {
    const result = class extends base {};
    Object.defineProperties(result.prototype, props);
    return result;
}
'use strict';


import { VerticalFireball, HorizontalFireball, Vector, Fireball } from '../game';
import { expect } from 'chai';

describe('Класс VerticalFireball', () => {
    describe('Конструктор new VerticalFireball', () => {
        it('Создает экземпляр Fireball', () => {
            const ball = new VerticalFireball();

            expect(ball).to.be.an.instanceof(Fireball);
        });

        it('Имеет скорость Vector(0, 2)', () => {
            const ball = new VerticalFireball();

            expect(ball.speed).to.eql(new Vector(0, 2));
        });

        it('Имеет свойство type равное fireball', () => {
            const ball = new HorizontalFireball();

            expect(ball.type).to.equal('fireball');
        });
    });
});