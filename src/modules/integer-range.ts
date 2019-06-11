import _ from 'lodash';
import * as MathJS from 'mathjs';
import * as Utils  from 'modules/utils';
import { assert } from 'modules/debug';

/**
 * Represents a range of integers [min, max),
 * i.e. min bound is inclusive, but max bound is exclusive.
 *
 * Note that this class is immutable, create new instance if
 * you need another range bounds.
 */
export class IntegerRange {
    /**
     * Returns the number of integers, covered by this range, or `max - min`
     */
    get rangeLength() {
        return this.max - this.min;
    }

    /**
     * Represents minimum range bound (inclusive)
     */
    public readonly min: number;
    /**
     * Represents maximum range bound (exclusive)
     */
    public readonly max: number;

    public static readonly empty = new IntegerRange(0, 0);

    /**
     * Creates an instance of `IntegerRange`, rounds min and max values if those
     * have decimal parts and swaps them if min > max.
     *
     * @param min minimum range bound (inclusive)
     * @param max maximim range bound (exclusive)
     */
    constructor(min: number, max: number) {
        assert.falsy(Number.isNaN(min));
        assert.falsy(Number.isNaN(max));
        if (min > max) {
            this.min = Math.round(max);
            this.max = Math.round(min);
        } else {
            this.min = Math.round(min);
            this.max = Math.round(max);
        }
    }

    /**
     * Retuns true if suspect is integer and it goes inside this `IntegerRange`.
     * @param suspect Value to test wheter it is inside this `IntegerRange`
     */
    includes(suspect: number) {
        return Number.isInteger(suspect) && suspect >= this.min && suspect < this.max;
    }

    /**
     * Returns a random integer from the range [min, max)
     */
    random() {
        return MathJS.randomInt(this.min, this.max);
    }

    /**
     * Returns IterableIterator<number> over random unique integers
     * within this range.
     *
     * @remarks
     * Iterator's inner algorithm has O(max - min) linear memory complexity in
     * all cases, and O(1) time complexity to generate each successive random integer.
     *
     * @copyright https://stackoverflow.com/a/196065/9259330
     *
     * @param range The range of numbers genereted integers are taken from.
     * @param limit The maximum amount of numbers to generate,
     *              which is `max - min` by default
     */
    *randomUniqueIntegers(limit = this.rangeLength){
        const numbers = _.range(this.min, this.max);
        for (let i = 0; i < numbers.length && i < limit; ++i) {
            Utils.swapItems(numbers, i, MathJS.randomInt(i, numbers.length));
            yield numbers[i];
        }
    }
}
