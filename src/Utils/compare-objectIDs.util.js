/**
 * Compares two MongoDB ObjectIDs for equality.
 *
 * This function converts both ObjectIDs to strings and checks if they are equal.
 *
 * @param {ObjectId} objectID1 - The first ObjectID to compare.
 * @param {ObjectId} objectID2 - The second ObjectID to compare.
 * @returns {boolean} Returns true if the ObjectIDs are equal, otherwise false.
*/
const compareObjectIDs = (objectID1, objectID2) => {
    return objectID1.toString() === objectID2.toString();
}

export default compareObjectIDs