import predicatesList from "friendly-words/words/predicates.txt?raw";
import objectsList from "friendly-words/words/objects.txt?raw";
import { capitalize } from "vue";

const predicates = predicatesList.split("\n");
const objects = objectsList.split("\n");

const randomUsername = (): string =>
    capitalize(random(predicates)) +
    capitalize(random(objects)) +
    randomInt(100).toString().padStart(2, "0");
export default randomUsername;
const random = <T>(arr: T[]): T => arr[randomInt(arr.length)];

const randomInt = (max: number): number => ~~(Math.random() * max);
