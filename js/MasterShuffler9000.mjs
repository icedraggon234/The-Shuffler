

import { pushCopies } from "./utils.mjs";

// MasterShuffler9000: Handles shuffling and combining multiple playlists
export default class MasterShuffler9000 {
    constructor(lists) {
        // Store playlists by key
        this.lists = {};
        if (lists) {
            lists.forEach(([key, list]) => {
                this.addList(list, key);
            });
        }
    }

    // Add a new playlist to the shuffler
    addList(list, key) {
        if (this.lists[key]) {
            // console.error("Key already exists");
            return;
        }
        this.lists[key] = [...list];
    }

    // Conjoin multiple lists into a single grouped list by index
    conjoinLists(key, ...lists) {
        const conjoinedList = lists.reduce((conjoinedList, list) => {
            list.forEach((item, i) => (conjoinedList[i] ??= []).push(item));
            return conjoinedList;
        }, []);
        this.lists[key] = conjoinedList;
        return conjoinedList;
    }

    // Shuffle an array in place with the option to return a copy
    randomizeArray(array, copy = false) {
        if (copy) array = [...array];
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        if (copy) return array;
    }

    // Expand a key pattern into a flat array of keys
    readKey(key) {
        // [{list: [{key: "vibes", count: 3}, {key: "fullBoss", count: 1}], count: 5}]
        const result = [];
        key.forEach(keyObject => {
            if (keyObject.key) {
                pushCopies(result, keyObject.key, keyObject.count);
            } else if (keyObject.list) {
                for (let i = 0; i < keyObject.count; i++) {
                    result.push(...this.readKey(keyObject.list));
                }
            }
        });
        return result;
    }

    // Shuffle together the playlists according to the key array
    shuffleTogether(keyArray, consistentOrder = false, avoidRepeats = true) {
        const keys = new Set(keyArray);
        const baseCopies = {};
        const working = {};

        // Prepare shuffled copies of each playlist
        keys.forEach(key => {
            baseCopies[key] = this.randomizeArray(this.lists[key], true);
            working[key] = [...baseCopies[key]];
        });

        let prevValue;
        // Build the shuffled result by pulling from each playlist in order
        const shuffled = keyArray.flatMap(key => {
            if (working[key].length === 0) {
                if (!consistentOrder) {
                    this.randomizeArray(baseCopies[key]);
                    while (
                        avoidRepeats &&
                        prevValue === baseCopies[key][0] &&
                        baseCopies[key].length > 1
                    ) {
                        // console.warn("Repeat caught, reshufling.");
                        this.randomizeArray(baseCopies[key]);
                    }
                }
                working[key] = [...baseCopies[key]];
            }
            prevValue = working[key].splice(0, 1)[0];
            return prevValue;
        });
        return shuffled;
    }
}

