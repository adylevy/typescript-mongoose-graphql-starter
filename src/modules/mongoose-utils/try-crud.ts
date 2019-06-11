import * as Mongoose from 'mongoose';
import * as      Vts from 'vee-type-safe';
import { ObjectId      } from 'modules/interfaces';
import { NotFoundError } from 'modules/statused-error';

export class IdNotFoundError extends NotFoundError {
    constructor(id: ObjectId, targetName = 'instance') {
        super(`no '${targetName}' was found for id '${id}'`);
    }
}


/**
 * Simple utility class that provides exception-driven mongoose CRUD functionality.
 * @param TDoc Type of target mongoose documents.
 */
export class TryCrud<TDoc extends Mongoose.Document = Mongoose.Document> {
    /**
     * Instanciates TryCrud utility class that is bound to the given `model`
     * @param model Target `Mongoose.Model` to bind to.
     */
    constructor(private readonly model: Mongoose.Model<TDoc>) {}

    /**
     * Tries to find document by `id` and call `doc.remove()`.
     *
     * @param id Id of the target document to delete.
     *
     * @throws IdNotFoundError | Error
     * If no such document was found or mongoose ODM throws an error.
     */
    async tryDeleteById(id: ObjectId) {
        const doc = await this.model.findById(id).exec();
        if (doc == null) {
            throw new IdNotFoundError(id);
        }
        return doc.remove();
    }

    /**
     * Tries to `findByIdAndUpdate()` the document.
     * Returns the updated document.
     *
     * @param id     Id of the target document to update.
     * @param update Mongoose update object.
     *
     * @throws IdNotFoundError | Error
     * If no such document was found or mongoose ODM throws an error.
     */
    async tryUpdateById(id: ObjectId, update: Vts.BasicObject) {
        const updatedDoc = await this.model
            .findByIdAndUpdate(id, update, { new: true })
            .lean()
            .exec();
        if (updatedDoc == null) {
            throw new IdNotFoundError(id);
        }
        return updatedDoc;
    }
    /**
     * Tries to `findById(id)` and returns the given result.
     *
     * @param id Target document `ObjectId` to search for.
     *
     * @throws IdNotFoundError | Error
     * If no such document was found or mongoose ODM throws an error.
     */
    async tryFindById(id: ObjectId) {
        const doc = await this.model.findById(id).lean().exec();
        if (doc == null) {
            throw new IdNotFoundError(id);
        }
        return doc;
    }

    /**
     * Tries to `findOne(queryObj)` and returns the given result.
     *
     * @param queryObj Mongoose query object.
     *
     * @throws IdNotFoundError | Error
     * If no such document was found or mongoose ODM throws an error.
     */
    async tryFindOne(queryObj: Vts.BasicObject) {
        const doc = await this.model.findOne(queryObj).lean().exec();
        if (doc == null) {
            throw new NotFoundError;
        }
        return doc;
    }
}
